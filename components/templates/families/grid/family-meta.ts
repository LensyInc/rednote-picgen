import type { TemplateFamily } from "@/components/templates/shared-new/card-types";
import {
  CoverCard, TextCard, TextImageCard, SummaryCard, CTACard,
  QuoteCard, TipsCard, ComparisonCard, StepCard, StatsCard,
  FaqCard, ChecklistCard, TimelineCard, ProseCard,
} from "./index";

export const gridFamily: TemplateFamily = {
  id: "grid",
  name: "方格",
  description: "内容排布在整齐方格中，结构清晰，信息密度高",
  requiresPro: true,
  defaultTheme: "template-b",
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
