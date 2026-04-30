import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

function parseStat(text: string): { value: string; label: string } {
  const match = text.match(/^\s*([\d.]+\s*[%万千亿+]*|[A-Za-z$¥€]+[\d.,]+[%KMB]?)\s*[:：\-—\s]+(.+)$/);
  if (match) return { value: match[1].trim(), label: match[2].trim() };
  const split = text.indexOf("：") !== -1 ? text.split("：") : text.indexOf(":") !== -1 ? text.split(":") : null;
  if (split && split.length >= 2) return { value: split[0].trim(), label: split.slice(1).join(":").trim() };
  return { value: "", label: text };
}

export function StatsCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const items = slide.bullets.map(parseStat);
  const showValues = items.some((i) => i.value);

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
          DATA
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
              关键数据
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

        {/* 数据列表 —— 每项横排：大数值 | 细线 | 标签说明 */}
        <div className="flex flex-1 flex-col">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-8 py-6"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            >
              <span
                className="shrink-0 font-black leading-none tabular-nums"
                style={{ color: theme.primary, fontSize: scaledPx(96), lineHeight: 1, minWidth: 220 }}
              >
                {showValues && item.value ? item.value : `0${i + 1}`}
              </span>
              <div
                className="shrink-0 self-stretch"
                style={{ width: 1, backgroundColor: theme.divider }}
              />
              <p
                className="flex-1 font-medium leading-[1.4]"
                style={{ color: theme.textBody, fontSize: scaledPx(36) }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
