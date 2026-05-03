import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagPageBadge } from "./mag-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

function MagCoverContent({ slide, theme }: { slide: CardProps["slide"]; theme: CardProps["theme"] }) {
  return (
    <>
      {/* 话题标签 */}
      <div className="flex items-center gap-6">
        <span className="h-[3px] flex-1" style={{ backgroundColor: theme.divider }} />
        <span className="font-semibold" style={{ color: theme.textMuted, fontSize: scaledPx(28) }}>
          话题笔记
        </span>
      </div>

      {/* 标题核心区 */}
      <div className="flex flex-col gap-12">
        <div className="h-[6px] w-32" style={{ backgroundColor: theme.primary }} />
        <h1 className="font-black leading-[1.04] tracking-tight" style={{ color: theme.textStrong, fontSize: scaledPx(148) }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="max-w-[900px] leading-[1.45] font-medium" style={{ color: theme.textBody, fontSize: scaledPx(44) }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* 底部分割线 */}
      <div className="w-full" style={{ height: 1, backgroundColor: theme.divider }} />
    </>
  );
}

export function CoverCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {/* 顶部编辑条 */}
      <div
        className="flex shrink-0 items-center justify-between px-20 py-8"
        style={{ borderBottom: `1px solid ${theme.divider}` }}
      >
        <span className="font-bold tracking-widest" style={{ color: theme.primary, fontSize: scaledPx(26), letterSpacing: "0.12em" }}>
          XIAOHONGSHU
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      {hasImage && pos === "top" && (
        <div
          className="shrink-0"
          style={{
            height: 480,
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {hasImage && pos === "background" && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.12,
            }}
          />
        )}

        <div
          className="relative z-10 flex flex-1 flex-col justify-between px-20 pb-20 pt-16"
          style={{ textAlign: slide.textAlign ?? "left" }}
        >
          <MagCoverContent slide={slide} theme={theme} />
        </div>
      </div>

      {hasImage && pos === "bottom" && (
        <div
          className="shrink-0"
          style={{
            height: 320,
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
    </CardContainer>
  );
}
