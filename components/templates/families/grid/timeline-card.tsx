import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

export function TimelineCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="时间线" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-5 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(88) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="font-medium"
              style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
            >
              {slide.subtitle}
            </p>
          )}

          <div className="flex flex-1 flex-col gap-0">
            {slide.bullets.map((b, i) => (
              <div key={i} className="flex gap-6">
                {/* Timeline connector */}
                <div className="flex shrink-0 flex-col items-center" style={{ width: 40 }}>
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: theme.primary,
                      flexShrink: 0,
                      marginTop: 20,
                    }}
                  />
                  {i < slide.bullets.length - 1 && (
                    <div
                      className="flex-1"
                      style={{ width: 2, backgroundColor: theme.divider, minHeight: 20 }}
                    />
                  )}
                </div>

                <div className="mb-4 flex-1">
                  <GdCell theme={theme} index={i}>
                  <p
                    className="font-medium leading-[1.45]"
                    style={{ color: theme.textBody, fontSize: scaledPx(38) }}
                  >
                    {b}
                  </p>
                  </GdCell>
                </div>
              </div>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
