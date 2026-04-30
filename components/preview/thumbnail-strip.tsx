"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { cn } from "@/lib/utils";
import { mapSlideToComponent } from "@/core/render/map-slide-to-component";
import { CARD_WIDTH, CARD_HEIGHT } from "@/core/render/card-dimensions";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Copy, Trash2 } from "lucide-react";
import { CARD_TYPE_META } from "@/components/editor/card-type-meta";
import type { BackgroundType, FontScale } from "@/components/templates/themes/theme";

interface ThumbnailStripProps {
  slides: Slide[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  familyId?: string;
  themeId?: string;
  backgroundType?: BackgroundType;
  fontScale?: FontScale;
  onMove?: (from: number, to: number) => void;
  onDelete?: (index: number) => void;
  onDuplicate?: (index: number) => void;
}

function ThumbnailItem({
  slide,
  index,
  selected,
  total,
  onSelect,
  familyId,
  themeId,
  backgroundType,
  fontScale,
  onMove,
  onDelete,
  onDuplicate,
}: {
  slide: Slide;
  index: number;
  selected: boolean;
  total: number;
  onSelect: (index: number) => void;
  familyId: string;
  themeId: string;
  backgroundType: BackgroundType;
  fontScale?: FontScale;
  onMove?: (from: number, to: number) => void;
  onDelete?: (index: number) => void;
  onDuplicate?: (index: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = React.useState<number | null>(null);
  const scale = 0.12;
  const thumbW = CARD_WIDTH * scale;
  const thumbH = CARD_HEIGHT * scale;
  const component = mapSlideToComponent(slide, familyId, themeId, backgroundType, {
    pageIndex: index + 1,
    pageTotal: total,
    fontScale,
  });
  const typeLabel = CARD_TYPE_META[slide.type]?.label || slide.type;

  return (
    <div
      className={cn(
        "shrink-0 rounded-md border-2 transition-all overflow-hidden bg-card",
        selected ? "border-primary" : "border-border/40 hover:border-muted-foreground/50"
      )}
      style={{ width: thumbW }}
    >
      <button
        onClick={() => onSelect(index)}
        className="relative overflow-hidden bg-card text-left"
        style={{
          width: thumbW,
          height: thumbH,
        }}
      >
        <div
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {component}
        </div>
        <div className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">
          {index + 1}
        </div>
        <div className="absolute right-1 top-1 rounded bg-white/85 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
          {typeLabel}
        </div>
      </button>
      {(onMove || onDelete || onDuplicate) && (
        <div className="flex items-center justify-between gap-0.5 border-t bg-muted/40 px-1 py-1">
          {onMove && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={index === 0}
                onClick={() => onMove(index, index - 1)}
                title="上移"
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                disabled={index === total - 1}
                onClick={() => onMove(index, index + 1)}
                title="下移"
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </>
          )}
          <div className="flex-1" />
          {onDuplicate && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onDuplicate(index)}
              title="复制"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
          {onDelete && total > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-destructive"
              onClick={() => {
                if (confirmDelete === index) {
                  onDelete(index);
                  setConfirmDelete(null);
                } else {
                  setConfirmDelete(index);
                }
              }}
              title="删除"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
      {confirmDelete === index && (
        <div className="flex items-center gap-1 border-t bg-red-50 px-2 py-1">
          <span className="text-[10px] text-red-700 flex-1">删除第 {index + 1} 页？</span>
          <button
            className="text-[10px] font-semibold text-red-700 underline"
            onClick={() => { onDelete?.(index); setConfirmDelete(null); }}
          >确认</button>
          <button
            className="text-[10px] text-muted-foreground"
            onClick={() => setConfirmDelete(null)}
          >取消</button>
        </div>
      )}
    </div>
  );
}

export function ThumbnailStrip({
  slides,
  selectedIndex,
  onSelect,
  familyId = "classic",
  themeId = "template-a",
  backgroundType = "solid",
  fontScale,
  onMove,
  onDelete,
  onDuplicate,
}: ThumbnailStripProps) {
  const handleSelect = React.useCallback((index: number) => onSelect(index), [onSelect]);

  return (
    <div className="flex flex-col items-center gap-2 p-3">
      <div className="sticky top-0 -mx-3 -mt-3 mb-0 flex items-baseline justify-between border-b bg-card px-3 py-2 z-10">
        <h3 className="text-xs font-semibold text-muted-foreground">页面列表</h3>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          共 {slides.length} 页
        </span>
      </div>
      {slides.map((slide, index) => (
        <ThumbnailItem
          key={slide.id}
          slide={slide}
          index={index}
          total={slides.length}
          selected={selectedIndex === index}
          onSelect={handleSelect}
          familyId={familyId}
          themeId={themeId}
          backgroundType={backgroundType}
          fontScale={fontScale}
          onMove={onMove}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ))}
    </div>
  );
}
