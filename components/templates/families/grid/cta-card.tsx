import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell } from "./grid-atoms";

export function CTACard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "center" }}>
        <GdTopBar theme={theme} category="行动号召" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-20 pb-16 pt-8">
          {/* Central bordered cell */}
          <div
            className="flex w-full flex-col items-center gap-8 px-12 py-12"
            style={{
              border: `2px solid ${theme.primary}`,
              borderRadius: radius(theme, "lg"),
              backgroundColor: theme.surfaceSoft,
            }}
          >
            <h2
              className="font-black leading-[1.1] tracking-tight text-center"
              style={{ color: theme.textStrong, fontSize: scaledPx(108) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p
                className="font-medium leading-[1.45] text-center"
                style={{ color: theme.textBody, fontSize: scaledPx(42) }}
              >
                {slide.subtitle}
              </p>
            )}
            {slide.highlight && (
              <div
                className="w-full px-8 py-5"
                style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "md") }}
              >
                <p
                  className="text-center font-bold leading-[1.4]"
                  style={{ color: theme.primaryText, fontSize: scaledPx(40) }}
                >
                  {slide.highlight}
                </p>
              </div>
            )}
          </div>

          {slide.bullets.length > 0 && (
            <div
              className="grid w-full gap-3"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {slide.bullets.map((b, i) => (
                <GdCell key={i} theme={theme}>
                  <p
                    className="font-medium leading-[1.4] text-center"
                    style={{ color: theme.textBody, fontSize: scaledPx(32) }}
                  >
                    {b}
                  </p>
                </GdCell>
              ))}
            </div>
          )}
        </div>
      </div>
    </CardContainer>
  );
}
