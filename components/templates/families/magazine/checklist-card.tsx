import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function ChecklistCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          CHECKLIST
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
            <span className="h-[3px] w-12 shrink-0" style={{ backgroundColor: theme.primary }} />
            <span className="font-bold tracking-widest" style={{ color: theme.primary, fontSize: scaledPx(26) }}>
              检查清单
            </span>
          </div>
          <h2
            className="font-black leading-[1.06] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(76) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>{slide.subtitle}</p>
          )}
        </div>

        {/* Checklist 项 */}
        <ul className="flex flex-1 flex-col">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="flex items-center gap-8 py-5"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            >
              {/* 方框 */}
              <span
                className="shrink-0 flex items-center justify-center"
                style={{
                  width: 48,
                  height: 48,
                  border: `2px solid ${theme.primary}`,
                  borderRadius: 4,
                }}
              />
              <p
                className="flex-1 font-medium leading-[1.4]"
                style={{ color: theme.textBody, fontSize: scaledPx(40) }}
              >
                {b}
              </p>
            </li>
          ))}
        </ul>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
