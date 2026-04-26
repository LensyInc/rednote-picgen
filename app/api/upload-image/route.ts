import { NextRequest, NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth-server";
import { canAccessTask } from "@/core/db/task-meta";
import { s3Client, getPrivateBucket } from "@/core/storage/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function extFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function POST(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);

    const formData = await req.formData();
    const taskId = formData.get("taskId");
    const file = formData.get("file");

    if (typeof taskId !== "string" || !taskId.trim()) {
      return NextResponse.json({ error: "缺少 taskId" }, { status: 400 });
    }

    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "缺少文件" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "仅支持 JPEG、PNG、WebP、GIF 图片" },
        { status: 415 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "图片大小超过 5MB 限制" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uuid = crypto.randomUUID();
    const ext = extFromMime(file.type);
    const filename = `${uuid}.${ext}`;
    const key = `assets/${taskId}/${filename}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: getPrivateBucket(),
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({ url: `/api/assets/${taskId}/${filename}` });
  } catch (e) {
    console.error("[upload-image] 上传失败:", e);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
