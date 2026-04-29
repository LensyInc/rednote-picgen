import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

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
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex flex-col gap-4">
          <Tag theme={theme} variant="soft">关键数据</Tag>
          <h2
            className="font-black leading-[1.08]"
            style={{ color: theme.textStrong, fontSize: scaledPx(76) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        <div className="grid flex-1 grid-cols-2 gap-6">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-center gap-3 px-8 py-8"
              style={{
                backgroundColor: theme.surface,
                borderRadius: radius(theme, "lg"),
                border: `3px solid ${theme.divider}`,
              }}
            >
              <span
                className="font-black leading-none"
                style={{ color: theme.primary, fontSize: scaledPx(80) }}
              >
                {showValues && item.value ? item.value : `0${i + 1}`}
              </span>
              <span
                className="leading-[1.35]"
                style={{ color: theme.textBody, fontSize: scaledPx(30) }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
