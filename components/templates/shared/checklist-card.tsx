import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

export function ChecklistCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          <Tag theme={theme} variant="soft">检查清单</Tag>
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

        <ul className="flex flex-1 flex-col gap-4">
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-center gap-6 px-8 py-6"
              style={{
                backgroundColor: theme.surface,
                borderRadius: radius(theme, "lg"),
                border: `2px solid ${theme.divider}`,
              }}
            >
              <span
                className="flex h-20 w-20 shrink-0 items-center justify-center font-black"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  borderRadius: radius(theme, "md"),
                  fontSize: scaledPx(44),
                }}
              >
                ✓
              </span>
              <span
                className="flex-1 font-medium leading-[1.35]"
                style={{ color: theme.textBody, fontSize: scaledPx(40) }}
              >
                {bullet}
              </span>
              <span
                className="font-bold tabular-nums"
                style={{ color: theme.textMuted, fontSize: scaledPx(28) }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          ))}
        </ul>

        {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
