import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdCell, GdHighlight } from "./grid-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function TextImageCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="图文" pageIndex={pageIndex} pageTotal={pageTotal} />

        {imgSrc && (
          <div
            className="mx-20 mt-6 shrink-0 overflow-hidden"
            style={{ height: 360, borderRadius: radius(theme, "lg") }}
          >
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `url("${imgSrc}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-5 px-20 pt-6 pb-16">
          <h2
            className="font-black leading-[1.1] tracking-tight"
            style={{ color: theme.textStrong, fontSize: scaledPx(88) }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="font-medium"
              style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
            >
              {slide.subtitle}
            </p>
          )}

          <div
            className="grid flex-1 gap-3"
            style={{ gridTemplateColumns: "1fr 1fr", alignContent: "start" }}
          >
            {slide.bullets.map((b, i) => (
              <GdCell key={i} theme={theme} index={i}>
                <p
                  className="font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(34) }}
                >
                  {b}
                </p>
              </GdCell>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
