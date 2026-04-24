"use client";

import React from "react";
import { StockSearchResult } from "@/core/schema/stock.schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2 } from "lucide-react";
import { proxyImageUrl } from "@/lib/proxy-image";

interface ImageCandidatePickerProps {
  query?: string | null;
  currentImage?: StockSearchResult | null;
  onSelect: (image: StockSearchResult | null) => void;
}

export function ImageCandidatePicker({
  query,
  currentImage,
  onSelect,
}: ImageCandidatePickerProps) {
  const [candidates, setCandidates] = React.useState<StockSearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState(query || "");
  const abortRef = React.useRef<AbortController | null>(null);

  const doSearch = React.useCallback(async (q: string) => {
    if (!q.trim()) return;
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    try {
      const res = await fetch("/api/stock-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: ctrl.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.results || []);
      }
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      console.error("Search error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const shouldAutoSearch = !!query && !currentImage;
  React.useEffect(() => {
    if (!shouldAutoSearch || !query) return;
    const timer = setTimeout(() => doSearch(query), 0);
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, shouldAutoSearch, doSearch]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索图片..."
          className="flex-1 rounded-md border px-3 py-1.5 text-sm outline-none focus:border-primary"
          onKeyDown={(e) => e.key === "Enter" && doSearch(searchQuery)}
        />
        <Button size="sm" onClick={() => doSearch(searchQuery)} disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "搜索"}
        </Button>
      </div>

      {candidates.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {candidates.map((img) => (
            <button
              key={`${img.source}-${img.id}`}
              onClick={() => onSelect(img)}
              className={cn(
                "relative overflow-hidden rounded-lg border-2 transition-all",
                currentImage?.source === img.source && currentImage?.previewUrl === img.previewUrl
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-gray-300"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImageUrl(img.previewUrl)}
                alt={img.author || "candidate"}
                className="h-24 w-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5">
                <p className="text-[10px] text-white truncate">
                  {img.source}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {currentImage && (
        <div className="rounded-lg border bg-muted/30 p-2">
          <p className="text-xs text-muted-foreground mb-1">当前图片</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxyImageUrl(currentImage.previewUrl)}
            alt="current"
            className="h-20 w-full object-cover rounded-md"
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full text-xs h-7"
            onClick={() => onSelect(null)}
          >
            <ImageIcon className="mr-1 h-3 w-3" />
            移除图片
          </Button>
        </div>
      )}
    </div>
  );
}
