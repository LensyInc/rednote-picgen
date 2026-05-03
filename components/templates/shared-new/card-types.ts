import type React from "react";
import type { Slide } from "@/core/schema/note.schema";
import type { Theme, BackgroundType, FontScale } from "../themes/theme";

export interface CardProps {
  slide: Slide;
  theme: Theme;
  backgroundType?: BackgroundType;
  pageIndex?: number;
  pageTotal?: number;
  fontScale?: FontScale;
}

export interface CardComponents {
  CoverCard: React.ComponentType<CardProps>;
  TextCard: React.ComponentType<CardProps>;
  TextImageCard: React.ComponentType<CardProps>;
  SummaryCard: React.ComponentType<CardProps>;
  CTACard: React.ComponentType<CardProps>;
  QuoteCard: React.ComponentType<CardProps>;
  TipsCard: React.ComponentType<CardProps>;
  ComparisonCard: React.ComponentType<CardProps>;
  StepCard: React.ComponentType<CardProps>;
  StatsCard: React.ComponentType<CardProps>;
  FaqCard: React.ComponentType<CardProps>;
  ChecklistCard: React.ComponentType<CardProps>;
  TimelineCard: React.ComponentType<CardProps>;
  ProseCard: React.ComponentType<CardProps>;
}

export interface TemplateFamily {
  id: string;
  name: string;
  description: string;
  requiresPro: boolean;
  cards: CardComponents;
  defaultTheme?: string;
  supportsBackgrounds?: Array<"solid" | "gradient" | "dots" | "lines">;
  capabilities?: {
    comparisonStyles?: Array<"good-bad" | "ab">;
    imagePositions?: Array<"top" | "bottom" | "left" | "right" | "background">;
    maxBulletCount?: number;
    supportsPageNumbers?: boolean;
    coverBackgroundOnly?: boolean;
  };
}
