import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagPageBadge } from "./mag-atoms";

export function QuoteCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {/* 顶部编辑栏 */}
      <div
        className="flex shrink-0 items-center justify-between px-20 py-8"
        style={{ borderBottom: `1px solid ${theme.divider}` }}
      >
        <span
          className="font-bold tracking-widest"
          style={{ color: theme.primary, fontSize: scaledPx(26), letterSpacing: "0.12em" }}
        >
          QUOTE
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col justify-center px-20 pb-20"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 装饰性引号 */}
        <span
          className="font-black leading-none"
          style={{
            fontSize: scaledPx(360),
            color: theme.primary,
            opacity: theme.mood === "dark" ? 0.5 : 0.12,
            fontFamily: "serif",
            lineHeight: 0.7,
            marginBottom: -40,
          }}
        >
          &ldquo;
        </span>

        {/* 引用文字 */}
        <blockquote
          className="font-black leading-[1.12] tracking-tight"
          style={{ fontSize: scaledPx(88), color: theme.textStrong, maxWidth: 1000 }}
        >
          {slide.title}
        </blockquote>

        {/* 注释 */}
        {slide.bullets.length > 0 && (
          <ul className="mt-10 flex flex-col gap-3">
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="leading-[1.4]"
                style={{ fontSize: scaledPx(34), color: theme.textBody }}
              >
                — {b}
              </li>
            ))}
          </ul>
        )}

        {/* 署名 */}
        <div
          className="mt-12 flex items-center gap-8"
          style={{ borderTop: `1px solid ${theme.divider}`, paddingTop: 24 }}
        >
          <span
            className="font-semibold"
            style={{ color: theme.primary, fontSize: scaledPx(36) }}
          >
            {slide.subtitle || "—— 写给正在努力的你"}
          </span>
        </div>

        {slide.highlight && (
          <div
            className="mt-10 inline-flex self-start px-8 py-4 font-medium"
            style={{
              fontSize: scaledPx(32),
              color: theme.textMuted,
              borderLeft: `3px solid ${theme.primary}`,
              paddingLeft: 16,
            }}
          >
            {slide.highlight}
          </div>
        )}
      </div>
    </CardContainer>
  );
}
