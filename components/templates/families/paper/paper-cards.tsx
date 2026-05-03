import type { ReactNode } from "react";
import { CardContainer } from "@/components/templates/shared/card-container";
import {
  type CardProps,
  type Theme,
  radius,
  scaledPx,
  withAlpha,
} from "@/components/templates/themes/theme";
import { proxyImageUrl } from "@/lib/proxy-image";

function paperColor(theme: Theme) {
  return theme.id === "template-f" ? theme.surface : "#FFFDF7";
}

function PaperShell({
  slide,
  theme,
  backgroundType,
  pageIndex,
  pageTotal,
  fontScale,
  category,
  children,
}: CardProps & { category: string; children: ReactNode }) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="relative flex h-full flex-col p-14" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div
          className="absolute left-24 top-10 z-20 h-10 w-52 rotate-[-3deg]"
          style={{
            backgroundColor: withAlpha(theme.accent, 0.42),
            border: `1px dashed ${withAlpha(theme.primary, 0.35)}`,
          }}
        />
        <div
          className="absolute bottom-12 right-20 z-20 h-8 w-44 rotate-[4deg]"
          style={{
            backgroundColor: withAlpha(theme.primary, 0.16),
            border: `1px dashed ${withAlpha(theme.primary, 0.45)}`,
          }}
        />
        <div
          className="absolute right-16 top-20 z-20 h-24 w-24"
          style={{
            background: `linear-gradient(135deg, transparent 0 50%, ${withAlpha(theme.accent, 0.36)} 51% 100%)`,
          }}
        />
        <div
          className="relative z-10 flex h-full flex-col overflow-hidden px-12 py-10"
          style={{
            backgroundColor: paperColor(theme),
            border: `2px dashed ${withAlpha(theme.primary, 0.45)}`,
            borderRadius: radius(theme, "lg"),
            boxShadow: `0 18px 0 ${withAlpha(theme.primary, 0.08)}, 0 28px 45px ${withAlpha(theme.textStrong, 0.12)}`,
          }}
        >
          <div
            className="pointer-events-none absolute bottom-0 left-24 top-0 w-1"
            style={{ backgroundColor: withAlpha(theme.primary, 0.28) }}
          />
          <div className="pointer-events-none absolute bottom-0 left-4 top-0 flex flex-col justify-around py-16">
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={index}
                className="h-5 w-5 rounded-full"
                style={{
                  backgroundColor: theme.background,
                  border: `1px solid ${withAlpha(theme.primary, 0.26)}`,
                  boxShadow: `inset 0 2px 4px ${withAlpha(theme.textStrong, 0.12)}`,
                }}
              />
            ))}
          </div>
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: [
                `repeating-linear-gradient(0deg, transparent 0 57px, ${withAlpha(theme.divider, 0.48)} 58px 59px)`,
                `radial-gradient(${withAlpha(theme.textStrong, 0.1)} 1px, transparent 1px)`,
              ].join(", "),
              backgroundSize: "auto, 34px 34px",
            }}
          />
          <PaperHeader theme={theme} category={category} pageIndex={pageIndex} pageTotal={pageTotal} />
          <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </CardContainer>
  );
}

function PaperHeader({
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
    <div className="relative z-10 mb-8 flex shrink-0 items-center justify-between">
      <div className="flex items-center gap-4">
        <span
          className="h-8 w-8 rotate-[-8deg]"
          style={{
            backgroundColor: withAlpha(theme.accent, 0.65),
            border: `2px solid ${withAlpha(theme.primary, 0.35)}`,
            borderRadius: radius(theme, "sm"),
          }}
        />
        <span
          className="font-wenkai font-bold tracking-[0.16em]"
          style={{ color: theme.primary, fontSize: scaledPx(24) }}
        >
          {category}
        </span>
      </div>
      {pageIndex != null && pageTotal != null && (
        <span
          className="font-wenkai font-bold tabular-nums"
          style={{ color: theme.textMuted, fontSize: scaledPx(24) }}
        >
          {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

function PaperTitle({
  theme,
  children,
  size = "lg",
}: {
  theme: Theme;
  children: ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const fontSize = size === "xl" ? 116 : size === "lg" ? 88 : 72;
  return (
    <h2
      className="relative z-10 w-fit font-wenkai font-black leading-[1.08]"
      style={{
        color: theme.textStrong,
        fontSize: scaledPx(fontSize),
        textDecoration: `underline ${withAlpha(theme.accent, 0.5)} 18px`,
        textUnderlineOffset: "-10px",
        textDecorationSkipInk: "none",
      }}
    >
      {children}
    </h2>
  );
}

function PaperSubtitle({ theme, children }: { theme: Theme; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p
      className="font-wenkai font-semibold leading-[1.45]"
      style={{ color: theme.textMuted, fontSize: scaledPx(36) }}
    >
      {children}
    </p>
  );
}

function PaperNote({
  theme,
  children,
  index,
  compact = false,
  tilt = 0,
}: {
  theme: Theme;
  children: ReactNode;
  index?: number;
  compact?: boolean;
  tilt?: number;
}) {
  return (
    <div
      className="relative overflow-visible"
      style={{
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <span
        className="absolute left-1/2 top-[-12px] z-20 h-7 w-28 -translate-x-1/2 rotate-[-2deg]"
        style={{
          backgroundColor: withAlpha(theme.accent, 0.44),
          border: `1px dashed ${withAlpha(theme.primary, 0.38)}`,
        }}
      />
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: withAlpha(theme.surfaceSoft, theme.mood === "dark" ? 0.5 : 0.82),
          border: `2px dashed ${withAlpha(theme.primary, 0.48)}`,
          borderRadius: radius(theme, "md"),
          boxShadow: `6px 8px 0 ${withAlpha(theme.primary, 0.1)}`,
        }}
      >
      {index != null && (
        <span
          className="absolute right-3 top-3 z-10 rotate-[5deg] px-3 py-1 font-wenkai font-black tabular-nums"
          style={{
            color: theme.primary,
            backgroundColor: paperColor(theme),
            border: `1px solid ${withAlpha(theme.primary, 0.35)}`,
            borderRadius: radius(theme, "sm"),
            fontSize: scaledPx(22),
            lineHeight: 1,
          }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      )}
      <div className={compact ? "relative z-10 p-4" : "relative z-10 p-6"}>{children}</div>
      </div>
    </div>
  );
}

function PaperText({ theme, children, strong = false }: { theme: Theme; children: ReactNode; strong?: boolean }) {
  return (
    <p
      className={strong ? "font-wenkai font-bold leading-[1.38]" : "font-wenkai font-semibold leading-[1.45]"}
      style={{ color: strong ? theme.textStrong : theme.textBody, fontSize: scaledPx(strong ? 38 : 34) }}
    >
      {children}
    </p>
  );
}

function PaperHighlight({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <div
      className="relative shrink-0 rotate-[-1deg] px-7 py-5"
      style={{
        backgroundColor: withAlpha(theme.accent, 0.3),
        border: `2px dashed ${theme.primary}`,
        borderRadius: radius(theme, "md"),
        boxShadow: `5px 6px 0 ${withAlpha(theme.primary, 0.1)}`,
      }}
    >
      <span
        className="absolute -top-3 left-8 h-6 w-24 rotate-[3deg]"
        style={{ backgroundColor: withAlpha(theme.primary, 0.18) }}
      />
      <PaperText theme={theme} strong>{children}</PaperText>
    </div>
  );
}

function PaperBulletList({ theme, bullets }: { theme: Theme; bullets: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      {bullets.map((bullet, index) => (
        <PaperNote key={index} theme={theme} index={index} tilt={index % 2 === 0 ? -0.7 : 0.7}>
          <PaperText theme={theme}>{bullet}</PaperText>
        </PaperNote>
      ))}
    </div>
  );
}

function PaperBulletGrid({ theme, bullets }: { theme: Theme; bullets: string[] }) {
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {bullets.map((bullet, index) => (
        <PaperNote key={index} theme={theme} index={index} compact tilt={index % 2 === 0 ? -1 : 1}>
          <PaperText theme={theme}>{bullet}</PaperText>
        </PaperNote>
      ))}
    </div>
  );
}

function splitQA(text: string): { q: string; a: string } {
  const sep = ["？", "?", "|", "——", "—"];
  for (const s of sep) {
    const idx = text.indexOf(s);
    if (idx > 0 && idx < text.length - 1) {
      const q = text.slice(0, idx + (s === "？" || s === "?" ? 1 : 0)).trim();
      const a = text.slice(idx + (s === "？" || s === "?" ? 1 : s.length)).trim();
      if (a) return { q, a };
    }
  }
  return { q: text, a: "" };
}

function parseStat(text: string): { value: string; label: string } {
  const match = text.match(/^\s*([\d.]+\s*[%万千亿+]*|[A-Za-z$¥€]+[\d.,]+[%KMB]?)\s*[:：\-—\s]+(.+)$/);
  if (match) return { value: match[1].trim(), label: match[2].trim() };
  const split = text.includes("：") ? text.split("：") : text.includes(":") ? text.split(":") : null;
  if (split && split.length >= 2) return { value: split[0].trim(), label: split.slice(1).join(":").trim() };
  return { value: "", label: text };
}

function ImagePanel({ slide, theme, height = 360 }: { slide: CardProps["slide"]; theme: Theme; height?: number }) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  if (!imgSrc) {
    return (
      <div
        className="shrink-0"
        style={{
          height,
          backgroundColor: withAlpha(theme.accent, 0.18),
          border: `2px dashed ${withAlpha(theme.primary, 0.35)}`,
          borderRadius: radius(theme, "lg"),
        }}
      />
    );
  }
  return (
    <div
      className="shrink-0 overflow-hidden"
      style={{
        height,
        border: `8px solid ${paperColor(theme)}`,
        outline: `2px dashed ${withAlpha(theme.primary, 0.45)}`,
        borderRadius: radius(theme, "md"),
        transform: "rotate(-1deg)",
      }}
    >
      <div
        className="h-full w-full"
        style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: "center", backgroundSize: "cover" }}
      />
    </div>
  );
}

export function CoverCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);

  if (imgSrc) {
    return (
      <CardContainer theme={theme} backgroundType={props.backgroundType} fontScale={props.fontScale}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
          }}
        />
        <div className="relative z-10 flex h-full flex-col p-14">
          <div
            className="relative flex h-full flex-col overflow-hidden px-12 py-10"
            style={{
              backgroundColor: paperColor(theme),
              border: `2px dashed ${withAlpha(theme.primary, 0.45)}`,
              borderRadius: radius(theme, "lg"),
              boxShadow: `0 18px 0 ${withAlpha(theme.primary, 0.08)}, 0 28px 45px ${withAlpha(theme.textStrong, 0.12)}`,
            }}
          >
            <PaperHeader theme={theme} category="手账封面" pageIndex={props.pageIndex} pageTotal={props.pageTotal} />
            <div className="flex flex-1 flex-col justify-center gap-9">
              <div className="flex items-start justify-between gap-6">
              <div className="w-fit rotate-[-2deg]">
                <PaperNote theme={theme}>
                  <span className="font-wenkai font-bold tracking-[0.12em]" style={{ color: theme.primary, fontSize: scaledPx(26) }}>
                    NOTEBOOK
                  </span>
                </PaperNote>
              </div>
                <div
                  className="rotate-[4deg] px-5 py-4 text-center font-wenkai font-black"
                  style={{
                    color: theme.primary,
                    border: `3px double ${theme.primary}`,
                    borderRadius: radius(theme, "md"),
                    fontSize: scaledPx(28),
                  }}
                >
                  DAILY
                  <br />
                  MEMO
                </div>
              </div>
              <PaperTitle theme={theme} size="xl">{slide.title}</PaperTitle>
              <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
              {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
            </div>
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <PaperShell {...props} category="手账封面">
      <div className="flex flex-1 flex-col justify-center gap-9">
        <div className="flex items-start justify-between gap-6">
        <div className="w-fit rotate-[-2deg]">
          <PaperNote theme={theme}>
            <span className="font-wenkai font-bold tracking-[0.12em]" style={{ color: theme.primary, fontSize: scaledPx(26) }}>
              NOTEBOOK
            </span>
          </PaperNote>
        </div>
          <div
            className="rotate-[4deg] px-5 py-4 text-center font-wenkai font-black"
            style={{
              color: theme.primary,
              border: `3px double ${theme.primary}`,
              borderRadius: radius(theme, "md"),
              fontSize: scaledPx(28),
            }}
          >
            DAILY
            <br />
            MEMO
          </div>
        </div>
        <PaperTitle theme={theme} size="xl">{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function TextCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="手写正文">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <PaperBulletList theme={theme} bullets={slide.bullets} />
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function TextImageCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  const content = (
    <div className="flex flex-1 flex-col gap-5">
      {hasImage && pos === "top" && <ImagePanel slide={slide} theme={theme} />}
      <PaperTitle theme={theme} size="md">{slide.title}</PaperTitle>
      <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
      <PaperBulletGrid theme={theme} bullets={slide.bullets} />
      {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      {hasImage && pos === "bottom" && <ImagePanel slide={slide} theme={theme} />}
    </div>
  );

  if (hasImage && pos === "background") {
    return (
      <CardContainer theme={theme} backgroundType={props.backgroundType} fontScale={props.fontScale}>
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
          }}
        />
        <div className="relative z-10 flex h-full flex-col p-14">
          <div
            className="relative flex h-full flex-col overflow-hidden px-12 py-10"
            style={{
              backgroundColor: paperColor(theme),
              border: `2px dashed ${withAlpha(theme.primary, 0.45)}`,
              borderRadius: radius(theme, "lg"),
              boxShadow: `0 18px 0 ${withAlpha(theme.primary, 0.08)}, 0 28px 45px ${withAlpha(theme.textStrong, 0.12)}`,
            }}
          >
            <PaperHeader theme={theme} category="图文剪贴" pageIndex={props.pageIndex} pageTotal={props.pageTotal} />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              <PaperTitle theme={theme} size="md">{slide.title}</PaperTitle>
              <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
              <PaperBulletGrid theme={theme} bullets={slide.bullets} />
              {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
            </div>
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <PaperShell {...props} category="图文剪贴">
      {content}
    </PaperShell>
  );
}

export function SummaryCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="便签总结">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <PaperBulletGrid theme={theme} bullets={slide.bullets} />
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function CTACard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="最后一页">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <PaperTitle theme={theme} size="xl">{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
        <PaperBulletGrid theme={theme} bullets={slide.bullets} />
      </div>
    </PaperShell>
  );
}

export function QuoteCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="摘录">
      <div className="flex flex-1 flex-col justify-center gap-8">
        <span className="font-wenkai font-black leading-none" style={{ color: withAlpha(theme.primary, 0.3), fontSize: scaledPx(150) }}>
          “
        </span>
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <PaperBulletList theme={theme} bullets={slide.bullets} />
      </div>
    </PaperShell>
  );
}

export function TipsCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="小贴士">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <PaperBulletGrid theme={theme} bullets={slide.bullets} />
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function ComparisonCard(props: CardProps) {
  const { slide, theme } = props;
  const mid = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, mid);
  const right = slide.bullets.slice(mid);
  const isAB = slide.comparisonStyle === "ab";
  return (
    <PaperShell {...props} category="对照页">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme} size="md">{slide.title}</PaperTitle>
        <div className="grid flex-1 gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <PaperNote theme={theme} tilt={-1}>
            <PaperText theme={theme} strong>{slide.labelLeft || (isAB ? "方案 A" : "推荐")}</PaperText>
            <div className="mt-4 flex flex-col gap-3">
              {left.map((item, index) => <PaperText key={index} theme={theme}>{item}</PaperText>)}
            </div>
          </PaperNote>
          <PaperNote theme={theme} tilt={1}>
            <PaperText theme={theme} strong>{slide.labelRight || (isAB ? "方案 B" : "留意")}</PaperText>
            <div className="mt-4 flex flex-col gap-3">
              {right.map((item, index) => <PaperText key={index} theme={theme}>{item}</PaperText>)}
            </div>
          </PaperNote>
        </div>
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function StepCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="步骤">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <PaperBulletList theme={theme} bullets={slide.bullets} />
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>
    </PaperShell>
  );
}

export function StatsCard(props: CardProps) {
  const { slide, theme } = props;
  const stats = slide.bullets.map(parseStat);
  return (
    <PaperShell {...props} category="数据贴纸">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {stats.map((stat, index) => (
            <PaperNote key={index} theme={theme} index={index} tilt={index % 2 === 0 ? -1 : 1}>
              <span className="font-wenkai font-black leading-none" style={{ color: theme.primary, fontSize: scaledPx(76) }}>
                {stat.value || `0${index + 1}`}
              </span>
              <PaperText theme={theme}>{stat.label}</PaperText>
            </PaperNote>
          ))}
        </div>
      </div>
    </PaperShell>
  );
}

export function FaqCard(props: CardProps) {
  const { slide, theme } = props;
  const items = slide.bullets.map(splitQA);
  return (
    <PaperShell {...props} category="问答便签">
      <div className="flex flex-1 flex-col gap-5">
        <PaperTitle theme={theme} size="md">{slide.title}</PaperTitle>
        {items.map((item, index) => (
          <PaperNote key={index} theme={theme} index={index} tilt={index % 2 === 0 ? -0.8 : 0.8}>
            <PaperText theme={theme} strong>Q：{item.q}</PaperText>
            {item.a && <div className="mt-3"><PaperText theme={theme}>A：{item.a}</PaperText></div>}
          </PaperNote>
        ))}
      </div>
    </PaperShell>
  );
}

export function ChecklistCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="检查清单">
      <div className="flex flex-1 flex-col gap-6">
        <PaperTitle theme={theme}>{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {slide.bullets.map((item, index) => (
            <PaperNote key={index} theme={theme} compact tilt={index % 2 === 0 ? -1 : 1}>
              <div className="flex items-start gap-4">
                <span
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center font-wenkai font-black"
                  style={{
                    color: theme.primary,
                    border: `2px solid ${theme.primary}`,
                    borderRadius: radius(theme, "sm"),
                    fontSize: scaledPx(24),
                  }}
                >
                  ✓
                </span>
                <PaperText theme={theme}>{item}</PaperText>
              </div>
            </PaperNote>
          ))}
        </div>
      </div>
    </PaperShell>
  );
}

export function TimelineCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <PaperShell {...props} category="时间轴">
      <div className="flex flex-1 flex-col gap-5">
        <PaperTitle theme={theme} size="md">{slide.title}</PaperTitle>
        <PaperSubtitle theme={theme}>{slide.subtitle}</PaperSubtitle>
        <div className="flex flex-col gap-4">
          {slide.bullets.map((item, index) => (
            <div key={index} className="flex gap-5">
              <span className="font-wenkai font-black tabular-nums" style={{ color: theme.primary, fontSize: scaledPx(42) }}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <PaperNote theme={theme} compact tilt={index % 2 === 0 ? -0.7 : 0.7}>
                  <PaperText theme={theme}>{item}</PaperText>
                </PaperNote>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PaperShell>
  );
}

export function ProseCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  const content = (
    <>
      {hasImage && pos === "background" && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.08,
          }}
        />
      )}

      {hasImage && pos === "top" && (
        <div className="mb-5">
          <ImagePanel slide={slide} theme={theme} />
        </div>
      )}

      <div className="relative z-10 flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-5">
          {slide.bullets.map((paragraph, index) => (
            <PaperNote key={index} theme={theme} tilt={index % 2 === 0 ? -0.5 : 0.5}>
              <p
                className="font-wenkai font-semibold leading-[1.7]"
                style={{ color: theme.textBody, fontSize: scaledPx(36), textAlign: "justify" }}
              >
                {paragraph}
              </p>
            </PaperNote>
          ))}
        </div>
        {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
      </div>

      {hasImage && pos === "bottom" && (
        <div className="mt-5">
          <ImagePanel slide={slide} theme={theme} />
        </div>
      )}
    </>
  );

  if (pos === "background") {
    return (
      <CardContainer theme={theme} backgroundType={props.backgroundType} fontScale={props.fontScale}>
        {hasImage && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url("${imgSrc}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.08,
            }}
          />
        )}
        <div className="relative z-10 flex h-full flex-col p-14">
          <div
            className="relative flex h-full flex-col overflow-hidden px-12 py-10"
            style={{
              backgroundColor: paperColor(theme),
              border: `2px dashed ${withAlpha(theme.primary, 0.45)}`,
              borderRadius: radius(theme, "lg"),
              boxShadow: `0 18px 0 ${withAlpha(theme.primary, 0.08)}, 0 28px 45px ${withAlpha(theme.textStrong, 0.12)}`,
            }}
          >
            <PaperHeader theme={theme} category="长文摘记" pageIndex={props.pageIndex} pageTotal={props.pageTotal} />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col">
              {slide.bullets.map((paragraph, index) => (
                <PaperNote key={index} theme={theme} tilt={index % 2 === 0 ? -0.5 : 0.5}>
                  <p
                    className="font-wenkai font-semibold leading-[1.7]"
                    style={{ color: theme.textBody, fontSize: scaledPx(36), textAlign: "justify" }}
                  >
                    {paragraph}
                  </p>
                </PaperNote>
              ))}
              {slide.highlight && <PaperHighlight theme={theme}>{slide.highlight}</PaperHighlight>}
            </div>
          </div>
        </div>
      </CardContainer>
    );
  }

  return (
    <PaperShell {...props} category="长文摘记">
      {content}
    </PaperShell>
  );
}
