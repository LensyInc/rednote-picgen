import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

export function QuoteCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="引言" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          {/* Quote cell with left accent */}
          <div
            className="flex flex-1 flex-col justify-center gap-8 px-8 py-8"
            style={{
              border: `1.5px solid ${theme.divider}`,
              borderLeft: `5px solid ${theme.primary}`,
              borderRadius: radius(theme, "lg"),
              backgroundColor: theme.surface,
            }}
          >
            <span
              className="font-black leading-none"
              style={{ color: theme.primary, fontSize: scaledPx(100), lineHeight: 0.8 }}
            >
              "
            </span>
            <h2
              className="font-black leading-[1.15] tracking-tight"
              style={{ color: theme.textStrong, fontSize: scaledPx(92) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p
                className="font-medium leading-[1.4]"
                style={{ color: theme.textMuted, fontSize: scaledPx(38) }}
              >
                — {slide.subtitle}
              </p>
            )}
          </div>

          {slide.bullets.length > 0 && (
            <div className="flex flex-col gap-3">
              {slide.bullets.map((b, i) => (
                <GdCell key={i} theme={theme}>
                  <p
                    className="font-medium leading-[1.45]"
                    style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                  >
                    {b}
                  </p>
                </GdCell>
              ))}
            </div>
          )}

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
