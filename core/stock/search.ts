import { searchPexels } from "./pexels";
import { searchPixabay } from "./pixabay";
import { StockSearchResult } from "@/core/schema/stock.schema";

export interface SearchOptions {
  query: string;
  perPage?: number;
}

/**
 * 统一素材搜索接口
 * 并行搜索 Pexels 和 Pixabay，合并去重后返回
 */
export async function searchStock(options: SearchOptions): Promise<StockSearchResult[]> {
  const { query, perPage = 5 } = options;

  const [pexelsResults, pixabayResults] = await Promise.all([
    searchPexels(query, perPage).catch((): StockSearchResult[] => []),
    searchPixabay(query, perPage).catch((): StockSearchResult[] => []),
  ]);

  const seen = new Set<string>();
  const combined: StockSearchResult[] = [];
  for (const item of [...pexelsResults, ...pixabayResults]) {
    const key = `${item.source}-${item.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
    if (combined.length >= perPage) break;
  }

  // 随机打乱结果顺序，让每次搜索的体验不同
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  if (combined.length === 0 && query.trim()) {
    console.warn(`[search] both APIs returned 0 results for query="${query}"`);
  }

  return combined;
}
