import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Theme, fontClass, radius, type BackgroundType, type FontScale, FONT_SCALE_MAP, scaledPx } from "./theme";
import { CARD_WIDTH, CARD_HEIGHT } from "@/core/render/card-dimensions";

interface CardContainerProps {
  theme: Theme;
  backgroundType?: BackgroundType;
  pageIndex?: number;
  pageTotal?: number;
  fontScale?: FontScale;
  className?: string;
  children: ReactNode;
}

function BackgroundLayer({ theme, type }: { theme: Theme; type: BackgroundType }) {
  if (type === "gradient") {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(160deg, ${theme.background} 0%, ${theme.surfaceSoft} 100%)`,
        }}
      />
    );
  }
  if (type === "dots") {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: theme.background,
          backgroundImage: `radial-gradient(${theme.divider} 2px, transparent 2px)`,
          backgroundSize: "48px 48px",
        }}
      />
    );
  }
  if (type === "lines") {
    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: theme.background,
          backgroundImage: `repeating-linear-gradient(0deg, ${theme.divider} 0 1px, transparent 1px 64px)`,
        }}
      />
    );
  }
  return <div className="absolute inset-0 z-0" style={{ backgroundColor: theme.background }} />;
}

export function CardContainer({
  theme,
  backgroundType = "solid",
  pageIndex,
  pageTotal,
  fontScale = "medium",
  className,
  children,
}: CardContainerProps) {
  const scaleValue = FONT_SCALE_MAP[fontScale];
  return (
    <div
      className={cn("relative flex flex-col overflow-hidden", fontClass(theme), className)}
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        color: theme.textBody,
        ["--font-scale" as string]: scaleValue,
      }}
    >
      <BackgroundLayer theme={theme} type={backgroundType} />
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
      {typeof pageIndex === "number" && typeof pageTotal === "number" && (
        <div
          className="pointer-events-none absolute bottom-10 right-16 z-20"
          style={{ color: theme.textMuted }}
        >
          <span
            className="px-5 py-1 font-medium tabular-nums"
            style={{
              fontSize: scaledPx(28),
              borderRadius: radius(theme, "pill"),
              backgroundColor: theme.mood === "dark" ? theme.surfaceSoft : theme.surface,
              color: theme.textMuted,
              border: `1px solid ${theme.divider}`,
            }}
          >
            {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
