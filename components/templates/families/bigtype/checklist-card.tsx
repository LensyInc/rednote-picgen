import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

export function ChecklistCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="检查清单" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(140) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="font-medium leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(36) }}>
              {slide.subtitle}
            </p>
          )}

          <ul className="flex flex-1 flex-col justify-around">
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-center gap-8 py-4"
                style={{ borderTop: `1px solid ${theme.divider}` }}
              >
                {/* 大方框 */}
                <span
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 56,
                    height: 56,
                    border: `3px solid ${theme.primary}`,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                />
                <p
                  className="flex-1 font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(42) }}
                >
                  {b}
                </p>
              </li>
            ))}
          </ul>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
