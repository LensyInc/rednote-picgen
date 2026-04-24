/**
 * 将外部图片 URL 转换为本地代理 URL，避免 html-to-image 跨域污染 canvas。
 * 如果已经是同域或 blob/data URL，则原样返回。
 */
export function proxyImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  // 已经是同域代理、data URL 或 blob URL，直接返回
  if (url.startsWith("/api/proxy-image") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  // 绝对路径也原样返回（通常用于本地 assets）
  if (url.startsWith("/")) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}
