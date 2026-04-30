import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar } from "./bt-atoms";

export function CTACard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="结尾" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col justify-center gap-10 pl-24 pr-20 pb-16">
          {/* 顶部粗线 */}
          <div style={{ height: 6, backgroundColor: theme.primary, width: "100%" }} />

          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(152) }}
          >
            {slide.title}
          </h2>

          {slide.subtitle && (
            <p
              className="max-w-[960px] font-medium leading-[1.45]"
              style={{ color: theme.textBody, fontSize: scaledPx(44) }}
            >
              {slide.subtitle}
            </p>
          )}

          {slide.highlight && (
            <span
              className="inline-block font-black"
              style={{
                color: theme.primary,
                fontSize: scaledPx(52),
                borderBottom: `4px solid ${theme.primary}`,
                paddingBottom: 4,
                alignSelf: "flex-start",
              }}
            >
              {slide.highlight}
            </span>
          )}

          {slide.bullets.length > 0 && (
            <ul className="flex flex-col gap-4 mt-2">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: theme.primary }} />
                  <span className="font-medium leading-[1.4]" style={{ color: theme.textBody, fontSize: scaledPx(36) }}>
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* 底部粗线 */}
          <div style={{ height: 6, backgroundColor: theme.primary, width: "100%" }} />
        </div>
      </div>
    </CardContainer>
  );
}
