import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";

export function CTACard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col justify-center px-20 pb-40" style={{ textAlign: slide.textAlign ?? undefined }}>
        <span
          className="mb-8 inline-block h-[6px] w-20"
          style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
        />
        <h2
          className="font-bold leading-[1.1]"
          style={{ color: theme.textStrong, fontSize: scaledPx(96) }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className="mt-8 max-w-[960px] leading-[1.45]"
            style={{ color: theme.textBody, fontSize: scaledPx(40) }}
          >
            {slide.subtitle}
          </p>
        )}

        {slide.highlight && (
          <div
            className="mt-12 inline-flex self-start items-center gap-4 px-10 py-5 font-semibold"
            style={{
              backgroundColor: theme.surfaceSoft,
              color: theme.textStrong,
              borderRadius: radius(theme, "md"),
              border: `2px solid ${theme.divider}`,
              fontSize: scaledPx(36),
            }}
          >
            {slide.highlight}
          </div>
        )}

        {slide.bullets.length > 0 && (
          <ul className="mt-12 flex flex-col gap-4">
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-4 leading-[1.4]"
                style={{ color: theme.textBody, fontSize: scaledPx(34) }}
              >
                <span
                  className="mt-3 h-3 w-3 shrink-0"
                  style={{
                    backgroundColor: theme.primary,
                    borderRadius: radius(theme, "pill"),
                  }}
                />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CardContainer>
  );
}
