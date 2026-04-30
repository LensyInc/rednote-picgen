import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

export function ComparisonCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const mid = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, mid);
  const right = slide.bullets.slice(mid);
  const isAB = slide.comparisonStyle === "ab";

  const leftLabel = slide.labelLeft?.trim() || (isAB ? "方案 A" : "推荐");
  const rightLabel = slide.labelRight?.trim() || (isAB ? "方案 B" : "留意");
  const leftMark = isAB ? "A" : "✓";
  const rightMark = isAB ? "B" : "✕";
  const leftColor = theme.primary;
  const rightColor = isAB ? theme.accent : theme.textMuted;

  const Column = ({
    mark, label, color, items,
  }: { mark: string; label: string; color: string; items: string[] }) => (
    <div className="flex flex-1 flex-col gap-6">
      {/* 超大标记 */}
      <div className="flex items-baseline gap-5">
        <span
          className="font-black leading-none"
          style={{ color, fontSize: scaledPx(160), lineHeight: 1 }}
        >
          {mark}
        </span>
        <span
          className="font-bold"
          style={{ color, fontSize: scaledPx(40) }}
        >
          {label}
        </span>
      </div>
      <ul className="flex flex-1 flex-col gap-4">
        {items.map((b, i) => (
          <li key={i} className="flex items-start gap-4">
            <span
              className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <p
              className="flex-1 font-medium leading-[1.4]"
              style={{ color: theme.textBody, fontSize: scaledPx(34) }}
            >
              {b}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category={isAB ? "对照参考" : "对比参考"} pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 pl-24 pr-20 pb-16">
          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(100) }}
          >
            {slide.title}
          </h2>

          <div className="flex flex-1 gap-0">
            <Column mark={leftMark} label={leftLabel} color={leftColor} items={left} />
            <div className="mx-8 self-stretch" style={{ width: 1, backgroundColor: theme.divider }} />
            <Column mark={rightMark} label={rightLabel} color={rightColor} items={right} />
          </div>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
