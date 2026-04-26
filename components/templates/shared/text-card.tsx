import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { SectionTitle, NumberBadge, Highlight } from "./atoms";

export function TextCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? undefined }}>
        <div className="flex items-start gap-6">
          <span
            className="mt-3 h-[72px] w-[14px] shrink-0"
            style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
          />
          <div>
            <SectionTitle theme={theme} underline={false}>
              {slide.title}
            </SectionTitle>
            {slide.subtitle && (
              <p className="mt-4 leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(36) }}>
                {slide.subtitle}
              </p>
            )}
          </div>
        </div>

        <ul className="flex flex-1 flex-col gap-6">
          {slide.bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-6">
              <NumberBadge theme={theme} index={i + 1} />
              <span
                className="flex-1 pt-2 font-medium leading-[1.45]"
                style={{ color: theme.textBody, fontSize: scaledPx(40) }}
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
