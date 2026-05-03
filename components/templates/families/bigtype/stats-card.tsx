import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

function parseStat(text: string): { value: string; label: string } {
  const match = text.match(/^\s*([\d.]+\s*[%万千亿+]*|[A-Za-z$¥€]+[\d.,]+[%KMB]?)\s*[:：\-—\s]+(.+)$/);
  if (match) return { value: match[1].trim(), label: match[2].trim() };
  const split = text.indexOf("：") !== -1 ? text.split("：") : text.indexOf(":") !== -1 ? text.split(":") : null;
  if (split && split.length >= 2) return { value: split[0].trim(), label: split.slice(1).join(":").trim() };
  return { value: "", label: text };
}

export function StatsCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const items = slide.bullets.map(parseStat);
  const showValues = items.some((i) => i.value);

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="关键数据" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(120) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="font-medium leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
              {slide.subtitle}
            </p>
          )}

          {/* 数据：超大数值 + 下方小标签 */}
          <div className="flex flex-1 flex-col justify-around">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-10 py-3"
                style={{ borderTop: i === 0 ? `2px solid ${theme.primary}` : `1px solid ${theme.divider}` }}
              >
                <span
                  className="shrink-0 font-black tabular-nums leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(120), lineHeight: 1, minWidth: 240 }}
                >
                  {showValues && item.value ? item.value : `0${i + 1}`}
                </span>
                <p
                  className="flex-1 font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
