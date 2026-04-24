import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env: ${key}`);
  return val;
}

let _s3Client: S3Client | null = null;
let _privateBucket = "";
let _exportBucket = "";

function initS3() {
  if (_s3Client) return;
  _s3Client = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
  _privateBucket = requireEnv("R2_PRIVATE_BUCKET_NAME");
  _exportBucket = requireEnv("R2_EXPORT_BUCKET_NAME");
}

export const s3Client = new Proxy({} as S3Client, {
  get(_, prop) {
    initS3();
    return Reflect.get(_s3Client!, prop);
  },
});

export function getPrivateBucket(): string {
  initS3();
  return _privateBucket;
}

export function getExportBucket(): string {
  initS3();
  return _exportBucket;
}

export async function getSignedDownloadUrl(
  bucket: string,
  key: string,
  expiresIn = 3600
): Promise<string> {
  initS3();
  const knownBuckets = new Set([getPrivateBucket(), getExportBucket()]);
  if (!knownBuckets.has(bucket)) {
    throw new Error(`Unknown bucket: ${bucket}`);
  }
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  return getSignedUrl(_s3Client!, command, { expiresIn });
}
