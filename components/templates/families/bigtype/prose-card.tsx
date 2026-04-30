import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";
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
            opacity: 0.07,
          }}
        />
      )}
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />

      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="纯文本" pageIndex={pageIndex} pageTotal={pageTotal} />

        <div className="flex flex-1 flex-col gap-8 pl-24 pr-20 pb-16">
          {slide.title && (
            <h2
              className="font-black leading-[1.0] tracking-tight"
              style={{ color: theme.textStrong, fontSize: scaledPx(130) }}
            >
              {slide.title}
            </h2>
          )}

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
