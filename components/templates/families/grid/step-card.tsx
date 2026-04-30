import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdHighlight } from "./grid-atoms";

export function StepCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="步骤" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(96) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="font-medium leading-[1.4]"
              style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
            >
              {slide.subtitle}
            </p>
          )}

          <div className="flex flex-1 flex-col gap-3">
            {slide.bullets.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-5 p-5"
                style={{
                  border: `1.5px solid ${theme.divider}`,
                  borderRadius: radius(theme, "lg"),
                  backgroundColor: theme.surface,
                }}
              >
                <span
                  className="shrink-0 flex items-center justify-center font-black tabular-nums"
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: theme.primary,
                    color: theme.primaryText,
                    borderRadius: radius(theme, "md"),
                    fontSize: scaledPx(28),
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <p
                  className="flex-1 font-medium leading-[1.45] pt-2"
                  style={{ color: theme.textBody, fontSize: scaledPx(38) }}
                >
                  {b}
                </p>
              </div>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
