import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagHighlight, MagPageBadge } from "./mag-atoms";
import { proxyImageUrl } from "@/lib/proxy-image";

export function ProseCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const useTwoCols = !hasImage && slide.bullets.length > 3;
  const mid = Math.ceil(slide.bullets.length / 2);
  const colA = useTwoCols ? slide.bullets.slice(0, mid) : slide.bullets;
  const colB = useTwoCols ? slide.bullets.slice(mid) : [];

  const ParagraphList = ({ items }: { items: string[] }) => (
    <div className="flex flex-col gap-1">
      {items.map((b, i) => (
        <p
          key={i}
          className="leading-[1.6] font-medium"
          style={{
            color: theme.textBody,
            fontSize: scaledPx(38),
            textAlign: "justify",
            paddingBottom: 12,
            borderBottom: i < items.length - 1 ? `1px solid ${theme.divider}` : "none",
            marginBottom: i < items.length - 1 ? 12 : 0,
          }}
        >
          {b}
        </p>
      ))}
    </div>
  );

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
          PROSE
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      {/* 左图右字 */}
      {hasImage ? (
        <div className="flex flex-1 overflow-hidden">
          <div
            className="w-[440px] shrink-0"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            className="shrink-0"
            style={{ width: 1, backgroundColor: theme.divider }}
          />
          <div className="flex flex-1 flex-col gap-8 px-14 py-14">
            {slide.title && (
              <h2
                className="font-black leading-[1.06] tracking-tight"
                style={{ color: theme.textStrong, fontSize: scaledPx(68) }}
              >
                {slide.title}
              </h2>
            )}
            <ParagraphList items={slide.bullets} />
            {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-8 px-20 py-14">
          {slide.title && (
            <h2
              className="font-black leading-[1.06] tracking-tight"
              style={{ color: theme.textStrong, fontSize: scaledPx(68) }}
            >
              {slide.title}
            </h2>
          )}
          {useTwoCols ? (
            <div className="flex flex-1 gap-10">
              <div className="flex-1">
                <ParagraphList items={colA} />
              </div>
              <div className="shrink-0" style={{ width: 1, backgroundColor: theme.divider }} />
              <div className="flex-1">
                <ParagraphList items={colB} />
              </div>
            </div>
          ) : (
            <div className="flex-1">
              <ParagraphList items={colA} />
            </div>
          )}
          {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
        </div>
      )}
    </CardContainer>
  );
}
