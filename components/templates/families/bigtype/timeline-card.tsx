import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

export function TimelineCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="时间线" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(140) }}
          >
            {slide.title}
          </h2>

          <ol className="flex flex-1 flex-col justify-around">
            {slide.bullets.map((bullet, i) => (
              <li key={i} className="flex items-center gap-8 py-3" style={{ borderTop: `1px solid ${theme.divider}` }}>
                <span
                  className="shrink-0 font-black tabular-nums leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(88), lineHeight: 1, minWidth: 96 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="shrink-0 self-stretch" style={{ width: 2, backgroundColor: theme.divider }} />
                <p
                  className="flex-1 font-medium leading-[1.45]"
                  style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                >
                  {bullet}
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
