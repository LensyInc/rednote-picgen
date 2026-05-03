import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar } from "./bt-atoms";

export function QuoteCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {/* 整页左侧粗条 */}
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="金句" pageIndex={pageIndex} pageTotal={pageTotal} />

        {/* 整屏一句话 */}
        <div className="flex flex-1 flex-col justify-center pl-24 pr-20 pb-16 gap-10">
          {/* 装饰引号 */}
          <span
            className="font-black leading-none select-none"
            style={{
              fontSize: scaledPx(280),
              color: theme.primary,
              opacity: theme.mood === "dark" ? 0.5 : 0.15,
              fontFamily: "serif",
              lineHeight: 0.7,
              marginBottom: -20,
            }}
          >
            &ldquo;
          </span>

          <blockquote
            className="font-black leading-[1.06] tracking-tight"
            style={{ fontSize: scaledPx(120), color: theme.textStrong }}
          >
            {slide.title}
          </blockquote>

          {slide.bullets.length > 0 && (
            <ul className="flex flex-col gap-3 mt-4">
              {slide.bullets.map((b, i) => (
                <li key={i} className="font-medium leading-[1.4]" style={{ color: theme.textBody, fontSize: scaledPx(34) }}>
                  — {b}
                </li>
              ))}
            </ul>
          )}

          <div
            className="flex items-center gap-6 pt-6"
            style={{ borderTop: `3px solid ${theme.primary}` }}
          >
            <span
              className="font-bold"
              style={{ color: theme.primary, fontSize: scaledPx(36) }}
            >
              {slide.subtitle || "—— 写给正在努力的你"}
            </span>
          </div>

          {slide.highlight && (
            <p
              className="font-medium"
              style={{ color: theme.textMuted, fontSize: scaledPx(30), borderLeft: `4px solid ${theme.divider}`, paddingLeft: 16 }}
            >
              {slide.highlight}
            </p>
          )}
        </div>
      </div>
    </CardContainer>
  );
}
