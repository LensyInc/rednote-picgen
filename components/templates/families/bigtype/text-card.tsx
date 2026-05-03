import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { BtTopBar, BtHighlight } from "./bt-atoms";
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
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center", opacity: 0.08 }}
        />
      )}
      <div className="absolute left-0 top-0 bottom-0 z-10" style={{ width: 14, backgroundColor: theme.primary }} />
      <div className="relative z-10 flex h-full flex-col" style={{ textAlign: slide.textAlign ?? "left" }}>
        <BtTopBar theme={theme} category="正文" pageIndex={pageIndex} pageTotal={pageTotal} />

        {hasImage && pos === "top" && (
          <div className="shrink-0 mx-20" style={{ height: 420, backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 4 }} />
        )}

        <div className="flex flex-1 flex-col gap-10 pl-24 pr-20 pb-16">
          <div className="flex flex-col gap-6">
            <h2 className="font-black leading-[1.0] tracking-tight" style={{ color: theme.textStrong, fontSize: hasImage && pos === "top" ? scaledPx(100) : scaledPx(148) }}>{slide.title}</h2>
            {slide.subtitle && (
              <p className="font-medium leading-[1.4]" style={{ color: theme.textMuted, fontSize: scaledPx(38) }}>{slide.subtitle}</p>
            )}
          </div>
          {slide.bullets.length > 0 && (
            <ul className="flex flex-1 flex-col gap-5">
              {slide.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-5">
                  <span className="shrink-0 font-bold tabular-nums" style={{ color: theme.primary, fontSize: scaledPx(28), paddingTop: 3 }}>{String(i + 1).padStart(2, "0")}</span>
                  <p className="flex-1 leading-[1.45] font-medium" style={{ color: theme.textBody, fontSize: scaledPx(36) }}>{b}</p>
                </li>
              ))}
            </ul>
          )}
          {slide.highlight && <BtHighlight theme={theme}>{slide.highlight}</BtHighlight>}
        </div>
      </div>
    </CardContainer>
  );
}
