import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function StepCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          STEP BY STEP
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col gap-8 px-20 py-14"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 标题 */}
        <div className="flex flex-col gap-4">
          <div
            className="h-[5px] w-24"
            style={{ backgroundColor: theme.primary }}
          />
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

        {/* 步骤列表 */}
        <ol className="relative flex flex-1 flex-col">
          {slide.bullets.map((step, i) => {
            const isLast = i === slide.bullets.length - 1;
            return (
              <li key={i} className="relative flex items-start gap-8 py-5" style={{ borderTop: `1px solid ${theme.divider}` }}>
                {/* 序号列 */}
                <div className="relative flex flex-col items-center" style={{ minWidth: 64 }}>
                  <span
                    className="font-black leading-none tabular-nums"
                    style={{ color: theme.primary, fontSize: scaledPx(68), lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {!isLast && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{
                        top: scaledPx(68),
                        bottom: -20,
                        width: 1,
                        backgroundColor: theme.divider,
                      }}
                    />
                  )}
                </div>

                {/* 步骤文字 */}
                <p
                  className="flex-1 font-medium leading-[1.45]"
                  style={{ color: theme.textBody, fontSize: scaledPx(38), textAlign: "justify" }}
                >
                  {step}
                </p>
              </li>
            );
          })}
        </ol>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
