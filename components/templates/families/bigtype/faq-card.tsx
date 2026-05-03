import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";

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
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="常见问答" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          <h2
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(130) }}
          >
            {slide.title}
          </h2>

          <div className="flex flex-1 flex-col gap-6">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 py-5"
                style={{ borderTop: `1px solid ${theme.divider}` }}
              >
                <div className="flex items-start gap-5">
                  <span
                    className="shrink-0 font-black leading-none"
                    style={{ color: theme.primary, fontSize: scaledPx(56), lineHeight: 1 }}
                  >
                    Q
                  </span>
                  <p
                    className="flex-1 font-bold leading-[1.3]"
                    style={{ color: theme.textStrong, fontSize: scaledPx(40), paddingTop: 4 }}
                  >
                    {item.q}
                  </p>
                </div>
                {item.a && (
                  <div className="flex items-start gap-5">
                    <span
                      className="shrink-0 font-black leading-none"
                      style={{ color: theme.textMuted, fontSize: scaledPx(56), lineHeight: 1 }}
                    >
                      A
                    </span>
                    <p
                      className="flex-1 leading-[1.4]"
                      style={{ color: theme.textBody, fontSize: scaledPx(34), paddingTop: 6 }}
                    >
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
