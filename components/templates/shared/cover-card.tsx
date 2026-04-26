import type React from "react";
import { type CardProps, radius, scaledPx } from "./theme";
import { CardContainer } from "./card-container";
import { proxyImageUrl } from "@/lib/proxy-image";

export function CoverCard({ slide, theme, backgroundType, pageIndex, pageTotal }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
    >
      {hasImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.14,
          }}
        />
      )}
      <div className="flex h-full flex-col justify-between px-20 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className="h-[10px] w-20"
              style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
            />
            <span
              className="font-medium tracking-wide"
              style={{ color: theme.textMuted, fontSize: scaledPx(28) }}
            >
              话题笔记
            </span>
          </div>
          {pageTotal != null && pageTotal > 1 && (
            <span
              className="font-medium tabular-nums"
              style={{ color: theme.textMuted, fontSize: scaledPx(28) }}
            >
              共 {pageTotal} 页
            </span>
          )}
        </div>

        <div className="flex flex-col gap-10">
          <h1
            className="font-bold leading-[1.08] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(132) }}
          >
            <span className="relative inline-block">
              <span className="relative z-10">{slide.title}</span>
              <span
                className="absolute bottom-[16px] left-0 right-0 -z-0 h-[22px]"
                style={{
                  backgroundColor: theme.accent,
                  opacity: theme.mood === "dark" ? 0.5 : 0.55,
                }}
              />
            </span>
          </h1>
          {slide.subtitle && (
            <p
              className="max-w-[960px] leading-[1.45] font-medium"
              style={{ color: theme.textBody, fontSize: scaledPx(44) }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>

        <div
          className="h-[6px] w-full"
          style={{ backgroundColor: theme.divider, borderRadius: radius(theme, "sm") }}
        />
      </div>
    </CardContainer>
  );
}
