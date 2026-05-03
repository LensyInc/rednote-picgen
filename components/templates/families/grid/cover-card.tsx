import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { proxyImageUrl } from "@/lib/proxy-image";

export function CoverCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  if (hasImage && pos === "background") {
    return (
      <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.3,
          }}
        />
        <div className="relative z-10 flex h-full flex-col justify-center gap-8 px-20 pb-20 pt-24" style={{ textAlign: slide.textAlign ?? "left" }}>
          <div className="flex items-center gap-3">
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: theme.primary,
                borderRadius: radius(theme, "sm"),
                flexShrink: 0,
              }}
            />
            <span
              className="font-bold tracking-[0.12em]"
              style={{ color: theme.primary, fontSize: scaledPx(22) }}
            >
              话题笔记
            </span>
          </div>
          <h1
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(112) }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="font-medium leading-[1.45]" style={{ color: theme.textBody, fontSize: scaledPx(40) }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      </CardContainer>
    );
  }

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="relative shrink-0 overflow-hidden" style={{ height: "55%" }}>
        <div className="absolute inset-0" style={{ backgroundColor: theme.primary }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${theme.primaryText}18 1px, transparent 1px), linear-gradient(90deg, ${theme.primaryText}18 1px, transparent 1px)`,
            backgroundSize: "100px 100px",
          }}
        />
        {hasImage && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        {pageIndex != null && pageTotal != null && (
          <div className="absolute top-10 right-20">
            <span
              className="font-medium tabular-nums"
              style={{ color: theme.primaryText, fontSize: scaledPx(24), opacity: 0.8 }}
            >
              {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <div
        className="flex flex-1 flex-col justify-center gap-8 px-20 pb-20 pt-12"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 10,
              backgroundColor: theme.primary,
              borderRadius: radius(theme, "sm"),
              flexShrink: 0,
            }}
          />
          <span
            className="font-bold tracking-[0.12em]"
            style={{ color: theme.primary, fontSize: scaledPx(22) }}
          >
            话题笔记
          </span>
        </div>
        <h1
          className="font-black leading-[1.1] tracking-tight"
          style={{ color: theme.textStrong, fontSize: scaledPx(112) }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="font-medium leading-[1.45]" style={{ color: theme.textBody, fontSize: scaledPx(40) }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    </CardContainer>
  );
}
