import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function TipsCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          TIPS
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col gap-8 px-20 py-14"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 标题 */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-6">
            <span
              className="h-[3px] w-12 shrink-0"
              style={{ backgroundColor: theme.primary }}
            />
            <span
              className="font-bold tracking-widest"
              style={{ color: theme.primary, fontSize: scaledPx(26) }}
            >
              小贴士
            </span>
          </div>
          <h2
            className="font-black leading-[1.06] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(80) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* Tips 列表：左侧大数字 + 右侧文字 */}
        <ol className="flex flex-1 flex-col gap-2">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-8 py-4"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            >
              <span
                className="shrink-0 font-black leading-none tabular-nums"
                style={{
                  color: theme.primary,
                  fontSize: scaledPx(88),
                  lineHeight: 1,
                  opacity: 0.8,
                  minWidth: 80,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                className="flex-1 font-medium leading-[1.45]"
                style={{ color: theme.textBody, fontSize: scaledPx(38), textAlign: "justify", paddingTop: 8 }}
              >
                {b}
              </p>
            </li>
          ))}
        </ol>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
