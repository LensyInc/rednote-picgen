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

type TileTone = "surface" | "soft" | "primary" | "accent";

function tileColor(theme: Theme, tone: TileTone) {
  if (tone === "primary") return theme.primary;
  if (tone === "accent") return theme.accent;
  if (tone === "soft") return theme.surfaceSoft;
  return theme.surface;
}

function tileTextColor(theme: Theme, tone: TileTone) {
  return tone === "primary" ? theme.primaryText : theme.textStrong;
}

function BentoShell({
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
      <div className="flex h-full flex-col gap-8 p-16" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className="h-8 w-8"
              style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }}
            />
            <span
              className="font-black tracking-[0.16em]"
              style={{ color: theme.primary, fontSize: scaledPx(24) }}
            >
              {category.toUpperCase()}
            </span>
          </div>
          {pageIndex != null && pageTotal != null && (
            <span
              className="font-black tabular-nums"
              style={{ color: theme.textMuted, fontSize: scaledPx(24) }}
            >
              {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
            </span>
          )}
        </div>
        <div
          className="grid min-h-0 flex-1 auto-rows-fr gap-5"
          style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
        >
          {children}
        </div>
      </div>
    </CardContainer>
  );
}

function BentoTile({
  theme,
  children,
  className = "",
  tone = "surface",
  padded = true,
}: {
  theme: Theme;
  children: ReactNode;
  className?: string;
  tone?: TileTone;
  padded?: boolean;
}) {
  const bg = tileColor(theme, tone);
  return (
    <div
      className={`relative min-h-0 overflow-hidden ${padded ? "p-7" : ""} ${className}`}
      style={{
        backgroundColor: bg,
        color: tileTextColor(theme, tone),
        borderRadius: radius(theme, "lg"),
        border: `1px solid ${tone === "primary" ? withAlpha(theme.primaryText, 0.22) : theme.divider}`,
        boxShadow: `0 18px 40px ${withAlpha(theme.textStrong, theme.mood === "dark" ? 0.18 : 0.08)}`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full"
        style={{ backgroundColor: withAlpha(tone === "primary" ? theme.primaryText : theme.primary, 0.1) }}
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}

function BentoTitle({
  theme,
  children,
  tone = "surface",
  size = "lg",
}: {
  theme: Theme;
  children: ReactNode;
  tone?: TileTone;
  size?: "md" | "lg" | "xl";
}) {
  const fontSize = size === "xl" ? 108 : size === "lg" ? 78 : 58;
  return (
    <h2
      className="font-black leading-[1.04] tracking-tight"
      style={{ color: tileTextColor(theme, tone), fontSize: scaledPx(fontSize) }}
    >
      {children}
    </h2>
  );
}

function BentoText({
  theme,
  children,
  tone = "surface",
  strong = false,
}: {
  theme: Theme;
  children: ReactNode;
  tone?: TileTone;
  strong?: boolean;
}) {
  return (
    <p
      className={strong ? "font-black leading-[1.25]" : "font-semibold leading-[1.42]"}
      style={{
        color: tone === "primary" ? theme.primaryText : strong ? theme.textStrong : theme.textBody,
        fontSize: scaledPx(strong ? 38 : 32),
      }}
    >
      {children}
    </p>
  );
}

function BentoBadge({ theme, children, tone = "surface" }: { theme: Theme; children: ReactNode; tone?: TileTone }) {
  return (
    <span
      className="w-fit rounded-full px-4 py-2 font-black tracking-[0.08em]"
      style={{
        backgroundColor: tone === "primary" ? withAlpha(theme.primaryText, 0.18) : withAlpha(theme.primary, 0.1),
        color: tone === "primary" ? theme.primaryText : theme.primary,
        fontSize: scaledPx(20),
      }}
    >
      {children}
    </span>
  );
}

function ImageTile({ slide, theme, className }: { slide: CardProps["slide"]; theme: Theme; className: string }) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  return (
    <BentoTile theme={theme} className={className} padded={false}>
      {imgSrc ? (
        <div
          className="h-full w-full"
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: "center", backgroundSize: "cover" }}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(135deg, ${withAlpha(theme.primary, 0.22)}, ${withAlpha(theme.accent, 0.32)})`,
          }}
        />
      )}
    </BentoTile>
  );
}

function HighlightTile({ theme, children, className = "" }: { theme: Theme; children: ReactNode; className?: string }) {
  return (
    <BentoTile theme={theme} tone="primary" className={className || "col-span-6 row-span-1"}>
      <div className="flex h-full items-center justify-between gap-5">
        <BentoBadge theme={theme} tone="primary">KEY</BentoBadge>
        <div className="flex-1">
          <BentoText theme={theme} tone="primary" strong>{children}</BentoText>
        </div>
      </div>
    </BentoTile>
  );
}

function TitleTile({
  slide,
  theme,
  className = "col-span-6 row-span-1",
  vertical = false,
}: {
  slide: CardProps["slide"];
  theme: Theme;
  className?: string;
  vertical?: boolean;
}) {
  if (vertical) {
    return (
      <BentoTile theme={theme} tone="primary" className={className}>
        <div className="flex h-full items-center justify-center gap-4">
          <BentoBadge theme={theme} tone="primary">TITLE</BentoBadge>
          <h2
            className="font-black tracking-[0.1em]"
            style={{
              color: theme.primaryText,
              fontSize: scaledPx(42),
              lineHeight: 1.05,
              writingMode: "vertical-rl",
            }}
          >
            {slide.title}
          </h2>
        </div>
      </BentoTile>
    );
  }

  return (
    <BentoTile theme={theme} tone="primary" className={className}>
      <div className="flex h-full items-center justify-between gap-6">
        <BentoTitle theme={theme} tone="primary" size="md">{slide.title}</BentoTitle>
        {slide.subtitle && (
          <p
            className="max-w-[42%] font-semibold leading-[1.35]"
            style={{ color: theme.primaryText, fontSize: scaledPx(28) }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
    </BentoTile>
  );
}

function SubtitleTile({ slide, theme, className = "col-span-3 row-span-1" }: { slide: CardProps["slide"]; theme: Theme; className?: string }) {
  if (!slide.subtitle) return null;
  return (
    <BentoTile theme={theme} tone="soft" className={className}>
      <div className="flex h-full items-center">
        <BentoText theme={theme} strong>{slide.subtitle}</BentoText>
      </div>
    </BentoTile>
  );
}

function BulletTiles({ theme, bullets, start = 0 }: { theme: Theme; bullets: string[]; start?: number }) {
  return (
    <>
      {bullets.map((bullet, index) => (
        <BentoTile key={index} theme={theme} className="col-span-3 row-span-1" tone={index % 3 === 1 ? "soft" : "surface"}>
          <div className="flex h-full flex-col justify-between gap-4">
            <BentoBadge theme={theme}>{String(start + index + 1).padStart(2, "0")}</BentoBadge>
            <BentoText theme={theme}>{bullet}</BentoText>
          </div>
        </BentoTile>
      ))}
    </>
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

export function CoverCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento cover">
      <BentoTile theme={theme} tone="primary" className="col-span-4 row-span-4">
        <div className="flex h-full flex-col justify-between gap-8">
          <BentoBadge theme={theme} tone="primary">FEATURE</BentoBadge>
          <BentoTitle theme={theme} tone="primary" size="xl">{slide.title}</BentoTitle>
          {slide.subtitle && <BentoText theme={theme} tone="primary">{slide.subtitle}</BentoText>}
        </div>
      </BentoTile>
      <ImageTile slide={slide} theme={theme} className="col-span-2 row-span-2" />
      <BentoTile theme={theme} tone="soft" className="col-span-2 row-span-2">
        <div className="flex h-full flex-col justify-between">
          <BentoBadge theme={theme}>NOTE</BentoBadge>
          <BentoText theme={theme} strong>{slide.highlight || slide.bullets[0] || "重点内容"}</BentoText>
        </div>
      </BentoTile>
    </BentoShell>
  );
}

export function TextCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento text">
      <TitleTile slide={slide} theme={theme} />
      <BulletTiles theme={theme} bullets={slide.bullets} />
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function TextImageCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento image">
      <ImageTile slide={slide} theme={theme} className="col-span-3 row-span-3" />
      <TitleTile slide={slide} theme={theme} className="col-span-3 row-span-1" vertical />
      <SubtitleTile slide={slide} theme={theme} className="col-span-3 row-span-1" />
      {slide.highlight && <HighlightTile theme={theme} className="col-span-3 row-span-1">{slide.highlight}</HighlightTile>}
      <BulletTiles theme={theme} bullets={slide.bullets.slice(0, 4)} />
    </BentoShell>
  );
}

export function SummaryCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento summary">
      <TitleTile slide={slide} theme={theme} />
      <BulletTiles theme={theme} bullets={slide.bullets} />
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function CTACard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento action">
      <TitleTile slide={slide} theme={theme} />
      <BentoTile theme={theme} tone="primary" className="col-span-4 row-span-2">
        <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
          <BentoBadge theme={theme} tone="primary">ACTION</BentoBadge>
          <BentoText theme={theme} tone="primary" strong>{slide.highlight ? "查看重点提示" : slide.subtitle || "下一步行动"}</BentoText>
        </div>
      </BentoTile>
      <BulletTiles theme={theme} bullets={slide.bullets.slice(0, 2)} />
      {slide.highlight && <HighlightTile theme={theme} className="col-span-2 row-span-1">{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function QuoteCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento quote">
      <BentoTile theme={theme} tone="primary" className="col-span-4 row-span-4">
        <div className="flex h-full flex-col justify-center gap-6">
          <span className="font-black leading-none" style={{ color: withAlpha(theme.primaryText, 0.35), fontSize: scaledPx(170) }}>
            &ldquo;
          </span>
          <BentoTitle theme={theme} tone="primary">{slide.title}</BentoTitle>
        </div>
      </BentoTile>
      <BentoTile theme={theme} tone="soft" className="col-span-2 row-span-2">
        <BentoText theme={theme} strong>{slide.subtitle || "摘录"}</BentoText>
      </BentoTile>
      <BulletTiles theme={theme} bullets={slide.bullets.slice(0, 2)} />
      {slide.highlight && <HighlightTile theme={theme} className="col-span-2 row-span-1">{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function TipsCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento tips">
      <TitleTile slide={slide} theme={theme} />
      <BulletTiles theme={theme} bullets={slide.bullets} />
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function ComparisonCard(props: CardProps) {
  const { slide, theme } = props;
  const mid = Math.ceil(slide.bullets.length / 2);
  const isAB = slide.comparisonStyle === "ab";
  return (
    <BentoShell {...props} category="bento compare">
      <TitleTile slide={slide} theme={theme} />
      <BentoTile theme={theme} tone="soft" className="col-span-3 row-span-3">
        <BentoBadge theme={theme}>{slide.labelLeft || (isAB ? "方案 A" : "推荐")}</BentoBadge>
        <div className="mt-5 flex flex-col gap-4">
          {slide.bullets.slice(0, mid).map((item, index) => <BentoText key={index} theme={theme}>{item}</BentoText>)}
        </div>
      </BentoTile>
      <BentoTile theme={theme} className="col-span-3 row-span-3">
        <BentoBadge theme={theme}>{slide.labelRight || (isAB ? "方案 B" : "留意")}</BentoBadge>
        <div className="mt-5 flex flex-col gap-4">
          {slide.bullets.slice(mid).map((item, index) => <BentoText key={index} theme={theme}>{item}</BentoText>)}
        </div>
      </BentoTile>
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function StepCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento steps">
      <TitleTile slide={slide} theme={theme} />
      <BulletTiles theme={theme} bullets={slide.bullets} />
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function StatsCard(props: CardProps) {
  const { slide, theme } = props;
  const stats = slide.bullets.map(parseStat);
  return (
    <BentoShell {...props} category="bento stats">
      <TitleTile slide={slide} theme={theme} />
      {stats.map((stat, index) => (
        <BentoTile key={index} theme={theme} className={index === 0 ? "col-span-3 row-span-2" : "col-span-2 row-span-1"} tone={index % 2 === 0 ? "soft" : "surface"}>
          <span className="font-black leading-none" style={{ color: theme.primary, fontSize: scaledPx(index === 0 ? 86 : 58) }}>
            {stat.value || `0${index + 1}`}
          </span>
          <BentoText theme={theme}>{stat.label}</BentoText>
        </BentoTile>
      ))}
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function FaqCard(props: CardProps) {
  const { slide, theme } = props;
  const items = slide.bullets.map(splitQA);
  return (
    <BentoShell {...props} category="bento faq">
      <TitleTile slide={slide} theme={theme} />
      {items.map((item, index) => (
        <BentoTile key={index} theme={theme} className="col-span-3 row-span-1" tone={index % 2 === 0 ? "surface" : "soft"}>
          <BentoText theme={theme} strong>Q: {item.q}</BentoText>
          {item.a && <div className="mt-3"><BentoText theme={theme}>A: {item.a}</BentoText></div>}
        </BentoTile>
      ))}
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function ChecklistCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento checklist">
      <TitleTile slide={slide} theme={theme} />
      {slide.bullets.map((item, index) => (
        <BentoTile key={index} theme={theme} className="col-span-3 row-span-1">
          <div className="flex items-start gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black"
              style={{ backgroundColor: theme.primary, color: theme.primaryText, fontSize: scaledPx(24) }}
            >
              ✓
            </span>
            <BentoText theme={theme}>{item}</BentoText>
          </div>
        </BentoTile>
      ))}
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function TimelineCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento timeline">
      <TitleTile slide={slide} theme={theme} />
      {slide.bullets.map((item, index) => (
        <BentoTile key={index} theme={theme} className="col-span-3 row-span-1" tone={index % 2 === 0 ? "soft" : "surface"}>
          <BentoBadge theme={theme}>{String(index + 1).padStart(2, "0")}</BentoBadge>
          <div className="mt-4"><BentoText theme={theme}>{item}</BentoText></div>
        </BentoTile>
      ))}
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}

export function ProseCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <BentoShell {...props} category="bento prose">
      <TitleTile slide={slide} theme={theme} />
      {slide.bullets.map((paragraph, index) => (
        <BentoTile key={index} theme={theme} className={index === 0 ? "col-span-6 row-span-2" : "col-span-3 row-span-1"} tone={index % 2 === 0 ? "surface" : "soft"}>
          <BentoText theme={theme}>{paragraph}</BentoText>
        </BentoTile>
      ))}
      {slide.highlight && <HighlightTile theme={theme}>{slide.highlight}</HighlightTile>}
    </BentoShell>
  );
}
