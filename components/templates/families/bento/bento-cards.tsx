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

type Tone = "paper" | "soft" | "ink" | "accent";

const MOSAIC_SPANS = [
  "col-span-4 row-span-2",
  "col-span-2 row-span-1",
  "col-span-2 row-span-2",
  "col-span-3 row-span-1",
  "col-span-3 row-span-2",
  "col-span-2 row-span-1",
  "col-span-4 row-span-1",
  "col-span-2 row-span-2",
];

function spanFor(index: number) {
  return MOSAIC_SPANS[index % MOSAIC_SPANS.length];
}

function toneBackground(theme: Theme, tone: Tone) {
  if (tone === "ink") return theme.primary;
  if (tone === "accent") return theme.accent;
  if (tone === "soft") return theme.surfaceSoft;
  return theme.surface;
}

function toneText(theme: Theme, tone: Tone) {
  return tone === "ink" ? theme.primaryText : theme.textStrong;
}

function Shell({
  slide,
  theme,
  backgroundType,
  pageIndex,
  pageTotal,
  fontScale,
  label,
  children,
}: CardProps & { label: string; children: ReactNode }) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col gap-5 p-14" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex shrink-0 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-7 w-7" style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }} />
            <span className="font-black tracking-[0.18em]" style={{ color: theme.primary, fontSize: scaledPx(22) }}>
              {label.toUpperCase()}
            </span>
          </div>
          {pageIndex != null && pageTotal != null && (
            <span className="font-black tabular-nums" style={{ color: theme.textMuted, fontSize: scaledPx(22) }}>
              {String(pageIndex).padStart(2, "0")} / {String(pageTotal).padStart(2, "0")}
            </span>
          )}
        </div>
        {children}
      </div>
    </CardContainer>
  );
}

function Mosaic({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid min-h-0 flex-1 auto-rows-fr gap-4"
      style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
    >
      {children}
    </div>
  );
}

function Tile({
  theme,
  children,
  className,
  tone = "paper",
  pad = "normal",
  bgOpacity = 1,
}: {
  theme: Theme;
  children: ReactNode;
  className: string;
  tone?: Tone;
  pad?: "normal" | "tight" | "none";
  bgOpacity?: number;
}) {
  const padding = pad === "none" ? "" : pad === "tight" ? "p-5" : "p-7";
  return (
    <div
      className={`relative min-h-0 overflow-hidden ${padding} ${className}`}
      style={{
        backgroundColor: withAlpha(toneBackground(theme, tone), bgOpacity),
        color: toneText(theme, tone),
        borderRadius: radius(theme, "lg"),
        border: `1px solid ${tone === "ink" ? withAlpha(theme.primaryText, 0.22) : theme.divider}`,
        boxShadow: `0 12px 32px ${withAlpha(theme.textStrong, theme.mood === "dark" ? 0.18 : 0.08)}`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full"
        style={{ backgroundColor: withAlpha(tone === "ink" ? theme.primaryText : theme.primary, 0.1) }}
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}

function TitleBar({ slide, theme }: { slide: CardProps["slide"]; theme: Theme }) {
  return (
    <Tile theme={theme} tone="ink" className="shrink-0" pad="tight">
      <h2 className="font-black leading-[1.04] tracking-tight" style={{ color: theme.primaryText, fontSize: scaledPx(50) }}>
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p className="mt-2 font-semibold leading-[1.35]" style={{ color: theme.primaryText, fontSize: scaledPx(27) }}>
          {slide.subtitle}
        </p>
      )}
    </Tile>
  );
}

function HighlightBar({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <Tile theme={theme} tone="ink" className="shrink-0" pad="tight">
      <div className="flex items-center gap-5">
        <span
          className="shrink-0 rounded-full px-4 py-1 font-black tracking-[0.08em]"
          style={{ backgroundColor: withAlpha(theme.primaryText, 0.18), color: theme.primaryText, fontSize: scaledPx(18) }}
        >
          KEY
        </span>
        <p className="font-black leading-[1.25]" style={{ color: theme.primaryText, fontSize: scaledPx(30) }}>
          {children}
        </p>
      </div>
    </Tile>
  );
}

function Badge({ theme, children, tone = "paper" }: { theme: Theme; children: ReactNode; tone?: Tone }) {
  return (
    <span
      className="w-fit rounded-full px-4 py-2 font-black tracking-[0.08em]"
      style={{
        backgroundColor: tone === "ink" ? withAlpha(theme.primaryText, 0.16) : withAlpha(theme.primary, 0.1),
        color: tone === "ink" ? theme.primaryText : theme.primary,
        fontSize: scaledPx(18),
      }}
    >
      {children}
    </span>
  );
}

function Text({ theme, children, tone = "paper", strong = false }: { theme: Theme; children: ReactNode; tone?: Tone; strong?: boolean }) {
  return (
    <p
      className={strong ? "font-black leading-[1.25]" : "font-semibold leading-[1.38]"}
      style={{
        color: tone === "ink" ? theme.primaryText : strong ? theme.textStrong : theme.textBody,
        fontSize: scaledPx(strong ? 36 : 31),
      }}
    >
      {children}
    </p>
  );
}

function ImageBlock({ slide, theme, className }: { slide: CardProps["slide"]; theme: Theme; className: string }) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  return (
    <Tile theme={theme} className={className} pad="none">
      {imgSrc ? (
        <div className="h-full w-full" style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: "center", backgroundSize: "cover" }} />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary, 0.24)}, ${withAlpha(theme.accent, 0.35)})` }}
        />
      )}
    </Tile>
  );
}

function BulletMosaic({ theme, bullets, offset = 0 }: { theme: Theme; bullets: string[]; offset?: number }) {
  return (
    <>
      {bullets.map((bullet, index) => (
        <Tile key={index} theme={theme} className={spanFor(index + offset)} tone={(index + offset) % 3 === 1 ? "soft" : "paper"}>
          <div className="flex h-full flex-col justify-between gap-4">
            <Badge theme={theme}>{String(index + 1).padStart(2, "0")}</Badge>
            <Text theme={theme}>{bullet}</Text>
          </div>
        </Tile>
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

function StandardPage({
  props,
  label,
  children,
}: {
  props: CardProps;
  label: string;
  children: ReactNode;
}) {
  const { slide, theme } = props;
  return (
    <Shell {...props} label={label}>
      <TitleBar slide={slide} theme={theme} />
      <Mosaic>{children}</Mosaic>
      {slide.highlight && <HighlightBar theme={theme}>{slide.highlight}</HighlightBar>}
    </Shell>
  );
}

export function CoverCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;

  const mosaic = (
    <Mosaic>
      <Tile theme={theme} tone="ink" className="col-span-4 row-span-5" bgOpacity={hasImage ? 0.72 : 1}>
        <div className="flex h-full flex-col justify-between gap-8">
          <Badge theme={theme} tone="ink">FEATURE</Badge>
          <h1 className="font-black leading-[1.02] tracking-tight" style={{ color: theme.primaryText, fontSize: scaledPx(110) }}>
            {slide.title}
          </h1>
          {slide.subtitle && <Text theme={theme} tone="ink">{slide.subtitle}</Text>}
        </div>
      </Tile>
      {!hasImage && <ImageBlock slide={slide} theme={theme} className="col-span-2 row-span-3" />}
      <Tile theme={theme} tone="soft" className="col-span-2 row-span-2" bgOpacity={hasImage ? 0.65 : 1}>
        <div className="flex h-full flex-col justify-between gap-5">
          <Badge theme={theme}>NOTE</Badge>
          <Text theme={theme} strong>{slide.highlight || slide.bullets[0] || "重点内容"}</Text>
        </div>
      </Tile>
    </Mosaic>
  );

  if (hasImage) {
    return (
      <CardContainer theme={theme} backgroundType={props.backgroundType} fontScale={props.fontScale}>
        <div
          className="absolute inset-0 z-[1]"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 z-[2]" style={{ backgroundColor: theme.background, opacity: 0.35 }} />
        <div className="relative z-10 flex h-full flex-col gap-5 p-14" style={{ textAlign: slide.textAlign ?? "left" }}>
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-7 w-7" style={{ backgroundColor: theme.primary, borderRadius: radius(theme, "sm") }} />
              <span className="font-black tracking-[0.18em]" style={{ color: theme.primary, fontSize: scaledPx(22) }}>
                BENTO COVER
              </span>
            </div>
            {props.pageIndex != null && props.pageTotal != null && (
              <span className="font-black tabular-nums" style={{ color: theme.textMuted, fontSize: scaledPx(22) }}>
                {String(props.pageIndex).padStart(2, "0")} / {String(props.pageTotal).padStart(2, "0")}
              </span>
            )}
          </div>
          {mosaic}
        </div>
      </CardContainer>
    );
  }

  return (
    <Shell {...props} label="bento cover">
      {mosaic}
    </Shell>
  );
}

export function TextCard(props: CardProps) {
  return (
    <StandardPage props={props} label="bento text">
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} />
    </StandardPage>
  );
}

export function TextImageCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props} label="bento image">
      <ImageBlock slide={slide} theme={theme} className="col-span-3 row-span-3" />
      <BulletMosaic theme={theme} bullets={slide.bullets.slice(0, 5)} offset={1} />
    </StandardPage>
  );
}

export function SummaryCard(props: CardProps) {
  return (
    <StandardPage props={props} label="bento summary">
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} offset={2} />
    </StandardPage>
  );
}

export function CTACard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props} label="bento action">
      <Tile theme={theme} tone="ink" className="col-span-4 row-span-2">
        <div className="flex h-full items-center justify-center text-center">
          <Text theme={theme} tone="ink" strong>{slide.highlight || slide.subtitle || "下一步行动"}</Text>
        </div>
      </Tile>
      <BulletMosaic theme={theme} bullets={slide.bullets.slice(0, 3)} offset={3} />
    </StandardPage>
  );
}

export function QuoteCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props} label="bento quote">
      <Tile theme={theme} tone="ink" className="col-span-4 row-span-3">
        <div className="flex h-full flex-col justify-center gap-5">
          <span className="font-black leading-none" style={{ color: withAlpha(theme.primaryText, 0.32), fontSize: scaledPx(140) }}>
            &ldquo;
          </span>
          <Text theme={theme} tone="ink" strong>{slide.bullets[0] || slide.highlight || slide.title}</Text>
        </div>
      </Tile>
      <Tile theme={theme} tone="soft" className="col-span-2 row-span-1">
        <Text theme={theme} strong>{slide.subtitle || "摘录"}</Text>
      </Tile>
      <BulletMosaic theme={theme} bullets={slide.bullets.slice(1, 4)} offset={2} />
    </StandardPage>
  );
}

export function TipsCard(props: CardProps) {
  return (
    <StandardPage props={props} label="bento tips">
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} offset={1} />
    </StandardPage>
  );
}

export function ComparisonCard(props: CardProps) {
  const { slide, theme } = props;
  const mid = Math.ceil(slide.bullets.length / 2);
  const isAB = slide.comparisonStyle === "ab";
  return (
    <StandardPage props={props} label="bento compare">
      <Tile theme={theme} tone="soft" className="col-span-3 row-span-3">
        <Badge theme={theme}>{slide.labelLeft || (isAB ? "方案 A" : "推荐")}</Badge>
        <div className="mt-5 flex flex-col gap-4">
          {slide.bullets.slice(0, mid).map((item, index) => <Text key={index} theme={theme}>{item}</Text>)}
        </div>
      </Tile>
      <Tile theme={theme} className="col-span-3 row-span-3">
        <Badge theme={theme}>{slide.labelRight || (isAB ? "方案 B" : "留意")}</Badge>
        <div className="mt-5 flex flex-col gap-4">
          {slide.bullets.slice(mid).map((item, index) => <Text key={index} theme={theme}>{item}</Text>)}
        </div>
      </Tile>
    </StandardPage>
  );
}

export function StepCard(props: CardProps) {
  return (
    <StandardPage props={props} label="bento steps">
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} offset={4} />
    </StandardPage>
  );
}

export function StatsCard(props: CardProps) {
  const { slide, theme } = props;
  const stats = slide.bullets.map(parseStat);
  return (
    <StandardPage props={props} label="bento stats">
      {stats.map((stat, index) => (
        <Tile key={index} theme={theme} className={index === 0 ? "col-span-4 row-span-2" : spanFor(index + 1)} tone={index % 2 === 0 ? "soft" : "paper"}>
          <span className="font-black leading-none" style={{ color: theme.primary, fontSize: scaledPx(index === 0 ? 82 : 56) }}>
            {stat.value || `0${index + 1}`}
          </span>
          <Text theme={theme}>{stat.label}</Text>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function FaqCard(props: CardProps) {
  const { slide, theme } = props;
  const items = slide.bullets.map(splitQA);
  return (
    <StandardPage props={props} label="bento faq">
      {items.map((item, index) => (
        <Tile key={index} theme={theme} className={spanFor(index)} tone={index % 2 === 0 ? "paper" : "soft"}>
          <Text theme={theme} strong>Q: {item.q}</Text>
          {item.a && <div className="mt-3"><Text theme={theme}>A: {item.a}</Text></div>}
        </Tile>
      ))}
    </StandardPage>
  );
}

export function ChecklistCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props} label="bento checklist">
      {slide.bullets.map((item, index) => (
        <Tile key={index} theme={theme} className={spanFor(index + 2)} tone={index % 2 === 0 ? "paper" : "soft"}>
          <div className="flex items-start gap-4">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-black"
              style={{ backgroundColor: theme.primary, color: theme.primaryText, fontSize: scaledPx(24) }}
            >
              ✓
            </span>
            <Text theme={theme}>{item}</Text>
          </div>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function TimelineCard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props} label="bento timeline">
      {slide.bullets.map((item, index) => (
        <Tile key={index} theme={theme} className={spanFor(index + 3)} tone={index % 2 === 0 ? "soft" : "paper"}>
          <Badge theme={theme}>{String(index + 1).padStart(2, "0")}</Badge>
          <div className="mt-4"><Text theme={theme}>{item}</Text></div>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function ProseCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";

  if (hasImage && (pos === "top" || pos === "bottom")) {
    return (
      <Shell {...props} label="bento prose">
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          {pos === "top" && (
            <div className="shrink-0 overflow-hidden" style={{ borderRadius: radius(theme, "lg"), height: 420 }}>
              <div className="h-full w-full" style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
            </div>
          )}
          <Mosaic>
            {slide.bullets.map((paragraph, index) => (
              <Tile key={index} theme={theme} className={index === 0 ? "col-span-4 row-span-2" : spanFor(index + 4)} tone={index % 2 === 0 ? "paper" : "soft"}>
                <Text theme={theme}>{paragraph}</Text>
              </Tile>
            ))}
          </Mosaic>
          {pos === "bottom" && (
            <div className="shrink-0 overflow-hidden" style={{ borderRadius: radius(theme, "lg"), height: 420 }}>
              <div className="h-full w-full" style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }} />
            </div>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell {...props} label="bento prose">
      {hasImage && pos === "background" && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.07,
          }}
        />
      )}
      <Mosaic>
        {slide.bullets.map((paragraph, index) => (
          <Tile key={index} theme={theme} className={index === 0 ? "col-span-4 row-span-2" : spanFor(index + 4)} tone={index % 2 === 0 ? "paper" : "soft"}>
            <Text theme={theme}>{paragraph}</Text>
          </Tile>
        ))}
      </Mosaic>
    </Shell>
  );
}
