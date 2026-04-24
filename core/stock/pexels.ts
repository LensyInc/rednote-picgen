import { StockSearchResult, stockSearchResultSchema } from "@/core/schema/stock.schema";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export async function searchPexels(query: string, perPage: number = 5): Promise<StockSearchResult[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey || apiKey === "your-pexels-key") {
    return [];
  }

  try {
    const url = new URL(PEXELS_API_URL);
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("orientation", "portrait");

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("[pexels] API error:", res.status, (await res.text()).slice(0, 200));
      return [];
    }

    interface PexelsPhoto {
      id: number | string;
      url?: string;
      photographer?: string;
      width?: number;
      height?: number;
      src?: { medium?: string; small?: string; original?: string; large?: string };
    }
    const data = (await res.json()) as { photos?: PexelsPhoto[] };

    return (data.photos || [])
      .map((photo) => ({
        source: "pexels" as const,
        id: String(photo.id),
        previewUrl: photo.src?.medium || photo.src?.small || photo.src?.original || "",
        fullUrl: photo.src?.large || photo.src?.original || photo.src?.medium || "",
        pageUrl: photo.url,
        author: photo.photographer,
        width: photo.width,
        height: photo.height,
      }))
      .filter((img) => Boolean(img.previewUrl && img.fullUrl))
      .filter((img) => stockSearchResultSchema.safeParse(img).success);
  } catch (e) {
    console.error("[pexels] search error:", e);
    return [];
  }
}
