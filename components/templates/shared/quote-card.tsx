import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";

export function QuoteCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      <div className="flex h-full flex-col justify-center px-20 pb-40" style={{ textAlign: slide.textAlign ?? undefined }}>
        <span
          className="font-black leading-[0.8]"
          style={{
            fontSize: scaledPx(360),
            color: theme.primary,
            opacity: theme.mood === "dark" ? 0.6 : 0.18,
            fontFamily: theme.font === "wenkai" ? "var(--font-wenkai), serif" : "serif",
          }}
        >
          “
        </span>
        <blockquote
          className="-mt-24 max-w-[1000px] font-extrabold leading-[1.15]"
          style={{ fontSize: scaledPx(88), color: theme.textStrong }}
        >
          {slide.title}
        </blockquote>

        {slide.bullets.length > 0 && (
          <ul className="mt-12 flex flex-col gap-4">
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="leading-[1.4]"
                style={{ fontSize: scaledPx(34), color: theme.textBody }}
              >
                — {b}
              </li>
            ))}
          </ul>
        )}

        <div
          className="mt-14 flex items-center gap-6"
          style={{ color: theme.textMuted }}
        >
          <span
            className="h-[4px] w-16"
            style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
          />
          <span className="font-semibold" style={{ fontSize: scaledPx(36), color: theme.primary }}>
            {slide.subtitle || "—— 写给正在努力的你"}
          </span>
        </div>

        {slide.highlight && (
          <div
            className="mt-10 inline-flex self-start px-8 py-4 font-medium"
            style={{
              fontSize: scaledPx(32),
              backgroundColor: theme.surfaceSoft,
              color: theme.textStrong,
              borderRadius: radius(theme, "md"),
              border: `2px solid ${theme.divider}`,
            }}
          >
            {slide.highlight}
          </div>
        )}
      </div>
    </CardContainer>
  );
}
