import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

export function ComparisonCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const mid = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, mid);
  const right = slide.bullets.slice(mid);
  const isAB = slide.comparisonStyle === "ab";

  const leftLabel = slide.labelLeft?.trim() || (isAB ? "方案 A" : "推荐方案");
  const rightLabel = slide.labelRight?.trim() || (isAB ? "方案 B" : "需留意");
  const leftMark = isAB ? "A" : "✓";
  const rightMark = isAB ? "B" : "✕";
  const leftColor = theme.primary;
  const rightColor = isAB ? theme.accent : theme.textMuted;

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
          {isAB ? "VERSUS" : "COMPARE"}
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

        {/* 两栏：细分割线分隔 */}
        <div className="flex flex-1 gap-0">
          {/* 左栏 */}
          <div className="flex flex-1 flex-col">
            {/* 列标题 */}
            <div
              className="flex items-center gap-5 py-4"
              style={{ borderBottom: `2px solid ${leftColor}` }}
            >
              <span
                className="font-black"
                style={{ color: leftColor, fontSize: scaledPx(48) }}
              >
                {leftMark}
              </span>
              <span
                className="font-bold"
                style={{ color: leftColor, fontSize: scaledPx(38) }}
              >
                {leftLabel}
              </span>
            </div>
            {/* 项目列表 */}
            <ul className="flex flex-1 flex-col">
              {left.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-5 py-5 pr-8"
                  style={{ borderBottom: `1px solid ${theme.divider}` }}
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: leftColor }}
                  />
                  <p
                    className="flex-1 font-medium leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                  >
                    {b}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* 中间分割线 */}
          <div
            className="shrink-0 self-stretch mx-4"
            style={{ width: 1, backgroundColor: theme.divider }}
          />

          {/* 右栏 */}
          <div className="flex flex-1 flex-col">
            <div
              className="flex items-center gap-5 py-4"
              style={{ borderBottom: `2px solid ${rightColor}` }}
            >
              <span
                className="font-black"
                style={{ color: rightColor, fontSize: scaledPx(48) }}
              >
                {rightMark}
              </span>
              <span
                className="font-bold"
                style={{ color: rightColor, fontSize: scaledPx(38) }}
              >
                {rightLabel}
              </span>
            </div>
            <ul className="flex flex-1 flex-col">
              {right.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-5 py-5 pl-8"
                  style={{ borderBottom: `1px solid ${theme.divider}` }}
                >
                  <span
                    className="mt-2 h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: rightColor }}
                  />
                  <p
                    className="flex-1 font-medium leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                  >
                    {b}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
