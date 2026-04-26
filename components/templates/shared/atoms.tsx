import type { ReactNode, CSSProperties } from "react";
import { Theme, radius, withAlpha, scaledPx } from "./theme";

export function Tag({
  theme,
  children,
  variant = "solid",
}: {
  theme: Theme;
  children: ReactNode;
  variant?: "solid" | "soft" | "outline";
}) {
  const style: CSSProperties = { borderRadius: radius(theme, "pill") };
  if (variant === "solid") {
    style.backgroundColor = theme.primary;
    style.color = theme.primaryText;
  } else if (variant === "soft") {
    style.backgroundColor = theme.surfaceSoft;
    style.color = theme.primary;
  } else {
    style.border = `2px solid ${theme.primary}`;
    style.color = theme.primary;
  }
  return (
    <span
      className="inline-flex items-center gap-2 px-6 py-2 font-semibold leading-tight"
      style={{ ...style, fontSize: scaledPx(30) }}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  theme,
  children,
  underline = true,
  className,
}: {
  theme: Theme;
  children: ReactNode;
  underline?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2
        className="font-extrabold leading-[1.1] tracking-tight"
        style={{ color: theme.textStrong, fontSize: scaledPx(72) }}
      >
        {children}
      </h2>
      {underline && (
        <span
          className="mt-4 block h-[10px] w-24"
          style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
        />
      )}
    </div>
  );
}

export function NumberBadge({
  theme,
  index,
  size = "md",
  style: overrideStyle,
}: {
  theme: Theme;
  index: number;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}) {
  const dim = size === "lg" ? 88 : size === "sm" ? 56 : 72;
  const font = size === "lg" ? 40 : size === "sm" ? 24 : 32;
  return (
    <span
      className="flex shrink-0 items-center justify-center font-extrabold"
      style={{
        width: dim,
        height: dim,
        borderRadius: radius(theme, "pill"),
        backgroundColor: theme.primary,
        color: theme.primaryText,
        fontSize: scaledPx(font),
        lineHeight: 1,
        ...overrideStyle,
      }}
    >
      {String(index).padStart(2, "0")}
    </span>
  );
}

export function Highlight({
  theme,
  children,
  tone = "primary",
}: {
  theme: Theme;
  children: ReactNode;
  tone?: "primary" | "soft";
}) {
  const solid = tone === "primary";
  return (
    <div
      className="flex items-start gap-4 px-8 py-6"
      style={{
        borderRadius: radius(theme, "lg"),
        backgroundColor: solid ? theme.primary : theme.surfaceSoft,
        color: solid ? theme.primaryText : theme.textStrong,
        border: solid ? "none" : `2px solid ${theme.divider}`,
      }}
    >
      <span
        className="mt-3 h-[6px] w-10 shrink-0"
        style={{
          backgroundColor: solid ? theme.primaryText : theme.primary,
          borderRadius: radius(theme, "sm"),
          opacity: 0.8,
        }}
      />
      <p className="font-medium leading-[1.4]" style={{ fontSize: scaledPx(34) }}>{children}</p>
    </div>
  );
}

export function SurfaceCard({
  theme,
  children,
  tone = "surface",
  className,
  style,
}: {
  theme: Theme;
  children: ReactNode;
  tone?: "surface" | "soft";
  className?: string;
  style?: CSSProperties;
}) {
  const bg = tone === "soft" ? theme.surfaceSoft : theme.surface;
  return (
    <div
      className={className}
      style={{
        backgroundColor: bg,
        borderRadius: radius(theme, "lg"),
        boxShadow: theme.mood === "dark" ? "none" : `0 4px 24px ${withAlpha(theme.divider, 0.38)}`,
        border: `2px solid ${theme.divider}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Divider({ theme }: { theme: Theme }) {
  return <div className="h-[3px] w-full" style={{ backgroundColor: theme.divider }} />;
}
