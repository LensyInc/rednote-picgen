import type React from "react";
import { type CardProps, radius } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

export function ChecklistCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40">
        <div className="flex flex-col gap-4">
          <Tag theme={theme} variant="soft">检查清单</Tag>
          <h2
            className="text-[76px] font-black leading-[1.08]"
            style={{ color: theme.textStrong }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-[34px]" style={{ color: theme.textMuted }}>
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
                className="flex h-20 w-20 shrink-0 items-center justify-center text-[44px] font-black"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  borderRadius: radius(theme, "md"),
                }}
              >
                ✓
              </span>
              <span
                className="flex-1 text-[40px] font-medium leading-[1.35]"
                style={{ color: theme.textBody }}
              >
                {bullet}
              </span>
              <span
                className="text-[28px] font-bold tabular-nums"
                style={{ color: theme.textMuted }}
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
