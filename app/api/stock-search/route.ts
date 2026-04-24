import { NextRequest, NextResponse } from "next/server";
import { stockSearchRequestSchema } from "@/core/schema/stock.schema";
import { searchStock } from "@/core/stock/search";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// 注意：此内存限速器仅在单实例部署下有效。
// 在 serverless / 多实例环境下，需改用 Redis 或数据库限速。
const ipCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;
let lastCleanup = Date.now();

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of ipCache) {
    if (now >= record.resetAt) ipCache.delete(key);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    const now = Date.now();
    // 定期清理过期条目（而非仅在超过 10000 时），减少内存占用
    if (now - lastCleanup > WINDOW_MS) {
      cleanupExpiredEntries();
      lastCleanup = now;
    }
    const record = ipCache.get(ip);
    if (record && now < record.resetAt && record.count >= RATE_LIMIT) {
      return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
    }
    if (!record || now >= record.resetAt) {
      ipCache.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      record.count++;
    }

    const body = await req.json();
    const result = stockSearchRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "参数校验失败", details: result.error.format() },
        { status: 400 }
      );
    }

    const { query } = result.data;
    const results = await searchStock({ query, perPage: 5 });

    return NextResponse.json({ results });
  } catch (e) {
    console.error("[stock-search] 搜索失败:", e);
    return NextResponse.json({ error: "搜索失败" }, { status: 500 });
  }
}
