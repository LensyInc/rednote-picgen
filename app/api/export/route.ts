import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { s3Client, getExportBucket, getSignedDownloadUrl } from "@/core/storage/s3-client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getRequestIdentity } from "@/lib/auth-server";
import { canAccessTask } from "@/core/db/task-meta";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const exportRequestSchema = z.object({
  taskId: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  slideIndex: z.number().int().min(1).max(64),
  base64Image: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/),
});

export async function POST(req: NextRequest) {
  try {
    const identity = await getRequestIdentity(req);

    const body = await req.json();
    const parsed = exportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "参数校验失败", details: parsed.error.format() }, { status: 400 });
    }

    const { taskId, slideIndex, base64Image } = parsed.data;

    // 鉴权：游客和登录用户都可以导出，但必须有权访问该任务
    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
    }

    // base64 -> Buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "图片大小超过 5MB 限制" }, { status: 413 });
    }

    const mimeMatch = base64Image.match(/^data:(image\/(?:png|jpeg|webp));base64,/);
    const mimeType = mimeMatch?.[1] || "image/png";
    const ext = mimeType === "image/jpeg" ? "jpg" : mimeType.split("/")[1];
    const key = `exports/${taskId}/slide-${slideIndex}.${ext}`;
    const bucket = getExportBucket();
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      })
    );

    const signedUrl = await getSignedDownloadUrl(bucket, key, 3600);
    return NextResponse.json({ success: true, url: signedUrl });
  } catch (e) {
    console.error("[export] 上传失败:", e);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
