import { type CardProps, radius, scaledPx, withAlpha } from "./theme";
import { CardContainer } from "./card-container";
import { Tag, Highlight } from "./atoms";

type Side = "L" | "R";

interface SideStyle {
  badge: string;
  badgeColor: string;
  labelColor: string;
  columnBg: string;
  border: string;
  dotColor: string;
}

export function ComparisonCard({ slide, theme, backgroundType, pageIndex, pageTotal, fontScale }: CardProps) {
  const mid = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, mid);
  const right = slide.bullets.slice(mid);
  const style = slide.comparisonStyle || "good-bad";

  const isAB = style === "ab";
  const leftLabel =
    slide.labelLeft?.trim() || (isAB ? "方案 A" : "推荐方案");
  const rightLabel =
    slide.labelRight?.trim() || (isAB ? "方案 B" : "需留意");

  function styleFor(side: Side): SideStyle {
if (isAB) {
      const isLeft = side === "L";
      return {
        badge: isLeft ? "A" : "B",
        badgeColor: isLeft ? theme.primary : theme.accent,
        labelColor: isLeft ? theme.primary : theme.textStrong,
        columnBg: theme.surfaceSoft,
        border: isLeft ? theme.primary : theme.divider,
        dotColor: isLeft ? theme.primary : theme.textMuted,
      };
    }
    // 对错：左栏推荐（主色），右栏留意（灰调）
    const isGood = side === "L";
    return {
      badge: isGood ? "✓" : "✕",
      badgeColor: isGood ? theme.primary : theme.textMuted,
      labelColor: isGood ? theme.primary : theme.textMuted,
      columnBg: isGood ? theme.surfaceSoft : theme.surface,
      border: isGood ? theme.primary : theme.divider,
      dotColor: isGood ? theme.primary : theme.textMuted,
    };
  }

  const column = (items: string[], side: Side, label: string) => {
    const s = styleFor(side);
    const badgeTextColor = (isAB && side === "R") ? theme.textStrong : theme.primaryText;
    return (
      <div
        className="flex flex-1 flex-col gap-5 px-8 py-10"
        style={{
          backgroundColor: s.columnBg,
          borderRadius: radius(theme, "lg"),
          border: `3px solid ${s.border}`,
        }}
      >
        <div className="flex items-center gap-4">
          <span
            className="flex h-20 w-20 items-center justify-center font-black leading-none"
            style={{
              fontSize: scaledPx(44),
              backgroundColor: s.badgeColor,
              color: badgeTextColor,
              borderRadius: radius(theme, "pill"),
            }}
          >
            {s.badge}
          </span>
          <span
            className="font-bold"
            style={{ fontSize: scaledPx(44), color: s.labelColor }}
          >
            {label}
          </span>
        </div>
        <ul className="flex flex-col gap-4">
          {items.map((b, i) => (
            <li
              key={i}
              className="flex items-start gap-3 leading-[1.35]"
              style={{ fontSize: scaledPx(34), color: theme.textBody }}
            >
              <span
                className="mt-3 h-3 w-3 shrink-0"
                style={{
                  backgroundColor: s.dotColor,
                  borderRadius: radius(theme, "pill"),
                }}
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <CardContainer
      theme={theme}
      backgroundType={backgroundType}
      pageIndex={pageIndex}
      pageTotal={pageTotal}
      fontScale={fontScale}
    >
      <div className="flex h-full flex-col gap-10 px-16 pt-24 pb-40" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex flex-col items-start gap-5">
          <Tag theme={theme} variant="soft">
            {isAB ? "对照参考" : "对比参考"}
          </Tag>
          <h2
            className="font-black leading-[1.08]"
            style={{ fontSize: scaledPx(72), color: theme.textStrong }}
          >
            {slide.title}
          </h2>
        </div>

        <div className="relative flex flex-1 items-stretch gap-8">
          {column(left, "L", leftLabel)}
          <div className="relative flex items-center justify-center">
            <span
              className="flex h-24 w-24 items-center justify-center font-black"
              style={{
                fontSize: scaledPx(40),
                backgroundColor: isAB ? theme.surfaceSoft : theme.primary,
                color: isAB ? theme.textStrong : theme.primaryText,
                borderRadius: radius(theme, "pill"),
                border: isAB ? `3px solid ${theme.divider}` : "none",
                boxShadow: isAB ? "none" : `0 10px 30px ${withAlpha(theme.primary, 0.31)}`,
              }}
            >
              VS
            </span>
          </div>
          {column(right, "R", rightLabel)}
        </div>

        {slide.highlight && <Highlight theme={theme}>{slide.highlight}</Highlight>}
      </div>
    </CardContainer>
  );
}
