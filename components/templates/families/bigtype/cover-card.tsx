import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar } from "./bt-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function CoverCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {hasImage && pos === "background" && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
      )}

      {/* 左侧粗条 */}
      <div
        className="absolute left-0 top-0 bottom-0 z-10"
        style={{ width: 14, backgroundColor: theme.primary }}
      />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="话题笔记" pageIndex={pageIndex} pageTotal={pageTotal} />

        {hasImage && pos === "top" && (
          <div
            className="shrink-0 mx-20 mt-4"
            style={{
              height: 360,
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 4,
            }}
          />
        )}

        {/* 大标题区：撑满剩余空间 */}
        <div className="flex flex-1 flex-col justify-center gap-10 px-20 pb-8 pl-24">
          <h1
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(168) }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p
              className="max-w-[900px] font-medium leading-[1.45]"
              style={{ color: theme.textBody, fontSize: scaledPx(44) }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>

        {/* 底部细线 */}
        <div
          className="mx-20 mb-14"
          style={{ height: 3, backgroundColor: theme.primary }}
        />
      </div>
    </CardContainer>
  );
}
