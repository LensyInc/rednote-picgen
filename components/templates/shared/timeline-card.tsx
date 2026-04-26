import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

export function TimelineCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col gap-10 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? undefined }}>
        <div className="flex flex-col gap-4">
          <Tag theme={theme} variant="soft">时间线</Tag>
          <h2
            className="font-black leading-[1.08]"
            style={{ color: theme.textStrong, fontSize: scaledPx(72) }}
          >
            {slide.title}
          </h2>
        </div>

        <ol className="relative flex flex-1 flex-col">
          {slide.bullets.map((bullet, i) => {
            const isLast = i === slide.bullets.length - 1;
            return (
<li key={i} className="relative flex gap-8 pb-8">
                 <div className="relative flex flex-shrink-0 flex-col items-center">
                    <span
                      className="z-10 flex h-20 w-20 items-center justify-center font-black"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme.primaryText,
                        borderRadius: radius(theme, "pill"),
                        boxShadow: `0 0 0 8px ${theme.background}`,
                        fontSize: scaledPx(28),
                      }}
                    >
                     {String(i + 1).padStart(2, "0")}
                   </span>
                   {!isLast && (
                     <span
                       className="w-[6px] flex-1"
                       style={{ backgroundColor: theme.divider }}
                     />
                   )}
                 </div>
                <div
                  className="flex-1 px-8 py-5"
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: radius(theme, "lg"),
                    border: `2px solid ${theme.divider}`,
                  }}
                >
                  <div
                    className="mb-2 font-semibold tracking-wide"
                    style={{ color: theme.primary, fontSize: scaledPx(28) }}
                  >
                    第 {i + 1} 步
                  </div>
                  <p
                    className="leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                  >
                    {bullet}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {slide.highlight && <Highlight theme={theme} tone="soft">{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
