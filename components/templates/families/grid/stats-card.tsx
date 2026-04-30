import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

function parseStat(text: string): { value: string; label: string } {
  const match = text.match(/^\s*([\d.]+\s*[%万千亿+]*|[A-Za-z$¥€]+[\d.,]+[%KMB]?)\s*[:：\-—\s]+(.+)$/);
  if (match) return { value: match[1].trim(), label: match[2].trim() };
  const split =
    text.indexOf("：") !== -1
      ? text.split("：")
      : text.indexOf(":") !== -1
        ? text.split(":")
        : null;
  if (split && split.length >= 2) return { value: split[0].trim(), label: split.slice(1).join(":").trim() };
  return { value: "", label: text };
}

export function StatsCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const items = slide.bullets.map(parseStat);
  const showValues = items.some((i) => i.value);

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="关键数据" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(96) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="font-medium"
              style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
            >
              {slide.subtitle}
            </p>
          )}

          <div
            className="grid flex-1 gap-3"
            style={{ gridTemplateColumns: "1fr 1fr", alignContent: "start" }}
          >
            {items.map((item, i) => (
              <GdCell key={i} theme={theme} index={i}>
                <div className="flex flex-col justify-between">
                <span
                  className="font-black tabular-nums leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(80) }}
                >
                  {showValues && item.value ? item.value : `0${i + 1}`}
                </span>
                <p
                  className="mt-4 font-medium leading-[1.35]"
                  style={{ color: theme.textBody, fontSize: scaledPx(34) }}
                >
                  {item.label}
                </p>
                </div>
              </GdCell>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
