import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";
import { proxyImageUrl } from "@/lib/proxy-image";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function StepCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const src = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const pos = slide.imagePosition || "top";
  const imgAlt = slide.title || "插图";

  const imgBlock = src ? (
    <div
      className="w-full shrink-0 overflow-hidden p-16"
      style={{
        height: CARD_HEIGHT * 0.25,
        borderRadius: radius(theme, "lg"),
        backgroundColor: theme.surfaceSoft,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={imgAlt} className="h-full w-full object-cover" style={{ borderRadius: radius(theme, "lg") }} />
    </div>
  ) : null;

  const headerBlock = (
    <div className="flex flex-col gap-4">
      <Tag theme={theme} variant="soft">操作步骤</Tag>
      <h2
        className="font-black leading-[1.08]"
        style={{ color: theme.textStrong, fontSize: scaledPx(72) }}
      >
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p style={{ color: theme.textMuted, fontSize: scaledPx(34) }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );

  const bulletsBlock = (
    <ol className="flex flex-1 flex-col gap-4">
      {slide.bullets.map((bullet, i) => (
        <li key={i} className="flex items-start gap-6">
          <div className="flex flex-col items-center">
            <span
              className="flex h-20 w-20 items-center justify-center font-semibold"
              style={{
                backgroundColor: theme.primary,
                color: theme.primaryText,
                borderRadius: radius(theme, "pill"),
                fontSize: scaledPx(36),
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            {i < slide.bullets.length - 1 && (
              <span
                className="mt-2 w-1 flex-1"
                style={{ backgroundColor: theme.divider, minHeight: 32 }}
              />
            )}
          </div>
          <div
            className="flex-1 px-8 py-5"
            style={{
              backgroundColor: theme.surface,
              borderRadius: radius(theme, "md"),
              border: `2px solid ${theme.divider}`,
            }}
          >
            <span
              className="leading-[1.4]"
              style={{ color: theme.textBody, fontSize: scaledPx(36) }}
            >
              {bullet}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );

  const highlightBlock = slide.highlight ? <Highlight theme={theme} tone="soft">{slide.highlight}</Highlight> : null;

  if (pos === "background" && src) {
    return (
      <CardContainer
        theme={theme}
        backgroundType={backgroundType}
        pageIndex={pageIndex}
        pageTotal={pageTotal}
        fontScale={fontScale}
      >
        <div className="relative flex h-full flex-col gap-8 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
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
          <div className="relative z-10">
            {headerBlock}
          </div>
          <div className="relative z-10">
            {bulletsBlock}
          </div>
          <div className="relative z-10">
            {highlightBlock}
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
      <div className="flex h-full flex-col gap-8 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
        {headerBlock}
        {pos === "top" && imgBlock}
        {bulletsBlock}
        {pos === "bottom" && imgBlock}
        {highlightBlock}
      </div>
    </CardContainer>
  );
}
