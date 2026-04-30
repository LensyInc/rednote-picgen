import type React from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import { type CardProps, scaledPx } from "@/components/templates/themes/theme";
import { MagPageBadge } from "./mag-atoms";

export function CTACard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
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
          CALL TO ACTION
        </span>
        <MagPageBadge theme={theme} pageIndex={pageIndex} pageTotal={pageTotal} />
      </div>

      <div
        className="flex flex-1 flex-col justify-center px-20 pb-20"
        style={{ textAlign: slide.textAlign ?? "left" }}
      >
        {/* 顶部装饰线 */}
        <div className="flex items-center gap-6 mb-12">
          <span className="h-[3px] flex-1" style={{ backgroundColor: theme.primary }} />
          <span className="h-[3px] w-8" style={{ backgroundColor: theme.divider }} />
        </div>

        {/* 主 CTA 文字 */}
        <h2
          className="font-black leading-[1.08] tracking-tight"
          style={{ color: theme.textStrong, fontSize: scaledPx(100) }}
        >
          {slide.title}
        </h2>

        {slide.subtitle && (
          <p
            className="mt-8 max-w-[960px] leading-[1.45] font-medium"
            style={{ color: theme.textBody, fontSize: scaledPx(42) }}
          >
            {slide.subtitle}
          </p>
        )}

        {slide.highlight && (
          <div
            className="mt-12 inline-flex self-start font-bold"
            style={{
              fontSize: scaledPx(40),
              color: theme.primary,
              borderBottom: `3px solid ${theme.primary}`,
              paddingBottom: 4,
            }}
          >
            {slide.highlight}
          </div>
        )}

        {slide.bullets.length > 0 && (
          <ul className="mt-12 flex flex-col">
            {slide.bullets.map((b, i) => (
              <li
                key={i}
                className="flex items-center gap-6 py-4"
                style={{ borderTop: `1px solid ${theme.divider}` }}
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <span
                  className="flex-1 font-medium leading-[1.4]"
                  style={{ color: theme.textBody, fontSize: scaledPx(36) }}
                >
                  {b}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 底部分割线 */}
        <div
          className="mt-16 flex items-center gap-6"
        >
          <span className="h-[3px] w-8" style={{ backgroundColor: theme.divider }} />
          <span className="h-[3px] flex-1" style={{ backgroundColor: theme.primary }} />
        </div>
      </div>
    </CardContainer>
  );
}
