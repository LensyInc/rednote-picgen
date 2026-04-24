import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { NoteDocument, noteDocumentSchema } from "@/core/schema/note.schema";
import { s3Client, getPrivateBucket } from "./s3-client";

const PREFIX_DOCUMENTS = "documents/";
const PREFIX_EXPORTS = "exports/";
const PREFIX_ASSETS = "assets/";

/**
 * 保存 NoteDocument 到 R2（私有 bucket）
 */
export async function saveTaskDocument(
  document: NoteDocument
): Promise<number> {
  const result = noteDocumentSchema.safeParse(document);
  if (!result.success) {
    console.error("[task-store] 文档校验失败:", result.error.format());
    throw new Error("文档数据格式异常，无法保存");
  }
  const newVersion = (result.data.version || 0) + 1;
  const key = `${PREFIX_DOCUMENTS}${document.taskId}.json`;
  const body = JSON.stringify({ ...result.data, version: newVersion }, null, 2);
  const bucket = getPrivateBucket();

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "application/json",
    })
  );
  return newVersion;
}

/**
 * 根据 taskId 从 R2（私有 bucket）读取 NoteDocument
 */
export async function loadTaskDocument(
  taskId: string
): Promise<NoteDocument | null> {
  const key = `${PREFIX_DOCUMENTS}${taskId}.json`;
  try {
    const bucket = getPrivateBucket();
    const res = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    const body = await res.Body?.transformToString();
    if (!body) return null;

    const parsed = JSON.parse(body);
    const result = noteDocumentSchema.safeParse(parsed);
    if (!result.success) {
      console.error(`任务 ${taskId} 数据格式异常:`, result.error.format());
      throw new Error(`任务 ${taskId} 数据格式异常`);
    }
    return result.data;
  } catch (err: unknown) {
    // NoSuchKey 等错误视为不存在
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err.name === "NoSuchKey" || err.name === "NotFound")
    ) {
      return null;
    }
    console.error(`[task-store] 读取任务 ${taskId} 失败:`, err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * 获取任务的导出目录路径（逻辑路径，对应 R2 前缀）
 */
export function getExportDir(taskId: string): string {
  return `${PREFIX_EXPORTS}${taskId}`;
}

/**
 * 获取任务的素材目录路径（逻辑路径，对应 R2 前缀）
 */
export function getAssetsDir(taskId: string): string {
  return `${PREFIX_ASSETS}${taskId}`;
}

/**
 * 列出所有已保存的任务（处理 S3 分页）
 */
export async function listTasks(options?: {
  limit?: number;
  cursor?: string;
}): Promise<{ keys: string[]; nextCursor?: string }> {
  try {
    const keys: string[] = [];
    const limit = options?.limit ?? 50;
    const continuationToken: string | undefined = options?.cursor;
    const bucket = getPrivateBucket();
    const res = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: PREFIX_DOCUMENTS,
        MaxKeys: limit,
        ContinuationToken: continuationToken,
      })
    );
    for (const obj of res.Contents || []) {
      if (obj.Key?.endsWith(".json")) {
        keys.push(obj.Key.replace(PREFIX_DOCUMENTS, "").replace(".json", ""));
      }
    }
    const nextCursor = res.IsTruncated ? res.NextContinuationToken : undefined;
    return { keys, nextCursor };
  } catch (e) {
    console.error("[task-store] 列出任务失败:", e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}
