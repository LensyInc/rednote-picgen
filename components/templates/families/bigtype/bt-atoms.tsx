import type { ReactNode } from "react";
import { type Theme, scaledPx } from "@/components/templates/themes/theme";

/** 顶部元信息条：分类标签 + 页码 */
export function BtTopBar({
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
    <div className="flex shrink-0 items-center justify-between px-20 py-10">
      <span
        className="font-bold tracking-[0.18em]"
        style={{ color: theme.primary, fontSize: scaledPx(24) }}
      >
        {category.toUpperCase()}
      </span>
      {pageIndex != null && pageTotal != null && (
        <span
          className="font-medium tabular-nums"
          style={{ color: theme.textMuted, fontSize: scaledPx(24) }}
        >
          {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

/** 左侧粗竖条装饰 */
export function BtAccentBar({ theme }: { theme: Theme }) {
  return (
    <div
      className="absolute left-0 top-0 bottom-0"
      style={{ width: 12, backgroundColor: theme.primary }}
    />
  );
}

/** 超大标题 */
export function BtTitle({
  theme,
  children,
  size = "xl",
}: {
  theme: Theme;
  children: ReactNode;
  size?: "xl" | "xxl";
}) {
  const fs = size === "xxl" ? 172 : 152;
  return (
    <h2
      className="font-black leading-[1.0] tracking-tight"
      style={{ color: theme.textStrong, fontSize: scaledPx(fs) }}
    >
      {children}
    </h2>
  );
}

/** 小注释文字（bullets 降级为注释） */
export function BtAnnotation({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <p
      className="leading-[1.45] font-medium"
      style={{ color: theme.textMuted, fontSize: scaledPx(32) }}
    >
      {children}
    </p>
  );
}

/** 底部 Highlight 横线 + 文字 */
export function BtHighlight({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <div
      className="flex items-start gap-6 pt-6"
      style={{ borderTop: `3px solid ${theme.primary}` }}
    >
      <p
        className="flex-1 font-semibold leading-[1.4]"
        style={{ color: theme.textStrong, fontSize: scaledPx(36) }}
      >
        {children}
      </p>
    </div>
  );
}
