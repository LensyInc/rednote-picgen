import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

export function SummaryCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="重点总结" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-10 pl-24 pr-20 pb-16">
          <div className="flex flex-col gap-6">
            <h2
              className="font-black leading-[1.0] tracking-tight"
              style={{ color: theme.textStrong, fontSize: scaledPx(148) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="font-medium leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(38) }}>
                {slide.subtitle}
              </p>
            )}
          </div>

          <ol className="flex flex-1 flex-col gap-6">
            {slide.bullets.map((b, i) => (
              <li key={i} className="flex items-baseline gap-6">
                <span
                  className="shrink-0 font-black tabular-nums leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(52), lineHeight: 1 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="flex-1 font-medium leading-[1.45]"
                  style={{ color: theme.textBody, fontSize: scaledPx(38) }}
                >
                  {b}
                </p>
              </li>
            ))}
          </ol>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
