import { StockSearchResult, stockSearchResultSchema } from "@/core/schema/stock.schema";

const PIXABAY_API_URL = "https://pixabay.com/api/";

export async function searchPixabay(query: string, perPage: number = 5): Promise<StockSearchResult[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey || apiKey === "your-pixabay-key") {
    return [];
  }

  try {
    const url = new URL(PIXABAY_API_URL);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("orientation", "vertical");
    url.searchParams.set("image_type", "photo");

    const res = await fetch(url.toString(), {
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      console.error("[pixabay] API error:", res.status, (await res.text()).slice(0, 200));
      return [];
    }

    interface PixabayHit {
      id: number | string;
      webformatURL?: string;
      previewURL?: string;
      largeImageURL?: string;
      pageURL?: string;
      user?: string;
      imageWidth?: number;
      imageHeight?: number;
    }
    const data = (await res.json()) as { hits?: PixabayHit[] };

    return (data.hits || [])
      .map((hit) => ({
        source: "pixabay" as const,
        id: String(hit.id),
        previewUrl: hit.webformatURL || hit.previewURL || "",
        fullUrl: hit.largeImageURL || hit.webformatURL || hit.previewURL || "",
        pageUrl: hit.pageURL,
        author: hit.user,
        width: hit.imageWidth,
        height: hit.imageHeight,
      }))
      .filter((img) => Boolean(img.previewUrl && img.fullUrl))
      .filter((img) => stockSearchResultSchema.safeParse(img).success);
  } catch (e) {
    console.error("[pixabay] search error:", e);
    return [];
  }
}
