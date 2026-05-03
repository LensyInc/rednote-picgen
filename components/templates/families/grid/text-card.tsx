import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function TextCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {hasImage && pos === "background" && (
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.05 }}
        />
      )}
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="正文" pageIndex={pageIndex} pageTotal={pageTotal} />

        {hasImage && pos === "top" && (
          <div className="mx-20 mt-6 shrink-0 overflow-hidden" style={{ height: 360, borderRadius: radius(theme, "lg") }}>
            <div className="h-full w-full" style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-6 px-20 pt-8 pb-16">
          <h2 className="font-black leading-[1.1] tracking-tight" style={{ color: theme.textStrong, fontSize: scaledPx(96) }}>{slide.title}</h2>
          {slide.subtitle && (
            <p className="font-medium leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(36) }}>{slide.subtitle}</p>
          )}
          <div className="flex flex-1 flex-col gap-3">
            {slide.bullets.map((b, i) => (
              <GdCell key={i} theme={theme}>
                <p className="font-medium leading-[1.45]" style={{ color: theme.textBody, fontSize: scaledPx(38) }}>{b}</p>
              </GdCell>
            ))}
          </div>
          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
