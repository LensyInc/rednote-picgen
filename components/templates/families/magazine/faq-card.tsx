import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";

function splitQA(text: string): { q: string; a: string } {
  const sep = ["？", "?", "|", "——", "—"];
  for (const s of sep) {
    const idx = text.indexOf(s);
    if (idx > 0 && idx < text.length - 1) {
      const q = text.slice(0, idx + (s === "？" || s === "?" ? 1 : 0)).trim();
      const a = text.slice(idx + (s === "？" || s === "?" ? 1 : s.length)).trim();
      if (a) return { q, a };
    }
  }
  return { q: text, a: "" };
}

export function FaqCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const items = slide.bullets.map(splitQA);

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
          FAQ
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
              常见问答
            </span>
          </div>
          <h2
            className="font-black leading-[1.06] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(76) }}
          >
            {slide.title}
          </h2>
        </div>

        {/* Q&A 列表 */}
        <div className="flex flex-1 flex-col">
          {items.map((item, i) => (
            <div
              key={i}
              className="py-6"
              style={{ borderTop: `1px solid ${theme.divider}` }}
            >
              {/* 问题 */}
              <div className="flex items-start gap-6">
                <span
                  className="shrink-0 font-black leading-none"
                  style={{ color: theme.primary, fontSize: scaledPx(52), lineHeight: 1 }}
                >
                  Q
                </span>
                <p
                  className="flex-1 font-bold leading-[1.35]"
                  style={{ color: theme.textStrong, fontSize: scaledPx(38), paddingTop: 4 }}
                >
                  {item.q}
                </p>
              </div>
              {/* 回答 */}
              {item.a && (
                <div className="mt-4 flex items-start gap-6">
                  <span
                    className="shrink-0 font-black leading-none"
                    style={{ color: theme.textMuted, fontSize: scaledPx(52), lineHeight: 1 }}
                  >
                    A
                  </span>
                  <p
                    className="flex-1 leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(34), paddingTop: 6, textAlign: "justify" }}
                  >
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
