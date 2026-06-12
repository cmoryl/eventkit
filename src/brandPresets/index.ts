import { transperfect2026 } from './transperfect2026';
import {
  genericBrandPresets,
  modernSaaS,
  enterpriseCorporate,
  sportsEvent,
  hospitality,
  luxuryEvent,
  nonprofit,
  creatorBrand,
  blankCustomBrand
} from './genericPresets';

export {
  transperfect2026,
  genericBrandPresets,
  modernSaaS,
  enterpriseCorporate,
  sportsEvent,
  hospitality,
  luxuryEvent,
  nonprofit,
  creatorBrand,
  blankCustomBrand
};

export const brandPresets = [
  blankCustomBrand,
  modernSaaS,
  enterpriseCorporate,
  sportsEvent,
  hospitality,
  luxuryEvent,
  nonprofit,
  creatorBrand,
  transperfect2026
];

export const getBrandPresetById = (id: string) => brandPresets.find((preset) => preset.id === id);
