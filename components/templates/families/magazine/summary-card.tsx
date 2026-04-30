import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function SummaryCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          SUMMARY
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col gap-10 px-20 py-14"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 标题区 */}
        <div className="flex flex-col gap-5">
          <div
            className="h-[5px] w-24"
            style={{ backgroundColor: theme.primary }}
          />
          <h2
            className="font-black leading-[1.06] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(84) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* 要点列表 */}
        <ol className="flex flex-1 flex-col">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-8 py-6"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            >
              <span
                className="shrink-0 font-black leading-none tabular-nums"
                style={{ color: theme.primary, fontSize: scaledPx(72), lineHeight: 1, paddingTop: 2 }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                className="flex-1 font-medium leading-[1.45]"
                style={{ color: theme.textBody, fontSize: scaledPx(40), textAlign: "justify" }}
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
