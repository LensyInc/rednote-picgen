import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Highlight } from "./atoms";
import { proxyImageUrl } from "@/lib/proxy-image";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function TextImageCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const src = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const pos = slide.imagePosition || "top";
  const imgAlt = slide.title || "插图";

  const imgBlock = src ? (
    <div
      className="relative w-full shrink-0 overflow-hidden px-16 pt-16"
      style={{ height: CARD_HEIGHT * 0.47 }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: radius(theme, "lg"),
          backgroundColor: theme.surfaceSoft,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={imgAlt} className="h-full w-full object-cover" />
      </div>
    </div>
  ) : (
    <div
      className="relative w-full shrink-0 overflow-hidden px-16 pt-16"
      style={{ height: CARD_HEIGHT * 0.47 }}
    >
      <div
        className="relative h-full w-full flex items-center justify-center"
        style={{
          borderRadius: radius(theme, "lg"),
          backgroundColor: theme.surfaceSoft,
          color: theme.textMuted,
          fontSize: scaledPx(48),
        }}
      >
        图片加载中…
      </div>
    </div>
  );

  const contentBlock = (
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
  );

  if (pos === "background" && src) {
    return (
      <CardContainer
        theme={theme}
        backgroundType={backgroundType}
        pageIndex={pageIndex}
        pageTotal={pageTotal}
        fontScale={fontScale}
      >
        <div className="relative flex h-full flex-col">
          <div className="absolute inset-0 flex items-center justify-center px-16 py-16">
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                borderRadius: radius(theme, "lg"),
                backgroundColor: theme.surfaceSoft,
                opacity: 0.18,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={imgAlt} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="relative z-10 flex flex-1 flex-col gap-7 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
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

  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col">
        {(pos === "top" || pos === undefined) && imgBlock}
        {contentBlock}
        {pos === "bottom" && imgBlock}
      </div>
    </CardContainer>
  );
}
