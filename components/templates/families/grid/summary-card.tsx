import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

export function SummaryCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="总结" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-5 px-20 pt-8 pb-16">
          {/* Title in accent cell */}
          <div
            className="shrink-0 px-6 py-5"
            style={{
              backgroundColor: theme.surfaceSoft,
              border: `1.5px solid ${theme.divider}`,
              borderLeft: `4px solid ${theme.primary}`,
              borderRadius: radius(theme, "lg"),
            }}
          >
            <h2
              className="font-black leading-[1.1]"
              style={{ color: theme.textStrong, fontSize: scaledPx(96) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p
                className="mt-3 font-medium leading-[1.4]"
                style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
              >
                {slide.subtitle}
              </p>
            )}
          </div>

          <div
            className="grid flex-1 gap-3"
            style={{ gridTemplateColumns: "1fr 1fr", alignContent: "start" }}
          >
            {slide.bullets.map((b, i) => (
              <GdCell key={i} theme={theme} index={i}>
                <p
                  className="font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                >
                  {b}
                </p>
              </GdCell>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
