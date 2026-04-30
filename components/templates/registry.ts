import type { TemplateFamily } from "./shared-new/card-types";
import { classicFamily } from "./families/classic/family-meta";
import { magazineFamily } from "./families/magazine/family-meta";
import { bigtypeFamily } from "./families/bigtype/family-meta";

export const FAMILY_REGISTRY: Record<string, TemplateFamily> = {
  classic: classicFamily,
  magazine: magazineFamily,
  bigtype: bigtypeFamily,
};

export function getFamily(familyId: string): TemplateFamily {
  return FAMILY_REGISTRY[familyId] ?? FAMILY_REGISTRY.classic;
}

export function getFamilyList(): TemplateFamily[] {
  return Object.values(FAMILY_REGISTRY);
}
