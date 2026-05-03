import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight, BtAccentBar } from "./bt-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function ProseCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
            opacity: 0.07,
          }}
        />
      )}

      <BtAccentBar theme={theme} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="纯文本" pageIndex={pageIndex} pageTotal={pageTotal} />

        {hasImage && pos === "top" && (
          <div
            className="shrink-0 mx-20"
            style={{
              height: 420,
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: 4,
            }}
          />
        )}

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          <div className="flex flex-1 flex-col gap-5">
            {slide.bullets.map((b, i) => (
              <p
                key={i}
                className="font-medium leading-[1.6]"
                style={{
                  color: theme.textBody,
                  fontSize: scaledPx(40),
                  textAlign: "justify",
                  paddingBottom: 16,
                  borderBottom: i < slide.bullets.length - 1 ? `1px solid ${theme.divider}` : "none",
                }}
              >
                {b}
              </p>
            ))}
          </div>

          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
