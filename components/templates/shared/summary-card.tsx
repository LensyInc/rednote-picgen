import type React from "react";
import { type CardProps, radius } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

export function SummaryCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40">
        <div className="flex flex-col gap-5">
          <Tag theme={theme} variant="soft">本篇重点</Tag>
          <h2
            className="text-[88px] font-black leading-[1.08]"
            style={{ color: theme.textStrong }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-[36px] leading-[1.4]" style={{ color: theme.textMuted }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        <ol className="flex flex-1 flex-col gap-5">
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-6 px-8 py-6"
              style={{
                backgroundColor: theme.surface,
                borderRadius: radius(theme, "lg"),
                border: `2px solid ${theme.divider}`,
                borderLeft: `10px solid ${theme.primary}`,
              }}
            >
              <span
                className="text-[44px] font-black leading-none"
                style={{ color: theme.primary }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 text-[36px] font-medium leading-[1.4]"
                style={{ color: theme.textBody }}
              >
                {bullet}
              </span>
            </li>
          ))}
        </ol>

        {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
