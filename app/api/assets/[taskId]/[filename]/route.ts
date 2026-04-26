import { NextRequest, NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth-server";
import { canAccessTask } from "@/core/db/task-meta";
import { s3Client, getPrivateBucket } from "@/core/storage/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string; filename: string }> }
) {
  try {
    const identity = await getRequestIdentity(req);
    const { taskId, filename } = await params;

    const hasAccess = await canAccessTask(taskId, identity);
    if (!hasAccess) {
      return NextResponse.json({ error: "无权访问此任务" }, { status: 403 });
    }

    const key = `assets/${taskId}/${filename}`;
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: getPrivateBucket(),
        Key: key,
      })
    );

    if (!res.Body) {
      return NextResponse.json({ error: "文件不存在" }, { status: 404 });
    }

    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const contentType = EXT_TO_MIME[ext] || "application/octet-stream";

    const byteArray = await res.Body.transformToByteArray();
    const buffer = Buffer.from(byteArray);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (e) {
    console.error("[assets] 读取失败:", e);
    return NextResponse.json({ error: "读取失败" }, { status: 500 });
  }
}
