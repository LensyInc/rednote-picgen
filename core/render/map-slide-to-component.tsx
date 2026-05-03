import { Slide } from "@/core/schema/note.schema";
import { getFamily } from "@/components/templates/registry";
import { getThemeSafe } from "@/components/templates/themes/theme";
import type { BackgroundType, FontScale } from "@/components/templates/themes/theme";
import { ErrorBoundary } from "@/components/error-boundary";

interface MapOptions {
  pageIndex?: number;
  pageTotal?: number;
  fontScale?: FontScale;
}

export function mapSlideToComponent(
  slide: Slide,
  familyId: string = "classic",
  themeId: string = "template-a",
  backgroundType?: BackgroundType,
  options: MapOptions = {}
) {
  const family = getFamily(familyId);
  const theme = getThemeSafe(themeId);
  const bg = backgroundType || "solid";
  const C = family.cards;
  const props = {
    slide,
    theme,
    backgroundType: bg,
    pageIndex: options.pageIndex,
    pageTotal: options.pageTotal,
    fontScale: options.fontScale,
  };

  const card = (() => {
    switch (slide.type) {
    case "cover":
      return <C.CoverCard {...props} />;
    case "content":
      if (slide.use_real_image) return <C.TextImageCard {...props} />;
      return <C.TextCard {...props} />;
    case "summary":
      return <C.SummaryCard {...props} />;
    case "cta":
      return <C.CTACard {...props} />;
    case "image":
      return <C.TextImageCard {...props} />;
    case "quote":
      return <C.QuoteCard {...props} />;
    case "tips":
      return <C.TipsCard {...props} />;
    case "comparison":
      return <C.ComparisonCard {...props} />;
    case "step":
      return <C.StepCard {...props} />;
    case "stats":
      return <C.StatsCard {...props} />;
    case "faq":
      return <C.FaqCard {...props} />;
    case "checklist":
      return <C.ChecklistCard {...props} />;
    case "timeline":
      return <C.TimelineCard {...props} />;
    case "prose":
      return <C.ProseCard {...props} />;
    default: {
      console.warn(`[mapSlideToComponent] 未知 slide 类型: ${slide.type}, 降级为 TextCard`);
      return <C.TextCard {...props} />;
    }
  }
  })();

  return <ErrorBoundary>{card}</ErrorBoundary>;
}
