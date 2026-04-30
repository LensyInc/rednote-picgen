import type { ReactNode } from "react";
import { type Theme, radius, scaledPx } from "@/components/templates/themes/theme";

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
    <div className="shrink-0 flex flex-col px-20">
      <div className="flex items-center justify-between py-12">
        <div className="flex items-center gap-4">
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              backgroundColor: theme.primary,
              borderRadius: radius(theme, "sm"),
              flexShrink: 0,
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
            className="font-medium tabular-nums"
            style={{ color: theme.textMuted, fontSize: scaledPx(22) }}
          >
            {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
          </span>
        )}
      </div>
      <div style={{ height: 1, backgroundColor: theme.divider }} />
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
      className="relative flex flex-col p-5"
      style={{
        border: `1.5px solid ${theme.divider}`,
        borderRadius: radius(theme, "lg"),
        backgroundColor: theme.surface,
      }}
    >
      {index != null && (
        <span
          className="shrink-0 font-black tabular-nums mb-3"
          style={{ color: theme.primary, fontSize: scaledPx(22) }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      {children}
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
      className="shrink-0 px-6 py-5"
      style={{
        backgroundColor: theme.surfaceSoft,
        borderLeft: `4px solid ${theme.primary}`,
        borderRadius: radius(theme, "md"),
      }}
    >
      <p
        className="font-semibold leading-[1.4]"
        style={{ color: theme.textStrong, fontSize: scaledPx(34) }}
      >
        {children}
      </p>
    </div>
  );
}
