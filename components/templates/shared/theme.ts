import type { z } from "zod";
import { templateEnum, backgroundTypeEnum } from "@/core/schema/request.schema";
import type { Slide } from "@/core/schema/note.schema";

export type TemplateId = z.infer<typeof templateEnum>;

export type CornerShape = "round" | "soft" | "sharp";
export type FontFamily = "sans" | "wenkai";
export type Mood = "light" | "dark";
export type BackgroundType = z.infer<typeof backgroundTypeEnum>;

export interface CardProps {
  slide: Slide;
  theme: Theme;
  backgroundType?: BackgroundType;
  pageIndex?: number;
  pageTotal?: number;
}

export interface Theme {
  id: TemplateId;
  name: string;
  mood: Mood;
  primary: string;
  primaryText: string;
  accent: string;
  surface: string;
  surfaceSoft: string;
  background: string;
  textStrong: string;
  textBody: string;
  textMuted: string;
  divider: string;
  corner: CornerShape;
  font: FontFamily;
}

export const THEMES: Record<TemplateId, Theme> = {
  "template-a": {
    id: "template-a",
    name: "温润桃粉",
    mood: "light",
    primary: "#B86B7A",
    primaryText: "#FFFFFF",
    accent: "#E2C5A8",
    surface: "#FFFFFF",
    surfaceSoft: "#F5E8EC",
    background: "#FAF4F5",
    textStrong: "#2A2226",
    textBody: "#3E3439",
    textMuted: "#8C7E83",
    divider: "#E4D4D8",
    corner: "round",
    font: "sans",
  },
  "template-b": {
    id: "template-b",
    name: "雾蓝商务",
    mood: "light",
    primary: "#5A7596",
    primaryText: "#FFFFFF",
    accent: "#8FA8C2",
    surface: "#FFFFFF",
    surfaceSoft: "#EEF2F6",
    background: "#F6F8FA",
    textStrong: "#1F2A37",
    textBody: "#2F3B4A",
    textMuted: "#6B7787",
    divider: "#D8DFE7",
    corner: "soft",
    font: "sans",
  },
  "template-c": {
    id: "template-c",
    name: "奶油琥珀",
    mood: "light",
    primary: "#B58B5C",
    primaryText: "#FFFFFF",
    accent: "#DCC79A",
    surface: "#FFFFFF",
    surfaceSoft: "#F6EFE2",
    background: "#FAF6EF",
    textStrong: "#2E2820",
    textBody: "#40382D",
    textMuted: "#8A7E6B",
    divider: "#E7DCC9",
    corner: "round",
    font: "sans",
  },
  "template-d": {
    id: "template-d",
    name: "素雅极简",
    mood: "light",
    primary: "#2D2D2D",
    primaryText: "#FFFFFF",
    accent: "#B5A989",
    surface: "#FFFFFF",
    surfaceSoft: "#F2F2F0",
    background: "#FBFAF7",
    textStrong: "#1A1A1A",
    textBody: "#2E2E2E",
    textMuted: "#6E6E6E",
    divider: "#E3E2DE",
    corner: "sharp",
    font: "sans",
  },
  "template-e": {
    id: "template-e",
    name: "薰衣草灰",
    mood: "light",
    primary: "#7A6E92",
    primaryText: "#FFFFFF",
    accent: "#B9ADC4",
    surface: "#FFFFFF",
    surfaceSoft: "#EEEAF2",
    background: "#F6F3F8",
    textStrong: "#2A2336",
    textBody: "#3A324A",
    textMuted: "#786D89",
    divider: "#DED5E3",
    corner: "round",
    font: "sans",
  },
  "template-f": {
    id: "template-f",
    name: "陶土暖褐",
    mood: "light",
    primary: "#8E5A3C",
    primaryText: "#F7EFE1",
    accent: "#BC8B63",
    surface: "#FBF4E5",
    surfaceSoft: "#F0E1C6",
    background: "#F8EED6",
    textStrong: "#3A2B19",
    textBody: "#4E3A22",
    textMuted: "#8A735A",
    divider: "#D9C3A2",
    corner: "soft",
    font: "wenkai",
  },
  "template-g": {
    id: "template-g",
    name: "深林墨绿",
    mood: "dark",
    primary: "#8AB2A6",
    primaryText: "#1A2420",
    accent: "#B4A481",
    surface: "#243230",
    surfaceSoft: "#2D3D3A",
    background: "#1B2624",
    textStrong: "#EDE6D6",
    textBody: "#D3CBB8",
    textMuted: "#8B9691",
    divider: "#3A4A47",
    corner: "sharp",
    font: "sans",
  },
  "template-h": {
    id: "template-h",
    name: "柔粉日常",
    mood: "light",
    primary: "#B48092",
    primaryText: "#FFFFFF",
    accent: "#D9B6A4",
    surface: "#FFFFFF",
    surfaceSoft: "#F5E3E6",
    background: "#FAF1F2",
    textStrong: "#3A2630",
    textBody: "#4C323C",
    textMuted: "#8C6A74",
    divider: "#E5CDD2",
    corner: "round",
    font: "wenkai",
  },
};

export function getTheme(id: TemplateId): Theme {
  return THEMES[id] ?? THEMES["template-a"];
}

export function getThemeSafe(id: string): Theme {
  const valid = (Object.keys(THEMES) as TemplateId[]).includes(id as TemplateId);
  return valid ? THEMES[id as TemplateId] : THEMES["template-a"];
}

export function radius(theme: Theme, size: "sm" | "md" | "lg" | "pill" = "md"): string {
  if (size === "pill") return "9999px";
  if (theme.corner === "sharp") {
    return size === "sm" ? "2px" : size === "md" ? "4px" : "8px";
  }
  if (theme.corner === "soft") {
    return size === "sm" ? "8px" : size === "md" ? "16px" : "24px";
  }
  return size === "sm" ? "12px" : size === "md" ? "24px" : "36px";
}

export function fontClass(theme: Theme): string {
  return theme.font === "wenkai" ? "font-wenkai" : "font-sans";
}

export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
