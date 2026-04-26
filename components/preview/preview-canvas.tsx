"use client";

import React from "react";
import { Slide } from "@/core/schema/note.schema";
import { mapSlideToComponent } from "@/core/render/map-slide-to-component";
import { CARD_WIDTH, CARD_HEIGHT } from "@/core/render/card-dimensions";
import type { BackgroundType, FontScale } from "@/components/templates/shared/theme";

interface PreviewCanvasProps {
  slide: Slide;
  templateId?: string;
  backgroundType?: BackgroundType;
  pageIndex?: number;
  pageTotal?: number;
  fontScale?: FontScale;
}

export function PreviewCanvas({
  slide,
  templateId = "template-a",
  backgroundType = "solid",
  pageIndex,
  pageTotal,
  fontScale = "medium",
}: PreviewCanvasProps) {
  const [scale, setScale] = React.useState(0.3);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const padding = 32; // 留一点边距
      const scaleX = (rect.width - padding * 2) / CARD_WIDTH;
      const scaleY = (rect.height - padding * 2) / CARD_HEIGHT;
      const next = Math.max(0.05, Math.min(scaleX, scaleY));
      setScale(next);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  const component = mapSlideToComponent(slide, templateId, backgroundType, {
    pageIndex,
    pageTotal,
    fontScale,
  });

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-center justify-center overflow-hidden"
    >
      <div
        style={{
          width: CARD_WIDTH * scale,
          height: CARD_HEIGHT * scale,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {component}
        </div>
      </div>
    </div>
  );
}
