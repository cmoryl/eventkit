import { transperfect2026 } from './transperfect2026';
import { genericBrandPresets, modernSaaS, enterpriseCorporate, hospitality, blankCustomBrand } from './genericPresets';

export { transperfect2026, genericBrandPresets, modernSaaS, enterpriseCorporate, hospitality, blankCustomBrand };

export const brandPresets = [
  blankCustomBrand,
  modernSaaS,
  enterpriseCorporate,
  hospitality,
  transperfect2026
];

export const getBrandPresetById = (id: string) => brandPresets.find((preset) => preset.id === id);
