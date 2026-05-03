import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";

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
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="常见问答" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(88) }}
          >
            {slide.title}
          </h2>

          <div className="flex flex-1 flex-col gap-4">
            {items.map((item, i) => (
              <GdCell key={i} theme={theme} index={i}>
                <div className="flex flex-col gap-3">
                <div className="flex items-start gap-4">
                  <span
                    className="shrink-0 flex items-center justify-center font-black"
                    style={{
                      width: 40,
                      height: 40,
                      backgroundColor: theme.primary,
                      color: theme.primaryText,
                      borderRadius: radius(theme, "md"),
                      fontSize: scaledPx(28),
                      flexShrink: 0,
                    }}
                  >
                    Q
                  </span>
                  <p
                    className="flex-1 font-bold leading-[1.35] pt-1"
                    style={{ color: theme.textStrong, fontSize: scaledPx(36) }}
                  >
                    {item.q}
                  </p>
                </div>
                {item.a && (
                  <div className="flex items-start gap-4">
                    <span
                      className="shrink-0 flex items-center justify-center font-black"
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: theme.surfaceSoft,
                        color: theme.textMuted,
                        borderRadius: radius(theme, "md"),
                        fontSize: scaledPx(28),
                        flexShrink: 0,
                      }}
                    >
                      A
                    </span>
                    <p
                      className="flex-1 leading-[1.4] pt-1"
                      style={{ color: theme.textBody, fontSize: scaledPx(32) }}
                    >
                      {item.a}
                    </p>
                  </div>
                )}
                </div>
              </GdCell>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
