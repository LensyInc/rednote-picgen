import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, radius, scaledPx } from "@/components/templates/themes/theme";
import { GdTopBar, GdHighlight } from "./grid-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function ProseCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {imgSrc && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.05,
          }}
        />
      )}

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <GdTopBar theme={theme} category="纯文本" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-5 px-20 pt-8 pb-16">
          {slide.title && (
            <h2
              className="font-black leading-[1.1] tracking-tight"
              style={{ color: theme.textStrong, fontSize: scaledPx(88) }}
            >
              {slide.title}
            </h2>
          )}

          <div className="flex flex-1 flex-col gap-4">
            {slide.bullets.map((b, i) => (
              <div
                key={i}
                className="p-5"
                style={{
                  border: `1.5px solid ${theme.divider}`,
                  borderRadius: radius(theme, "lg"),
                  backgroundColor: theme.surface,
                }}
              >
                <p
                  className="font-medium leading-[1.6]"
                  style={{ color: theme.textBody, fontSize: scaledPx(38), textAlign: "justify" }}
                >
                  {b}
                </p>
              </div>
            ))}
          </div>

          {slide.highlight && <GdHighlight theme={theme}>{slide.highlight}</GdHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
