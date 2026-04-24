import type { z } from "zod";
import { templateEnum } from "@/core/schema/request.schema";
import { THEMES } from "@/components/templates/shared/theme";

export interface TemplateConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
}

export function getTemplateConfig(
  templateId: z.infer<typeof templateEnum>
): TemplateConfig {
  const theme = THEMES[templateId] ?? THEMES["template-a"];
  return {
    name: theme.name,
    primaryColor: theme.primary,
    secondaryColor: theme.surfaceSoft,
    backgroundColor: theme.background,
  };
}
