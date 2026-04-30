import type { TemplateFamily } from "./shared-new/card-types";
import { classicFamily } from "./families/classic/family-meta";
import { magazineFamily } from "./families/magazine/family-meta";
import { bigtypeFamily } from "./families/bigtype/family-meta";
import { gridFamily } from "./families/grid/family-meta";
import { paperFamily } from "./families/paper/family-meta";

export const FAMILY_REGISTRY: Record<string, TemplateFamily> = {
  classic: classicFamily,
  magazine: magazineFamily,
  bigtype: bigtypeFamily,
  grid: gridFamily,
  paper: paperFamily,
};

export function getFamily(familyId: string): TemplateFamily {
  return FAMILY_REGISTRY[familyId] ?? FAMILY_REGISTRY.classic;
}

export function getFamilyList(): TemplateFamily[] {
  return Object.values(FAMILY_REGISTRY);
}
