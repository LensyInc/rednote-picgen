import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveTaskDocument, loadTaskDocument, CONFLICT_ERROR } from "@/core/storage/task-store";
import { noteDocumentSchema } from "@/core/schema/note.schema";
import { getRequestIdentity } from "@/lib/auth-server";
import { upsertTaskMeta, checkTaskAccess } from "@/core/db/task-meta";
import { getUserCreditInfo } from "@/core/db/credits";
import { FAMILY_REGISTRY } from "@/components/templates/registry";

export const dynamic = "force-dynamic";

const taskIdSchema = z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/);

export async function POST(req: NextRequest) {
  let taskId: string | undefined;
  try {
    const identity = await getRequestIdentity(req);
    const body = await req.json();
    taskId = body.taskId;
    const rawDocument = body.document;

    if (!taskId || !rawDocument) {
      return NextResponse.json(
        { error: "缺少 taskId 或 document" },
        { status: 400 }
      );
    }

    const taskIdResult = taskIdSchema.safeParse(taskId);
    if (!taskIdResult.success) {
      return NextResponse.json({ error: "taskId 格式无效" }, { status: 400 });
    }

    // 校验文档结构
    const parseResult = noteDocumentSchema.safeParse(rawDocument);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "文档结构校验失败", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    // 确保 taskId 匹配
    if (parseResult.data.taskId !== taskId) {
      return NextResponse.json(
        { error: "taskId 不匹配" },
        { status: 400 }
      );
    }

    // 检查 family 的 Pro 权限
    const familyMeta = FAMILY_REGISTRY[parseResult.data.theme.family];
    if (familyMeta?.requiresPro) {
      if (!identity.isLoggedIn || !identity.userId) {
        return NextResponse.json({ error: "该模板仅限 Pro 会员使用" }, { status: 403 });
      }
      const creditInfo = await getUserCreditInfo(identity.userId);
      if (creditInfo?.plan_type !== "pro") {
        return NextResponse.json({ error: "该模板仅限 Pro 会员使用" }, { status: 403 });
      }
    }

    // 鉴权 + 乐观锁
    const access = await checkTaskAccess(taskId, identity);
    if (access === "forbidden") {
      return NextResponse.json(
        { error: "无权保存此任务" },
        { status: 403 }
      );
    }

    // 如果任务已存在且客户端携带了 version，做乐观锁校验
    if (access === "allowed") {
      const clientVersion = body.version;
      if (typeof clientVersion === "number") {
        const currentDoc = await loadTaskDocument(taskId);
        if (currentDoc && currentDoc.version !== clientVersion) {
          return NextResponse.json(
            { error: "文档已被修改，请刷新后重试", currentVersion: currentDoc.version },
            { status: 409 }
          );
        }
      }
    }

    const newVersion = await saveTaskDocument(parseResult.data, {
      expectedVersion: access === "allowed" && typeof body.version === "number" ? body.version : undefined,
    });

    // 写入/更新 PG 元数据
    await upsertTaskMeta(parseResult.data, identity);

    return NextResponse.json({ success: true, version: newVersion });
  } catch (e) {
    if (e instanceof Error && e.message === CONFLICT_ERROR) {
      // saveTaskDocument 乐观锁冲突（TOCTOU 窗口），返回当前版本
      let currentVersion: number | undefined;
      try {
        const currentDoc = await loadTaskDocument(taskId!);
        currentVersion = currentDoc?.version;
      } catch {}
      return NextResponse.json(
        { error: "文档已被修改，请刷新后重试", currentVersion },
        { status: 409 }
      );
    }
    console.error("[save-document] 保存失败:", e);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
