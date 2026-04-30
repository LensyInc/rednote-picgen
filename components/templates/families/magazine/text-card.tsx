import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, type Theme, scaledPx } from "@/components/templates/themes/theme";
import { MagHeader, MagHighlight, MagPageBadge } from "./mag-atoms";

function BulletList({ items, theme }: { items: string[]; theme: Theme }) {
  return (
    <ul className="flex flex-col">
      {items.map((b, i) => (
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

export function TextCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const bullets = slide.bullets;
  const mid = Math.ceil(bullets.length / 2);
  const useTwoCols = bullets.length > 4;
  const colA = useTwoCols ? bullets.slice(0, mid) : bullets;
  const colB = useTwoCols ? bullets.slice(mid) : [];

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
          CONTENT
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col gap-10 px-20 py-14"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        <MagHeader theme={theme} category="正文" title={slide.title} subtitle={slide.subtitle} />

        <div className="flex-1">
          {useTwoCols ? (
            <div className="flex h-full gap-10">
              <div className="flex-1">
                <BulletList items={colA} theme={theme} />
              </div>
              <div
                className="shrink-0"
                style={{ width: 1, backgroundColor: theme.divider }}
              />
              <div className="flex-1">
                <BulletList items={colB} theme={theme} />
              </div>
            </div>
          ) : (
            <BulletList items={colA} theme={theme} />
          )}
        </div>

        {slide.highlight && <MagHighlight theme={theme}>{slide.highlight}</MagHighlight>}
      </div>
    </CardContainer>
  );
}
