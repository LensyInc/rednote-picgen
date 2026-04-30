import type { ReactNode } from "react";
import { type Theme, radius, scaledPx, withAlpha } from "@/components/templates/themes/theme";
import { CARD_HEIGHT } from "@/core/render/card-dimensions";

export function GdTopBar({
  theme,
  category,
  pageIndex,
  pageTotal,
}: {
  theme: Theme;
  category: string;
  pageIndex?: number;
  pageTotal?: number;
}) {
  return (
    <div className="relative shrink-0 flex flex-col px-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0"
        style={{
          height: CARD_HEIGHT,
          backgroundImage: [
            `linear-gradient(${withAlpha(theme.divider, 0.42)} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${withAlpha(theme.divider, 0.42)} 1px, transparent 1px)`,
            `linear-gradient(${withAlpha(theme.primary, 0.12)} 2px, transparent 2px)`,
            `linear-gradient(90deg, ${withAlpha(theme.primary, 0.12)} 2px, transparent 2px)`,
          ].join(", "),
          backgroundSize: "76px 76px, 76px 76px, 304px 304px, 304px 304px",
          backgroundPosition: "0 0, 0 0, 0 0, 0 0",
          opacity: theme.mood === "dark" ? 0.35 : 0.55,
        }}
      />
      <div className="relative z-10 flex items-center justify-between py-12">
        <div className="flex items-center gap-4">
          <span
            style={{
              display: "grid",
              width: 26,
              height: 26,
              backgroundColor: theme.primary,
              borderRadius: radius(theme, "sm"),
              flexShrink: 0,
              boxShadow: `0 0 0 6px ${withAlpha(theme.primary, 0.12)}`,
            }}
          />
          <span
            className="font-bold tracking-[0.12em]"
            style={{ color: theme.primary, fontSize: scaledPx(22) }}
          >
            {category.toUpperCase()}
          </span>
        </div>
        {pageIndex != null && pageTotal != null && (
          <span
            className="font-black tabular-nums tracking-[0.08em]"
            style={{ color: theme.primary, fontSize: scaledPx(22) }}
          >
            CELL {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
          </span>
        )}
      </div>
      <div
        className="relative z-10"
        style={{
          height: 4,
          backgroundImage: `repeating-linear-gradient(90deg, ${theme.primary} 0 52px, ${theme.divider} 52px 76px)`,
        }}
      />
    </div>
  );
}

export function GdCell({
  theme,
  children,
  index,
}: {
  theme: Theme;
  children: ReactNode;
  index?: number;
}) {
  return (
    <div
      className="relative flex flex-col overflow-hidden p-5"
      style={{
        border: `2px solid ${theme.divider}`,
        borderRadius: radius(theme, "sm"),
        backgroundColor: withAlpha(theme.surface, theme.mood === "dark" ? 0.86 : 0.92),
        boxShadow: `inset 0 0 0 1px ${withAlpha(theme.primary, 0.08)}`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            `linear-gradient(${withAlpha(theme.divider, 0.36)} 1px, transparent 1px)`,
            `linear-gradient(90deg, ${withAlpha(theme.divider, 0.36)} 1px, transparent 1px)`,
          ].join(", "),
          backgroundSize: "38px 38px",
          opacity: 0.6,
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0"
        style={{
          width: 34,
          height: 34,
          borderLeft: `2px solid ${theme.divider}`,
          borderBottom: `2px solid ${theme.divider}`,
          backgroundColor: theme.surfaceSoft,
        }}
      />
      {index != null && (
        <span
          className="relative z-10 shrink-0 font-black tabular-nums mb-3 tracking-[0.08em]"
          style={{ color: theme.primary, fontSize: scaledPx(22) }}
        >
          GRID-{String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function GdHighlight({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden px-6 py-5"
      style={{
        backgroundColor: withAlpha(theme.surfaceSoft, 0.94),
        border: `2px solid ${theme.primary}`,
        borderRadius: radius(theme, "sm"),
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0"
        style={{
          width: 76,
          backgroundImage: `repeating-linear-gradient(0deg, ${withAlpha(theme.primary, 0.18)} 0 1px, transparent 1px 19px)`,
        }}
      />
      <p
        className="relative z-10 pl-16 font-semibold leading-[1.4]"
        style={{ color: theme.textStrong, fontSize: scaledPx(34) }}
      >
        {children}
      </p>
    </div>
  );
}
