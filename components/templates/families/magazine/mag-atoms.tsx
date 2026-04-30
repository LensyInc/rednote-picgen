import type { ReactNode, CSSProperties } from "react";
import { type Theme, radius, scaledPx, withAlpha } from "@/components/templates/themes/theme";

/** 顶部细线 + 分类标签 + 标题 */
export function MagHeader({
  theme,
  category,
  title,
  subtitle,
}: {
  theme: Theme;
  category: string;
  title: string;
  subtitle?: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <span
          className="h-[3px] w-16 shrink-0"
          style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
        />
        <span
          className="font-bold tracking-widest"
          style={{ color: theme.primary, fontSize: scaledPx(26), letterSpacing: "0.12em" }}
        >
          {category.toUpperCase()}
        </span>
      </div>
      <h2
        className="font-black leading-[1.06] tracking-tight"
        style={{ color: theme.textStrong, fontSize: scaledPx(76) }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className="leading-[1.4]"
          style={{ color: theme.textMuted, fontSize: scaledPx(34) }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** 细分割线 */
export function MagDivider({ theme }: { theme: Theme }) {
  return (
    <div
      className="w-full"
      style={{ height: 1, backgroundColor: theme.divider }}
    />
  );
}

/** 垂直分割线 */
export function MagVDivider({ theme }: { theme: Theme }) {
  return (
    <div
      className="shrink-0"
      style={{ width: 1, backgroundColor: theme.divider, alignSelf: "stretch" }}
    />
  );
}

/** 边距大数字（用于 Tips / Step） */
export function MagMarginNum({
  theme,
  index,
  size = "lg",
}: {
  theme: Theme;
  index: number;
  size?: "md" | "lg";
}) {
  const fs = size === "lg" ? 100 : 72;
  return (
    <span
      className="shrink-0 font-black leading-none tabular-nums"
      style={{ color: theme.primary, fontSize: scaledPx(fs), opacity: 0.85, lineHeight: 1 }}
    >
      {String(index).padStart(2, "0")}
    </span>
  );
}

/** 杂志风 Highlight —— 无大色块，仅左侧细线 */
export function MagHighlight({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-6 py-5"
      style={{ borderTop: `3px solid ${theme.primary}` }}
    >
      <p
        className="flex-1 font-semibold leading-[1.4]"
        style={{ color: theme.textStrong, fontSize: scaledPx(34) }}
      >
        {children}
      </p>
    </div>
  );
}

/** 页码徽章（magazine 风格：顶部右侧，轻量） */
export function MagPageBadge({
  theme,
  pageIndex,
  pageTotal,
}: {
  theme: Theme;
  pageIndex?: number;
  pageTotal?: number;
}) {
  if (pageIndex == null || pageTotal == null) return null;
  return (
    <span
      className="font-medium tabular-nums"
      style={{ color: theme.textMuted, fontSize: scaledPx(26) }}
    >
      {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
    </span>
  );
}
