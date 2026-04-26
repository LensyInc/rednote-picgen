import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

export function TipsCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40" style={slide.textAlign ? { textAlign: slide.textAlign } : undefined}>
        <div className="flex flex-col gap-5">
          <Tag theme={theme} variant="soft">小贴士</Tag>
          <h2
            className="font-black leading-[1.08]"
            style={{ color: theme.textStrong, fontSize: scaledPx(80) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        <ul className="flex flex-1 flex-col gap-5">
          {slide.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-6 px-8 py-6"
              style={{
                backgroundColor: theme.surfaceSoft,
                borderRadius: radius(theme, "lg"),
                border: `2px solid ${theme.divider}`,
              }}
            >
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center font-semibold"
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryText,
                  borderRadius: radius(theme, "pill"),
                  fontSize: scaledPx(30),
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="flex-1 pt-1 font-medium leading-[1.4]"
                style={{ color: theme.textBody, fontSize: scaledPx(38) }}
              >
                {bullet}
              </span>
            </li>
          ))}
        </ul>

        {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
