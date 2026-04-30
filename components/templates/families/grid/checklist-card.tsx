import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx, withAlpha } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

export function ChecklistCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="检查清单" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(96) }}
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

          <div
            className="grid flex-1 gap-3"
            style={{ gridTemplateColumns: "1fr 1fr", alignContent: "start" }}
          >
            {slide.bullets.map((b, i) => (
              <GdCell key={i} theme={theme} index={i}>
                <div className="flex items-start gap-4">
                <span
                  className="shrink-0 flex items-center justify-center font-black"
                  style={{
                    width: 36,
                    height: 36,
                    backgroundColor: withAlpha(theme.primary, 0.12),
                    color: theme.primary,
                    border: `2px solid ${theme.primary}`,
                    borderRadius: radius(theme, "sm"),
                    fontSize: scaledPx(26),
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  ✓
                </span>
                <p
                  className="flex-1 font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(34) }}
                >
                  {b}
                </p>
                </div>
              </GdCell>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
