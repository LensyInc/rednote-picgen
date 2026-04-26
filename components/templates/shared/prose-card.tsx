import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { Highlight } from "./atoms";
import { proxyImageUrl } from "@/lib/proxy-image";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function ProseCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const src = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = slide.use_real_image && !!src;
  const pos = slide.imagePosition || "top";

  const imgBlock = hasImage ? (
    <div
      className="relative w-full shrink-0 overflow-hidden p-16"
      style={{ height: CARD_HEIGHT * 0.4 }}
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{
          borderRadius: radius(theme, "lg"),
          backgroundColor: theme.surfaceSoft,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src!} alt={slide.title || "插图"} className="h-full w-full object-cover" />
      </div>
    </div>
  ) : null;

  const bulletList = (
    <ul className="flex flex-1 flex-col gap-6">
      {slide.bullets.map((bullet, i) => (
        <li key={i} className="flex items-start gap-5">
          <span
            className="mt-3 h-4 w-4 shrink-0"
            style={{
              backgroundColor: theme.primary,
              borderRadius: radius(theme, "pill"),
            }}
          />
          <span
            className="flex-1 font-medium leading-[1.6]"
            style={{ color: theme.textBody, fontSize: scaledPx(38) }}
          >
            {bullet}
          </span>
        </li>
      ))}
    </ul>
  );

  if (pos === "background" && hasImage) {
    return (
      <CardContainer
        theme={theme}
        backgroundType={backgroundType}
        pageIndex={pageIndex}
        pageTotal={pageTotal}
        fontScale={fontScale}
      >
        <div className="relative flex h-full flex-col items-center justify-center">
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
              <img src={src!} alt={slide.title || "插图"} className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="relative z-10 flex h-full w-full flex-col gap-8 px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
            {bulletList}
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
        {pos === "top" && imgBlock}
        <div
          className="flex flex-1 flex-col gap-8 px-20 pb-40"
          style={{
            paddingTop: hasImage && pos !== "bottom" ? 32 : 96,
            textAlign: slide.textAlign ?? "left",
          }}
        >
          {bulletList}
          {slide.highlight && <Highlight theme={theme} tone="soft">{slide.highlight}</Highlight>}
        </div>
        {pos === "bottom" && imgBlock}
      </div>
    </CardContainer>
  );
}
