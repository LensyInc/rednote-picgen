import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Highlight } from "./atoms";
import { proxyImageUrl } from "@/lib/proxy-image";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function TextImageCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const src = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col">
        <div className="relative w-full shrink-0 overflow-hidden px-16 pt-16"
          style={{ height: CARD_HEIGHT * 0.47 }}
        >
          <div
            className="relative h-full w-full overflow-hidden"
            style={{
              borderRadius: radius(theme, "lg"),
              backgroundColor: theme.surfaceSoft,
            }}
          >
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt={slide.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ color: theme.textMuted, fontSize: scaledPx(48) }}
              >
                图片加载中…
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-7 px-20 pt-10 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
          <div>
            <h2
              className="font-extrabold leading-[1.1]"
              style={{ color: theme.textStrong, fontSize: scaledPx(64) }}
            >
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="mt-3" style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
                {slide.subtitle}
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-4">
            {/* 图文页设计约束：最多展示 3 条 bullets，超出部分静默截断 */}
            {slide.bullets.slice(0, 3).map((bullet, i) => (
              <li key={i} className="flex items-start gap-5">
                <span
                  className="mt-3 h-4 w-4 shrink-0"
                  style={{
                    backgroundColor: theme.primary,
                    borderRadius: radius(theme, "pill"),
                  }}
                />
                <span
                  className="leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                >
                  {bullet}
                </span>
              </li>
            ))}
          </ul>

          {slide.highlight && <Highlight theme={theme} tone="soft">{slide.highlight}</Highlight>}
        </div>
      </div>
    </CardContainer>
  );
}
