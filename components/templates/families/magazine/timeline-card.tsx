import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function TimelineCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          TIMELINE
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col gap-8 px-20 py-14"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 标题 */}
        <div className="flex flex-col gap-4">
          <div className="h-[5px] w-24" style={{ backgroundColor: theme.primary }} />
          <h2
            className="font-black leading-[1.06] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(76) }}
          >
            {slide.title}
          </h2>
        </div>

        {/* 时间线 */}
        <ol className="relative flex flex-1 flex-col pl-14">
          {/* 纵向主线 */}
          <div
            className="absolute bottom-0 left-0 top-0 ml-[22px]"
            style={{ width: 1, backgroundColor: theme.divider }}
          />

          {slide.bullets.map((bullet, i) => (
            <li key={i} className="relative flex items-start gap-8 pb-6">
              {/* 时间线节点 */}
              <div
                className="absolute -left-14 top-3 z-10 flex items-center justify-center"
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: i === 0 ? theme.primary : theme.background,
                  border: `2px solid ${theme.primary}`,
                }}
              />

              {/* 内容 */}
              <div className="flex flex-1 items-start gap-8 py-2">
                <span
                  className="shrink-0 font-black tabular-nums leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(40), lineHeight: 1.2, minWidth: 48 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p
                  className="flex-1 font-medium leading-[1.45]"
                  style={{ color: theme.textBody, fontSize: scaledPx(38), textAlign: "justify" }}
                >
                  {bullet}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
