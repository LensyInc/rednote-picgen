import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { SectionTitle, NumberBadge, Highlight } from "./atoms";
import { proxyImageUrl } from "@/lib/proxy-image";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function TextCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const src = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!src;
  const pos = slide.imagePosition || "top";

  const imgBlock = hasImage ? (
    <div
      className="relative w-full shrink-0 overflow-hidden p-16"
      style={{ height: CARD_HEIGHT * 0.35 }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ borderRadius: radius(theme, "lg"), backgroundColor: theme.surfaceSoft }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={slide.title || "插图"} className="h-full w-full object-cover" />
      </div>
    </div>
  ) : null;

  if (pos === "background" && hasImage) {
    return (
      <CardContainer theme={theme} backgroundType={backgroundType} pageIndex={pageIndex} pageTotal={pageTotal} fontScale={fontScale}>
        <div className="relative flex h-full flex-col">
          <div className="absolute inset-0 flex items-center justify-center px-16 py-16">
            <div
              className="relative h-full w-full overflow-hidden"
              style={{ borderRadius: radius(theme, "lg"), backgroundColor: theme.surfaceSoft, opacity: 0.18 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={slide.title || "插图"} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="relative z-10 flex h-full flex-col gap-10 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
            <div className="flex items-start gap-6">
              <span className="mt-3 h-[72px] w-[14px] shrink-0" style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }} />
              <div>
                <SectionTitle theme={theme} underline={false}>{slide.title}</SectionTitle>
                {slide.subtitle && (
                  <p className="mt-4 leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(36) }}>{slide.subtitle}</p>
                )}
              </div>
            </div>
            <ul className="flex flex-1 flex-col gap-6">
              {slide.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-6">
                  <NumberBadge theme={theme} index={i + 1} />
                  <span className="flex-1 pt-2 font-medium leading-[1.45]" style={{ color: theme.textBody, fontSize: scaledPx(40) }}>{bullet}</span>
                </li>
              ))}
            </ul>
            {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} pageIndex={pageIndex} pageTotal={pageTotal} fontScale={fontScale}>
      <div className="flex h-full flex-col">
        {pos === "top" && imgBlock}
        <div className="flex h-full flex-col gap-10 px-20 pb-40" style={{ paddingTop: hasImage && pos === "top" ? 24 : 96, textAlign: slide.textAlign ?? "left" }}>
          <div className="flex items-start gap-6">
            <span className="mt-3 h-[72px] w-[14px] shrink-0" style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }} />
            <div>
              <SectionTitle theme={theme} underline={false}>{slide.title}</SectionTitle>
              {slide.subtitle && (
                <p className="mt-4 leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(36) }}>{slide.subtitle}</p>
              )}
            </div>
          </div>
          <ul className="flex flex-1 flex-col gap-6">
            {slide.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-6">
                <NumberBadge theme={theme} index={i + 1} />
                <span className="flex-1 pt-2 font-medium leading-[1.45]" style={{ color: theme.textBody, fontSize: scaledPx(40) }}>{bullet}</span>
              </li>
            ))}
          </ul>
          {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
        </div>
        {pos === "bottom" && imgBlock}
      </div>
    </CardContainer>
  );
}
