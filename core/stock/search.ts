import { searchPexels } from "./pexels";
import { searchPixabay } from "./pixabay";
import { StockSearchResult } from "@/core/schema/stock.schema";

export interface SearchOptions {
  query: string;
  perPage?: number;
}

/**
 * 统一素材搜索接口
 * 先搜 Pexels，不足再搜 Pixabay
 */
export async function searchStock(options: SearchOptions): Promise<StockSearchResult[]> {
  const { query, perPage = 5 } = options;

  // NOTE: searchPexels / searchPixabay 在所有错误情况下均返回 []，
  // 无法区分"无结果"与"API 故障"。未来如需区分需修改函数签名。
  let pexelsResults: StockSearchResult[] = [];
  let pixabayResults: StockSearchResult[] = [];

  try {
    pexelsResults = await searchPexels(query, perPage);
  } catch {
    // pexels 失败，尝试 pixabay
  }

  if (pexelsResults.length >= perPage) {
    return pexelsResults.slice(0, perPage);
  }

  const remaining = perPage - pexelsResults.length;

  try {
    pixabayResults = await searchPixabay(query, remaining);
  } catch {
    // pixabay 也失败
  }

  const combined = [...pexelsResults, ...pixabayResults];

  if (combined.length === 0 && query.trim()) {
    console.warn(`[search] both APIs returned 0 results for query="${query}"`);
  }

  return combined;
}
