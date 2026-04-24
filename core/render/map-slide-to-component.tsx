import { Slide } from "@/core/schema/note.schema";
import {
  CoverCard,
  TextCard,
  TextImageCard,
  SummaryCard,
  CTACard,
  QuoteCard,
  TipsCard,
  ComparisonCard,
  StepCard,
  StatsCard,
  FaqCard,
  ChecklistCard,
  TimelineCard,
  getThemeSafe,
} from "@/components/templates/shared";
import type { BackgroundType } from "@/components/templates/shared/theme";
import { ErrorBoundary } from "@/components/error-boundary";

interface MapOptions {
  pageIndex?: number;
  pageTotal?: number;
}

export function mapSlideToComponent(
  slide: Slide,
  templateId: string,
  backgroundType?: BackgroundType,
  options: MapOptions = {}
) {
  const theme = getThemeSafe(templateId);
  const bg = backgroundType || "solid";
  const props = {
    slide,
    theme,
    backgroundType: bg,
    pageIndex: options.pageIndex,
    pageTotal: options.pageTotal,
  };

  const card = (() => {
    switch (slide.type) {
    case "cover":
      return <CoverCard {...props} />;
    case "content":
      if (slide.use_real_image) return <TextImageCard {...props} />;
      return <TextCard {...props} />;
    case "summary":
      return <SummaryCard {...props} />;
    case "cta":
      return <CTACard {...props} />;
    case "image":
      return <TextImageCard {...props} />;
    case "quote":
      return <QuoteCard {...props} />;
    case "tips":
      return <TipsCard {...props} />;
    case "comparison":
      return <ComparisonCard {...props} />;
    case "step":
      return <StepCard {...props} />;
    case "stats":
      return <StatsCard {...props} />;
    case "faq":
      return <FaqCard {...props} />;
    case "checklist":
      return <ChecklistCard {...props} />;
    case "timeline":
      return <TimelineCard {...props} />;
    default: {
      console.warn(`[mapSlideToComponent] 未知 slide 类型: ${slide.type}, 降级为 TextCard`);
      return <TextCard {...props} />;
    }
  }
})();

  return <ErrorBoundary>{card}</ErrorBoundary>;
}
