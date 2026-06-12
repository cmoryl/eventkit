// Auto-engine selection — chooses the best Lovable AI image engine per asset type.
// Text-heavy assets benefit from GPT Image 2 (best typography).
// Hero / large-format / photoreal assets use the HQ Gemini 3 Pro Image.
// Everything else defaults to Nano Banana 2 (fast HQ) for the best speed/quality tradeoff.

import { AssetType } from '@/types';

export type AutoEngineId =
  | 'lovable-default'        // Gemini 2.5 Flash Image — cheapest, fastest
  | 'lovable-nano-banana-2'  // Gemini 3.1 Flash Image — fast HQ (new default)
  | 'lovable-hq'             // Gemini 3 Pro Image — best HQ
  | 'lovable-gpt-image';     // GPT Image 2 — best typography

// Text-dominant assets — typography quality matters most
const TEXT_HEAVY: string[] = [
  AssetType.NameTag, AssetType.WifiSign, AssetType.Menu, AssetType.Folder,
  AssetType.ThankYouNote, AssetType.EmailHeader, AssetType.Lanyard,
  // Signage with prominent wayfinding text
  AssetType.DoorSignage, AssetType.RoomSignage, AssetType.LocationSignage,
  AssetType.EaselSignage, AssetType.AFrameSign, AssetType.TableTent,
  // Slides / printed program-style assets
  'INVITATION', 'CERTIFICATE', 'AGENDA', 'PROGRAM', 'BUSINESS_CARD',
];

// Hero / large-format / photoreal — invest in Pro tier
const HQ_HERO: string[] = [
  AssetType.MainStageBackdrop, AssetType.StepAndRepeat, AssetType.BackWall,
  AssetType.RegistrationBackWall, AssetType.OutdoorSignage,
  AssetType.EventSignage, AssetType.Banner,
  'HERO_IMAGE', 'WEBSITE_HERO', 'KEYNOTE_BACKGROUND',
];

export function pickAutoEngine(assetType: string | AssetType | undefined | null): AutoEngineId {
  if (!assetType) return 'lovable-nano-banana-2';
  const t = String(assetType);
  if (TEXT_HEAVY.includes(t)) return 'lovable-gpt-image';
  if (HQ_HERO.includes(t)) return 'lovable-hq';
  return 'lovable-nano-banana-2';
}

export function describeAutoEngine(id: AutoEngineId): string {
  switch (id) {
    case 'lovable-gpt-image': return 'GPT Image 2 (best typography)';
    case 'lovable-hq': return 'Gemini 3 Pro (hero quality)';
    case 'lovable-nano-banana-2': return 'Nano Banana 2 (fast HQ)';
    default: return 'Gemini 2.5 Flash (fast)';
  }
}
