import type { TemplateFamily } from "@/components/templates/shared-new/card-types";
import {
  CoverCard, TextCard, TextImageCard, SummaryCard, CTACard,
  QuoteCard, TipsCard, ComparisonCard, StepCard, StatsCard,
  FaqCard, ChecklistCard, TimelineCard, ProseCard,
} from "./index";

export const bigtypeFamily: TemplateFamily = {
  id: "bigtype",
  name: "大字报",
  description: "标题占满视野，极简注释，视觉冲击最强",
  requiresPro: true,
  defaultTheme: "template-d",
  supportsBackgrounds: ["solid", "gradient", "dots", "lines"],
  capabilities: {
    comparisonStyles: ["good-bad", "ab"],
    imagePositions: ["top", "background"],
    maxBulletCount: 8,
    supportsPageNumbers: true,
  },
  cards: {
    CoverCard, TextCard, TextImageCard, SummaryCard, CTACard,
    QuoteCard, TipsCard, ComparisonCard, StepCard, StatsCard,
    FaqCard, ChecklistCard, TimelineCard, ProseCard,
  },
};
