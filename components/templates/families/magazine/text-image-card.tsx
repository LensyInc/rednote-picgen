import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHeader, MagVDivider, MagHighlight, MagPageBadge } from "./mag-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function TextImageCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      {/* 顶部编辑栏 */}
      <div
        className="flex shrink-0 items-center justify-between px-20 py-8"
        style={{ borderBottom: `1px solid ${theme.divider}` }}
      >
        <span
          className="font-bold tracking-widest"
          style={{ color: theme.primary, fontSize: scaledPx(26), letterSpacing: "0.12em" }}
        >
          {slide.type === "image" ? "IMAGE" : "CONTENT"}
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      {/* 图片在上 */}
      {hasImage && pos === "top" && (
        <div
          className="shrink-0"
          style={{
            height: 540,
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      {/* 正文区域 */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 左图右字布局（无顶图时） */}
        {hasImage && pos !== "top" && pos !== "background" ? (
          <>
            <div
              className="w-[480px] shrink-0"
              style={{
                backgroundImage: `url("${imgSrc}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <MagVDivider theme={theme} />
            <div className="flex flex-1 flex-col gap-8 px-14 py-14">
              <MagHeader theme={theme} category="图文" title={slide.title} subtitle={slide.subtitle} />
              <BulletList theme={theme} bullets={slide.bullets} />
              {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col gap-8 px-20 py-14">
            <MagHeader theme={theme} category={slide.type === "image" ? "图文" : "正文"} title={slide.title} subtitle={slide.subtitle} />
            {hasImage && pos === "background" && (
              <div
                className="absolute inset-0 z-[-1]"
                style={{
                  backgroundImage: `url("${imgSrc}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: 0.1,
                }}
              />
            )}
            <BulletList theme={theme} bullets={slide.bullets} />
            {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
          </div>
        )}
      </div>
    </CardContainer>
  );
}

function BulletList({ theme, bullets }: { theme: import("@/components/templates/themes/theme").Theme; bullets: string[] }) {
  return (
    <ul className="flex flex-1 flex-col">
      {bullets.map((b, i) => (
        <li
          key={i}
          className="flex items-start gap-5 py-5"
          style={{ borderTop: `1px solid ${theme.divider}` }}
        >
          <span
            className="shrink-0 font-bold tabular-nums"
            style={{ color: theme.primary, fontSize: scaledPx(28), paddingTop: 4 }}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <p
            className="flex-1 leading-[1.45] font-medium"
            style={{ color: theme.textBody, fontSize: scaledPx(38), textAlign: "justify" }}
          >
            {b}
          </p>
        </li>
      ))}
    </ul>
  );
}
