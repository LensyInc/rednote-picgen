import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

export function ComparisonCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const mid = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, mid);
  const right = slide.bullets.slice(mid);
  const isAB = slide.comparisonStyle === "ab";

  const leftLabel = slide.labelLeft?.trim() || (isAB ? "方案 A" : "推荐");
  const rightLabel = slide.labelRight?.trim() || (isAB ? "方案 B" : "留意");
  const leftColor = theme.primary;
  const rightColor = isAB ? theme.accent : theme.textMuted;

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar
          theme={theme}
          category={isAB ? "对照参考" : "对比参考"}
          pageIndex={pageIndex}
          pageTotal={pageTotal}
        />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(88) }}
          >
            {slide.title}
          </h2>

          <div className="grid flex-1 gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {/* Left column */}
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: leftColor, borderRadius: radius(theme, "md") }}
              >
                <span
                  className="font-black"
                  style={{ color: theme.primaryText, fontSize: scaledPx(34) }}
                >
                  {isAB ? "A" : "✓"}
                </span>
                <span
                  className="font-bold"
                  style={{ color: theme.primaryText, fontSize: scaledPx(28) }}
                >
                  {leftLabel}
                </span>
              </div>
              {left.map((b, i) => (
                <GdCell key={i} theme={theme}>
                  <p
                    className="font-medium leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(34) }}
                  >
                    {b}
                  </p>
                </GdCell>
              ))}
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-3">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ backgroundColor: rightColor, borderRadius: radius(theme, "md") }}
              >
                <span
                  className="font-black"
                  style={{
                    color: isAB ? theme.textStrong : theme.surface,
                    fontSize: scaledPx(34),
                  }}
                >
                  {isAB ? "B" : "✕"}
                </span>
                <span
                  className="font-bold"
                  style={{
                    color: isAB ? theme.textStrong : theme.surface,
                    fontSize: scaledPx(28),
                  }}
                >
                  {rightLabel}
                </span>
              </div>
              {right.map((b, i) => (
                <GdCell key={i} theme={theme}>
                  <p
                    className="font-medium leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(34) }}
                  >
                    {b}
                  </p>
                </GdCell>
              ))}
            </div>
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
