import { NextRequest, NextResponse } from "next/server";
import { getRequestIdentity } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = [
  "images.pexels.com",
  "cdn.pixabay.com",
  "images.unsplash.com",
];

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const TIMEOUT_MS = 10000; // 10 s

export async function GET(req: NextRequest) {
  // 要求至少有身份（登录或游客），防止匿名滥用
  const identity = await getRequestIdentity(req);
  if (!identity.userId && !identity.guestId) {
    return NextResponse.json({ error: "需要身份验证" }, { status: 401 });
  }

  const urlParam = req.nextUrl.searchParams.get("url");
  if (!urlParam) {
    return NextResponse.json({ error: "缺少 url 参数" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlParam);
  } catch {
    return NextResponse.json({ error: "无效的 URL" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return NextResponse.json({ error: "不允许的域名" }, { status: 403 });
  }

  if (parsedUrl.protocol !== "https:") {
    return NextResponse.json({ error: "仅允许 HTTPS" }, { status: 403 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    clearTimeout(timer);

    if (!res.ok) {
      return NextResponse.json({ error: "图片获取失败" }, { status: 502 });
    }

    const contentLength = res.headers.get("Content-Length");
    if (contentLength && parseInt(contentLength, 10) > MAX_SIZE) {
      return NextResponse.json({ error: "文件过大" }, { status: 413 });
    }

    const contentType = res.headers.get("Content-Type") || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "非图片类型" }, { status: 415 });
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: "文件过大" }, { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    clearTimeout(timer);
    console.error("[proxy-image] 代理失败:", e);
    const message = e instanceof Error && e.name === "AbortError" ? "请求超时" : "代理失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
