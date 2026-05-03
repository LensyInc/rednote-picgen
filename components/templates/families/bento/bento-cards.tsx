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

type Tone = "paper" | "soft" | "ink";

// ── Layout ──────────────────────────────────────────────────────────────────

function bulletSpan(index: number, total: number): string {
  if (total <= 1) return "col-span-6";
  if (total === 2) return "col-span-3 row-span-2";
  if (total === 3) return index === 0 ? "col-span-4 row-span-2" : "col-span-2 row-span-1";
  if (total === 4) {
    if (index === 0) return "col-span-4 row-span-2";
    if (index <= 2) return "col-span-2 row-span-1";
    return "col-span-6";
  }
  if (total === 5) {
    if (index === 0) return "col-span-4 row-span-2";
    if (index <= 2) return "col-span-2 row-span-1";
    return "col-span-3";
  }
  if (total === 6) {
    if (index === 0) return "col-span-4 row-span-2";
    if (index <= 2) return "col-span-2 row-span-1";
    return "col-span-2 row-span-2";
  }
  if (total === 7) {
    if (index === 0) return "col-span-4 row-span-2";
    if (index <= 2) return "col-span-2 row-span-1";
    if (index <= 5) return "col-span-2 row-span-2";
    return "col-span-6";
  }
  return "col-span-3";
}

// ── Color helpers ──────────────────────────────────────────────────────────

function toneBg(theme: Theme, tone: Tone): string {
  if (tone === "ink") return theme.primary;
  if (tone === "soft") return theme.surfaceSoft;
  return theme.surface;
}

function toneColor(theme: Theme, tone: Tone): string {
  return tone === "ink" ? theme.primaryText : theme.textStrong;
}

// ── Primitives ─────────────────────────────────────────────────────────────

function Shell({
  slide, theme, backgroundType, pageIndex, pageTotal, fontScale, children,
}: CardProps & { children: ReactNode }) {
  return (
    <CardContainer theme={theme} backgroundType={backgroundType} fontScale={fontScale}>
      <div className="flex h-full flex-col gap-5 p-14" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex shrink-0 items-center justify-between">
          <span style={{ display: "block", width: 32, height: 5, borderRadius: "9999px", backgroundColor: theme.primary }} />
          {pageIndex != null && pageTotal != null && (
            <span className="font-black tabular-nums" style={{ color: theme.textMuted, fontSize: scaledPx(20) }}>
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
      className="grid min-h-0 flex-1 auto-rows-fr gap-3"
      style={{ gridTemplateColumns: "repeat(6, minmax(0, 1fr))" }}
    >
      {children}
    </div>
  );
}

function Tile({
  theme, children, className = "", tone = "paper", pad = "normal",
}: {
  theme: Theme; children: ReactNode; className?: string; tone?: Tone; pad?: "normal" | "tight" | "none";
}) {
  const p = pad === "none" ? "" : pad === "tight" ? "p-5" : "p-6";
  return (
    <div
      className={`min-h-0 overflow-hidden ${p} ${className}`}
      style={{
        backgroundColor: toneBg(theme, tone),
        color: toneColor(theme, tone),
        borderRadius: radius(theme, "lg"),
        border: `1px solid ${tone === "ink" ? withAlpha(theme.primaryText, 0.12) : theme.divider}`,
      }}
    >
      <div className="flex h-full min-h-0 flex-col">{children}</div>
    </div>
  );
}

function TitleBar({ slide, theme }: { slide: CardProps["slide"]; theme: Theme }) {
  return (
    <div
      className="shrink-0 flex flex-col gap-2"
      style={{ borderLeft: `5px solid ${theme.primary}`, paddingLeft: 18 }}
    >
      <h2
        className="font-black leading-[1.05] tracking-tight"
        style={{ color: theme.textStrong, fontSize: scaledPx(52) }}
      >
        {slide.title}
      </h2>
      {slide.subtitle && (
        <p
          className="font-semibold leading-[1.35]"
          style={{ color: theme.textBody, fontSize: scaledPx(26) }}
        >
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

function HighlightBar({ theme, children }: { theme: Theme; children: ReactNode }) {
  return (
    <div
      className="shrink-0"
      style={{
        backgroundColor: withAlpha(theme.primary, 0.07),
        borderRadius: radius(theme, "md"),
        borderLeft: `4px solid ${theme.primary}`,
        padding: "14px 20px",
      }}
    >
      <p className="font-bold leading-[1.3]" style={{ color: theme.textStrong, fontSize: scaledPx(28) }}>
        {children}
      </p>
    </div>
  );
}

function IndexTag({ theme, n, tone }: { theme: Theme; n: number; tone: Tone }) {
  return (
    <span
      className="w-fit font-black tabular-nums"
      style={{
        color: tone === "ink" ? withAlpha(theme.primaryText, 0.55) : theme.primary,
        fontSize: scaledPx(17),
        letterSpacing: "0.08em",
      }}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

function BodyText({ theme, children, tone = "paper", strong = false }: {
  theme: Theme; children: ReactNode; tone?: Tone; strong?: boolean;
}) {
  return (
    <p
      className={strong ? "font-black leading-[1.2]" : "font-semibold leading-[1.4]"}
      style={{
        color: tone === "ink" ? theme.primaryText : strong ? theme.textStrong : theme.textBody,
        fontSize: scaledPx(strong ? 38 : 30),
      }}
    >
      {children}
    </p>
  );
}

function BulletMosaic({ theme, bullets, tone0 = "soft" }: {
  theme: Theme; bullets: string[]; tone0?: Tone;
}) {
  const total = bullets.length;
  return (
    <>
      {bullets.map((bullet, i) => {
        const tone: Tone = i === 0 ? tone0 : "paper";
        return (
          <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={tone}>
            <div className="flex h-full flex-col justify-between gap-3">
              <IndexTag theme={theme} n={i + 1} tone={tone} />
              <BodyText theme={theme} tone={tone}>{bullet}</BodyText>
            </div>
          </Tile>
        );
      })}
    </>
  );
}

function ImageBlock({ slide, theme, className }: {
  slide: CardProps["slide"]; theme: Theme; className: string;
}) {
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  return (
    <Tile theme={theme} className={className} pad="none">
      {imgSrc ? (
        <div
          className="h-full w-full"
          style={{ backgroundImage: `url("${imgSrc}")`, backgroundPosition: "center", backgroundSize: "cover" }}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: `linear-gradient(135deg, ${withAlpha(theme.primary, 0.18)}, ${withAlpha(theme.accent, 0.26)})` }}
        />
      )}
    </Tile>
  );
}

function StandardPage({ props, children }: { props: CardProps; children: ReactNode }) {
  const { slide, theme } = props;
  return (
    <Shell {...props}>
      <TitleBar slide={slide} theme={theme} />
      <Mosaic>{children}</Mosaic>
      {slide.highlight && <HighlightBar theme={theme}>{slide.highlight}</HighlightBar>}
    </Shell>
  );
}

// ── Data parsers ──────────────────────────────────────────────────────────

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
  const m = text.match(/^\s*([\d.]+\s*[%万千亿+]*|[A-Za-z$¥€]+[\d.,]+[%KMB]?)\s*[:：\-—\s]+(.+)$/);
  if (m) return { value: m[1].trim(), label: m[2].trim() };
  const split = text.includes("：") ? text.split("：") : text.includes(":") ? text.split(":") : null;
  if (split && split.length >= 2) return { value: split[0].trim(), label: split.slice(1).join(":").trim() };
  return { value: "", label: text };
}

// ── Cards ─────────────────────────────────────────────────────────────────

export function CoverCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;

  return (
    <CardContainer theme={theme} backgroundType={props.backgroundType} fontScale={props.fontScale}>
      {hasImage && (
        <>
          <div
            className="absolute inset-0 z-[1]"
            style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="absolute inset-0 z-[2]" style={{ backgroundColor: theme.background, opacity: 0.3 }} />
        </>
      )}
      <div className="relative z-10 flex h-full flex-col gap-4 p-14" style={{ textAlign: slide.textAlign ?? "left" }}>
        <div className="flex shrink-0 items-center justify-between">
          <span style={{ display: "block", width: 32, height: 5, borderRadius: "9999px", backgroundColor: theme.primary }} />
          {props.pageIndex != null && props.pageTotal != null && (
            <span className="font-black tabular-nums" style={{ color: theme.textMuted, fontSize: scaledPx(20) }}>
              {String(props.pageIndex).padStart(2, "0")} / {String(props.pageTotal).padStart(2, "0")}
            </span>
          )}
        </div>
        {/* Hero tile */}
        <div
          className="relative flex-1 overflow-hidden flex flex-col justify-between gap-6 p-9"
          style={{
            backgroundColor: toneBg(theme, "ink"),
            borderRadius: radius(theme, "lg"),
            border: `1px solid ${withAlpha(theme.primaryText, 0.12)}`,
            opacity: hasImage ? 0.85 : 1,
          }}
        >
          <h1
            className="font-black leading-[1.0] tracking-tight"
            style={{ color: theme.primaryText, fontSize: scaledPx(96) }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && <BodyText theme={theme} tone="ink">{slide.subtitle}</BodyText>}
        </div>
        {/* Bottom descriptor */}
        {(slide.highlight || slide.bullets[0]) && (
          <div
            className="shrink-0 p-6"
            style={{
              backgroundColor: toneBg(theme, "soft"),
              borderRadius: radius(theme, "lg"),
              border: `1px solid ${theme.divider}`,
              opacity: hasImage ? 0.88 : 1,
            }}
          >
            <BodyText theme={theme} strong>{slide.highlight || slide.bullets[0]}</BodyText>
          </div>
        )}
      </div>
    </CardContainer>
  );
}

export function TextCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  return (
    <Shell {...props}>
      <TitleBar slide={slide} theme={theme} />
      {imgSrc && (
        <div className="shrink-0 overflow-hidden" style={{ borderRadius: radius(theme, "lg"), height: 360 }}>
          <div
            className="h-full w-full"
            style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
        </div>
      )}
      <Mosaic>
        <BulletMosaic theme={theme} bullets={slide.bullets} />
      </Mosaic>
      {slide.highlight && <HighlightBar theme={theme}>{slide.highlight}</HighlightBar>}
    </Shell>
  );
}

export function TextImageCard(props: CardProps) {
  const { slide, theme } = props;
  const bullets = slide.bullets.slice(0, 5);
  return (
    <StandardPage props={props}>
      <ImageBlock slide={slide} theme={theme} className="col-span-3 row-span-3" />
      {bullets.map((bullet, i) => {
        const tone: Tone = i === 0 ? "soft" : "paper";
        return (
          <Tile key={i} theme={theme} className="col-span-3" tone={tone}>
            <div className="flex h-full flex-col justify-between gap-2">
              <IndexTag theme={theme} n={i + 1} tone={tone} />
              <BodyText theme={theme}>{bullet}</BodyText>
            </div>
          </Tile>
        );
      })}
    </StandardPage>
  );
}

export function SummaryCard(props: CardProps) {
  return (
    <StandardPage props={props}>
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} />
    </StandardPage>
  );
}

export function CTACard(props: CardProps) {
  const { slide, theme } = props;
  return (
    <StandardPage props={props}>
      <Tile theme={theme} tone="ink" className="col-span-6 row-span-2">
        <div className="flex h-full items-center justify-center text-center px-6">
          <BodyText theme={theme} tone="ink" strong>{slide.highlight || slide.subtitle || "下一步行动"}</BodyText>
        </div>
      </Tile>
      <BulletMosaic theme={theme} bullets={slide.bullets.slice(0, 3)} />
    </StandardPage>
  );
}

export function QuoteCard(props: CardProps) {
  const { slide, theme } = props;
  const quoteText = slide.bullets[0] || slide.highlight || slide.title;
  const extra = slide.bullets.slice(1, 4);
  return (
    <StandardPage props={props}>
      <Tile theme={theme} tone="ink" className="col-span-4 row-span-3">
        <div className="flex h-full flex-col justify-between gap-4">
          <span
            className="font-black leading-none"
            style={{ color: withAlpha(theme.primaryText, 0.22), fontSize: scaledPx(120) }}
          >
            &ldquo;
          </span>
          <BodyText theme={theme} tone="ink" strong>{quoteText}</BodyText>
        </div>
      </Tile>
      <Tile theme={theme} tone="soft" className="col-span-2 row-span-1">
        <BodyText theme={theme}>{slide.subtitle || ""}</BodyText>
      </Tile>
      {extra.map((b, i) => (
        <Tile key={i} theme={theme} className="col-span-2 row-span-1" tone="paper">
          <BodyText theme={theme}>{b}</BodyText>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function TipsCard(props: CardProps) {
  return (
    <StandardPage props={props}>
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} />
    </StandardPage>
  );
}

export function ComparisonCard(props: CardProps) {
  const { slide, theme } = props;
  const mid = Math.ceil(slide.bullets.length / 2);
  const isAB = slide.comparisonStyle === "ab";
  return (
    <StandardPage props={props}>
      <Tile theme={theme} tone="soft" className="col-span-3 row-span-4">
        <div className="flex h-full flex-col gap-5">
          <span
            className="font-black"
            style={{ color: theme.primary, fontSize: scaledPx(17), letterSpacing: "0.06em" }}
          >
            {slide.labelLeft || (isAB ? "方案 A" : "推荐")}
          </span>
          <div className="flex flex-col gap-4">
            {slide.bullets.slice(0, mid).map((item, i) => (
              <BodyText key={i} theme={theme}>{item}</BodyText>
            ))}
          </div>
        </div>
      </Tile>
      <Tile theme={theme} tone="paper" className="col-span-3 row-span-4">
        <div className="flex h-full flex-col gap-5">
          <span
            className="font-black"
            style={{ color: theme.primary, fontSize: scaledPx(17), letterSpacing: "0.06em" }}
          >
            {slide.labelRight || (isAB ? "方案 B" : "留意")}
          </span>
          <div className="flex flex-col gap-4">
            {slide.bullets.slice(mid).map((item, i) => (
              <BodyText key={i} theme={theme}>{item}</BodyText>
            ))}
          </div>
        </div>
      </Tile>
    </StandardPage>
  );
}

export function StepCard(props: CardProps) {
  return (
    <StandardPage props={props}>
      <BulletMosaic theme={props.theme} bullets={props.slide.bullets} />
    </StandardPage>
  );
}

export function StatsCard(props: CardProps) {
  const { slide, theme } = props;
  const stats = slide.bullets.map(parseStat);
  const total = stats.length;
  return (
    <StandardPage props={props}>
      {stats.map((stat, i) => {
        const tone: Tone = i === 0 ? "ink" : i % 2 === 0 ? "soft" : "paper";
        return (
          <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={tone}>
            <div className="flex h-full flex-col justify-between gap-2">
              {stat.value ? (
                <span
                  className="font-black leading-none"
                  style={{
                    color: tone === "ink" ? theme.primaryText : theme.primary,
                    fontSize: scaledPx(i === 0 ? 76 : 52),
                  }}
                >
                  {stat.value}
                </span>
              ) : (
                <IndexTag theme={theme} n={i + 1} tone={tone} />
              )}
              <BodyText theme={theme} tone={tone}>{stat.label}</BodyText>
            </div>
          </Tile>
        );
      })}
    </StandardPage>
  );
}

export function FaqCard(props: CardProps) {
  const { slide, theme } = props;
  const items = slide.bullets.map(splitQA);
  const total = items.length;
  return (
    <StandardPage props={props}>
      {items.map((item, i) => (
        <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={i === 0 ? "soft" : "paper"}>
          <div className="flex h-full flex-col gap-3">
            <BodyText theme={theme} strong>{item.q}</BodyText>
            {item.a && <BodyText theme={theme}>{item.a}</BodyText>}
          </div>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function ChecklistCard(props: CardProps) {
  const { slide, theme } = props;
  const total = slide.bullets.length;
  return (
    <StandardPage props={props}>
      {slide.bullets.map((item, i) => (
        <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={i === 0 ? "soft" : "paper"}>
          <div className="flex items-start gap-4">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black"
              style={{ backgroundColor: theme.primary, color: theme.primaryText, fontSize: scaledPx(20) }}
            >
              ✓
            </span>
            <BodyText theme={theme}>{item}</BodyText>
          </div>
        </Tile>
      ))}
    </StandardPage>
  );
}

export function TimelineCard(props: CardProps) {
  const { slide, theme } = props;
  const total = slide.bullets.length;
  return (
    <StandardPage props={props}>
      {slide.bullets.map((item, i) => {
        const tone: Tone = i === 0 ? "ink" : i % 2 === 0 ? "soft" : "paper";
        return (
          <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={tone}>
            <div className="flex h-full flex-col justify-between gap-3">
              <IndexTag theme={theme} n={i + 1} tone={tone} />
              <BodyText theme={theme} tone={tone}>{item}</BodyText>
            </div>
          </Tile>
        );
      })}
    </StandardPage>
  );
}

export function ProseCard(props: CardProps) {
  const { slide, theme } = props;
  const imgSrc = proxyImageUrl(slide.image?.localPath || slide.image?.previewUrl);
  const hasImage = !!imgSrc;
  const pos = slide.imagePosition || "top";
  const total = slide.bullets.length;

  const textMosaic = (
    <Mosaic>
      {slide.bullets.map((paragraph, i) => (
        <Tile key={i} theme={theme} className={bulletSpan(i, total)} tone={i === 0 ? "soft" : "paper"}>
          <BodyText theme={theme}>{paragraph}</BodyText>
        </Tile>
      ))}
    </Mosaic>
  );

  if (hasImage && (pos === "top" || pos === "bottom")) {
    return (
      <Shell {...props}>
        <TitleBar slide={slide} theme={theme} />
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          {pos === "top" && (
            <div className="shrink-0 overflow-hidden" style={{ borderRadius: radius(theme, "lg"), height: 340 }}>
              <div
                className="h-full w-full"
                style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>
          )}
          {textMosaic}
          {pos === "bottom" && (
            <div className="shrink-0 overflow-hidden" style={{ borderRadius: radius(theme, "lg"), height: 340 }}>
              <div
                className="h-full w-full"
                style={{ backgroundImage: `url("${imgSrc}")`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>
          )}
        </div>
      </Shell>
    );
  }

  return (
    <Shell {...props}>
      <TitleBar slide={slide} theme={theme} />
      {hasImage && pos === "background" && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url("${imgSrc}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.06,
          }}
        />
      )}
      {textMosaic}
    </Shell>
  );
}
