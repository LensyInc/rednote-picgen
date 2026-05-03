import { NextRequest, NextResponse } from "next/server";
import { generateRequestSchema } from "@/core/schema/request.schema";
import { generateOutline } from "@/core/llm/generate-outline";
import { generateNoteDocument } from "@/core/llm/generate-note";
import { saveTaskDocument } from "@/core/storage/task-store";
import { checkLLMAPIKey } from "@/core/llm/check-api-key";
import { getRequestIdentity, requireLogin } from "@/lib/auth-server";
import { consumeCredit, refundCredit, getUserCreditInfo } from "@/core/db/credits";
import { upsertTaskMeta } from "@/core/db/task-meta";
import { FAMILY_REGISTRY } from "@/components/templates/registry";

// 允许长时间运行（两段 LLM 调用在慢模型上可能超过 1 分钟）
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);

    // 游客禁止使用 AI 生成
    const loginCheck = requireLogin(identity);
    if (!loginCheck.ok) {
      return loginCheck.response;
    }

    const body = await req.json();
    const result = generateRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "参数校验失败", details: result.error.format() },
        { status: 400 }
      );
    }

    const data = result.data;

    // 检查 family 的 Pro 权限
    const familyMeta = FAMILY_REGISTRY[data.family];
    if (familyMeta?.requiresPro) {
      const creditInfo = await getUserCreditInfo(identity.userId!);
      if (creditInfo?.plan_type !== "pro") {
        return NextResponse.json(
          { error: "该模板仅限 Pro 会员使用" },
          { status: 403 }
        );
      }
    }

    // 检查 API Key 是否配置
    const apiKeyError = checkLLMAPIKey();
    if (apiKeyError) {
      return NextResponse.json({ error: apiKeyError }, { status: 400 });
    }

    const userId = identity.userId!;
    let consumed = false;
    const startedAt = Date.now();
    // 预生成 taskId，确保 credit_logs 中记录的 task_id 是真实的 UUID
    const taskId = crypto.randomUUID();

    try {
      console.log(
        `[generate] start topic="${data.topic}" pages=${data.pageCount} family=${data.family} theme=${data.theme}`
      );

      // 扣点
      const creditResult = await consumeCredit(userId, taskId);
      if (!creditResult.ok) {
        const errorMsg = creditResult.reason === "insufficient"
          ? "今日 AI 生成次数已用完，请明天再来或升级 Pro 会员"
          : "积分服务暂时不可用，请稍后重试";
        return NextResponse.json(
          { error: errorMsg },
          { status: creditResult.reason === "insufficient" ? 402 : 503 }
        );
      }
      consumed = true;

      if (req.signal.aborted) {
        await refundCredit(userId, taskId);
        return NextResponse.json({ error: "请求已取消" }, { status: 499 });
      }

      // 阶段 1：生成大纲
      const outline = await generateOutline(data);
      console.log(
        `[generate] outline ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
      );

      if (req.signal.aborted) {
        await refundCredit(userId, taskId);
        return NextResponse.json({ error: "请求已取消" }, { status: 499 });
      }

      // 阶段 2：补全内容
      const document = await generateNoteDocument(data, outline, taskId);
      console.log(
        `[generate] content ready in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`
      );

      // 用项目名称覆盖 meta.topic（选题主题仅用于 AI 生成，不作为显示名）
      const namedDocument = {
        ...document,
        meta: { ...document.meta, topic: data.projectName },
      };

      // 保存到 R2
      const newVersion = await saveTaskDocument(namedDocument);
      console.log(`[generate] saved taskId=${namedDocument.taskId} version=${newVersion}`);

      // 写入 PG 元数据
      await upsertTaskMeta(namedDocument, identity);

      return NextResponse.json({ ...namedDocument, version: newVersion });
    } catch (llmError) {
      if (consumed) {
        await refundCredit(userId, taskId);
      }
      const message = llmError instanceof Error ? llmError.message : String(llmError);
      const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
      console.error(`[generate] failed after ${elapsed}s:`, message);
      return NextResponse.json(
        { error: "内容生成失败", details: message },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("[generate] API error:", e);
    return NextResponse.json({ error: "生成失败" }, { status: 500 });
  }
}
