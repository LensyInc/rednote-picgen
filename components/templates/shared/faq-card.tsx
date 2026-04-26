import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

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

export function FaqCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  const items = slide.bullets.map(splitQA);

  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      <div className="flex h-full flex-col gap-8 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? undefined }}>
        <div className="flex flex-col gap-4">
          <Tag theme={theme} variant="soft">常见问答</Tag>
          <h2
            className="font-black leading-[1.08]"
            style={{ color: theme.textStrong, fontSize: scaledPx(72) }}
          >
            {slide.title}
          </h2>
        </div>

        <div className="flex flex-1 flex-col gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="px-8 py-6"
              style={{
                backgroundColor: theme.surface,
                borderRadius: radius(theme, "lg"),
                border: `2px solid ${theme.divider}`,
              }}
            >
              <div className="flex items-start gap-5">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center font-black"
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.primaryText,
                    borderRadius: radius(theme, "pill"),
                    fontSize: scaledPx(32),
                  }}
                >
                  Q
                </span>
                <p
                  className="flex-1 pt-2 font-bold leading-[1.3]"
                  style={{ color: theme.textStrong, fontSize: scaledPx(36) }}
                >
                  {item.q}
                </p>
              </div>
              {item.a && (
                <div className="mt-4 flex items-start gap-5">
                  <span
                    className="flex h-14 w-14 shrink-0 items-center justify-center font-black"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.textStrong,
                      borderRadius: radius(theme, "pill"),
                      fontSize: scaledPx(32),
                    }}
                  >
                    A
                  </span>
                  <p
                    className="flex-1 pt-2 leading-[1.4]"
                    style={{ color: theme.textBody, fontSize: scaledPx(32) }}
                  >
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {slide.highlight && <Highlight theme={theme} tone="soft">{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
