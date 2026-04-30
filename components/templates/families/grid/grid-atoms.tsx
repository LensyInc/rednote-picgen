import type { ReactNode } from "react";
import { type Theme, radius, scaledPx, withAlpha } from "@/components/templates/themes/theme";

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
      className="relative flex flex-col overflow-hidden p-0"
      style={{
        border: `2px solid ${theme.divider}`,
        borderRadius: radius(theme, "sm"),
        backgroundColor: theme.surface,
        boxShadow: `inset 0 0 0 1px ${withAlpha(theme.primary, 0.1)}`,
      }}
    >
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
      <div
        className="flex min-h-8 items-center border-b px-4 py-2"
        style={{
          borderColor: theme.divider,
          backgroundColor: withAlpha(theme.surfaceSoft, theme.mood === "dark" ? 0.5 : 0.78),
        }}
      >
        <span
          className="font-black tabular-nums tracking-[0.1em]"
          style={{ color: theme.primary, fontSize: scaledPx(18) }}
        >
          {index != null ? `GRID-${String(index + 1).padStart(2, "0")}` : "GRID-CELL"}
        </span>
      </div>
      {index != null && (
        <span
          className="absolute bottom-3 right-4 z-10 font-black tabular-nums leading-none"
          style={{ color: withAlpha(theme.primary, 0.16), fontSize: scaledPx(54) }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className="relative z-10 p-5">{children}</div>
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
      className="relative shrink-0 overflow-hidden p-0"
      style={{
        backgroundColor: theme.surface,
        border: `2px solid ${theme.primary}`,
        borderRadius: radius(theme, "sm"),
      }}
    >
      <div className="flex border-b"
        style={{
          borderColor: theme.primary,
          backgroundColor: withAlpha(theme.primary, 0.1),
        }}
      >
        <span
          className="px-4 py-2 font-black tracking-[0.1em]"
          style={{ color: theme.primary, fontSize: scaledPx(18) }}
        >
          HIGHLIGHT
        </span>
      </div>
      <p
        className="relative z-10 p-5 font-semibold leading-[1.4]"
        style={{ color: theme.textStrong, fontSize: scaledPx(34) }}
      >
        {children}
      </p>
    </div>
  );
}
