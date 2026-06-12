import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { BrandProfile } from '@/types/brandProfile';
import type { CloudSyncResult } from './brandAssetCloudService';
import type { BrandStyleSystemId } from './brandStyleSystemService';
import { getStoredBrandStyleSystemIds, inferBrandStyleSystemIds, setBrandStyleSystemIds } from './brandStyleSystemService';
import type { BrandPromptOverride } from './brandPromptOverrideService';
import { getBrandPromptOverridesForProfile, saveBrandPromptOverride, writeBrandPromptOverrides, readBrandPromptOverrides } from './brandPromptOverrideService';
import { getBrandGuideAssetsForProfile } from './brandAssetLibraryService';

const CREATIVE_DIRECTION_TTL_MS = 2 * 60 * 1000;
const creativeDirectionHydrationCache = new Map<string, number>();

type CloudBrandStyleSystemSelectionRow = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  style_system_ids: BrandStyleSystemId[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type CloudBrandPromptOverrideRow = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  scope: BrandPromptOverride['scope'];
  name: string;
  version: number;
  status: BrandPromptOverride['status'];
  strategy_notes: string | null;
  hierarchy_rules: string[];
  layout_rules: string[];
  imagery_rules: string[];
  motif_rules: string[];
  typography_rules: string[];
  production_rules: string[];
  negative_rules: string[];
  qa_rules: string[];
  created_at: string;
  updated_at: string;
};

const getCurrentUser = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

const toCloudPromptOverride = (override: BrandPromptOverride, userId: string) => ({
  id: override.id,
  user_id: userId,
  brand_profile_id: override.brandProfileId,
  scope: override.scope,
  name: override.name,
  version: override.version,
  status: override.status,
  strategy_notes: override.strategyNotes || null,
  hierarchy_rules: override.hierarchyRules,
  layout_rules: override.layoutRules,
  imagery_rules: override.imageryRules,
  motif_rules: override.motifRules,
  typography_rules: override.typographyRules,
  production_rules: override.productionRules,
  negative_rules: override.negativeRules,
  qa_rules: override.qaRules,
});

const toLocalPromptOverride = (row: CloudBrandPromptOverrideRow): BrandPromptOverride => ({
  id: row.id,
  brandProfileId: row.brand_profile_id,
  scope: row.scope,
  name: row.name,
  version: row.version,
  status: row.status,
  strategyNotes: row.strategy_notes || undefined,
  hierarchyRules: row.hierarchy_rules || [],
  layoutRules: row.layout_rules || [],
  imageryRules: row.imagery_rules || [],
  motifRules: row.motif_rules || [],
  typographyRules: row.typography_rules || [],
  productionRules: row.production_rules || [],
  negativeRules: row.negative_rules || [],
  qaRules: row.qa_rules || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const syncBrandStyleSystemsToCloud = async (profile: BrandProfile): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Style systems remain local.' };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: 'Sign in to sync brand style systems.' };

  const inferred = inferBrandStyleSystemIds(profile, getBrandGuideAssetsForProfile(profile.id));
  const styleSystemIds = getStoredBrandStyleSystemIds(profile.id) || inferred;

  const { error } = await (supabase as any)
    .from('brand_style_system_selections')
    .upsert({
      user_id: user.id,
      brand_profile_id: profile.id,
      style_system_ids: styleSystemIds,
      notes: 'Synced from EventKit Brand Brain style systems.',
    }, { onConflict: 'user_id,brand_profile_id' });

  if (error) throw error;
  creativeDirectionHydrationCache.set(profile.id, Date.now());

  return { ok: true, message: `${styleSystemIds.length} style system${styleSystemIds.length === 1 ? '' : 's'} synced to Supabase.`, uploaded: styleSystemIds.length };
};

export const pullBrandStyleSystemsFromCloud = async (profile: BrandProfile, force = false): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Cannot pull style systems.' };

  const cachedAt = creativeDirectionHydrationCache.get(`${profile.id}:style`);
  if (!force && cachedAt && Date.now() - cachedAt < CREATIVE_DIRECTION_TTL_MS) {
    return { ok: true, message: 'Brand style system cloud cache is fresh.', pulled: 0, skipped: 1 };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: 'Sign in to pull brand style systems.' };

  const { data, error } = await (supabase as any)
    .from('brand_style_system_selections')
    .select('*')
    .eq('user_id', user.id)
    .eq('brand_profile_id', profile.id)
    .maybeSingle();

  if (error) throw error;

  const row = data as CloudBrandStyleSystemSelectionRow | null;
  if (!row?.style_system_ids?.length) {
    creativeDirectionHydrationCache.set(`${profile.id}:style`, Date.now());
    return { ok: true, message: 'No cloud style systems saved yet. Using local/inferred systems.', pulled: 0 };
  }

  setBrandStyleSystemIds(profile.id, row.style_system_ids);
  creativeDirectionHydrationCache.set(`${profile.id}:style`, Date.now());
  return { ok: true, message: `${row.style_system_ids.length} style system${row.style_system_ids.length === 1 ? '' : 's'} pulled from Supabase.`, pulled: row.style_system_ids.length };
};

export const syncBrandPromptOverridesToCloud = async (profile: BrandProfile): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Prompt overrides remain local.' };

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: 'Sign in to sync brand prompt overrides.' };

  const overrides = getBrandPromptOverridesForProfile(profile.id);
  if (!overrides.length) return { ok: true, message: 'No prompt overrides to sync yet.', uploaded: 0 };

  const payload = overrides.map((override) => toCloudPromptOverride(override, user.id));
  const { error } = await (supabase as any)
    .from('brand_prompt_overrides')
    .upsert(payload, { onConflict: 'id' });

  if (error) throw error;
  creativeDirectionHydrationCache.set(`${profile.id}:overrides`, Date.now());

  return { ok: true, message: `${overrides.length} prompt override${overrides.length === 1 ? '' : 's'} synced to Supabase.`, uploaded: overrides.length };
};

export const pullBrandPromptOverridesFromCloud = async (profile: BrandProfile, force = false): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Cannot pull prompt overrides.' };

  const cachedAt = creativeDirectionHydrationCache.get(`${profile.id}:overrides`);
  if (!force && cachedAt && Date.now() - cachedAt < CREATIVE_DIRECTION_TTL_MS) {
    return { ok: true, message: 'Brand prompt override cloud cache is fresh.', pulled: 0, skipped: 1 };
  }

  const user = await getCurrentUser();
  if (!user) return { ok: false, message: 'Sign in to pull brand prompt overrides.' };

  const { data, error } = await (supabase as any)
    .from('brand_prompt_overrides')
    .select('*')
    .eq('user_id', user.id)
    .eq('brand_profile_id', profile.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const rows = (data || []) as CloudBrandPromptOverrideRow[];
  const localForOtherBrands = readBrandPromptOverrides().filter((override) => override.brandProfileId !== profile.id);
  const pulled = rows.map(toLocalPromptOverride);
  writeBrandPromptOverrides([...localForOtherBrands, ...pulled]);

  creativeDirectionHydrationCache.set(`${profile.id}:overrides`, Date.now());
  return { ok: true, message: `${pulled.length} prompt override${pulled.length === 1 ? '' : 's'} pulled from Supabase.`, pulled: pulled.length };
};

export const deleteBrandPromptOverrideFromCloud = async (override: BrandPromptOverride): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: true, message: 'Supabase is not configured. Local delete only.' };

  const user = await getCurrentUser();
  if (!user) return { ok: true, message: 'Not signed in. Local delete only.' };

  const { error } = await (supabase as any)
    .from('brand_prompt_overrides')
    .delete()
    .eq('id', override.id)
    .eq('user_id', user.id);

  if (error) throw error;
  creativeDirectionHydrationCache.delete(`${override.brandProfileId}:overrides`);
  return { ok: true, message: 'Prompt override deleted from Supabase.' };
};

export const hydrateBrandCreativeDirectionFromCloud = async (profile: BrandProfile, force = false): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Using local creative direction.' };

  const cachedAt = creativeDirectionHydrationCache.get(profile.id);
  if (!force && cachedAt && Date.now() - cachedAt < CREATIVE_DIRECTION_TTL_MS) {
    return { ok: true, message: 'Brand creative direction cloud cache is fresh.', pulled: 0, skipped: 1 };
  }

  try {
    const [styleResult, overrideResult] = await Promise.all([
      pullBrandStyleSystemsFromCloud(profile, force),
      pullBrandPromptOverridesFromCloud(profile, force),
    ]);

    creativeDirectionHydrationCache.set(profile.id, Date.now());
    return {
      ok: styleResult.ok || overrideResult.ok,
      message: `Creative direction hydrated. ${styleResult.message} ${overrideResult.message}`,
      pulled: (styleResult.pulled || 0) + (overrideResult.pulled || 0),
      skipped: (styleResult.skipped || 0) + (overrideResult.skipped || 0),
    };
  } catch (error) {
    console.warn('Cloud creative direction hydration failed; using local creative direction:', error);
    return { ok: false, message: error instanceof Error ? error.message : 'Cloud creative direction hydration failed. Using local creative direction.' };
  }
};

export const syncBrandCreativeDirectionToCloud = async (profile: BrandProfile): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: false, message: 'Supabase is not configured. Creative direction remains local.' };

  const [styleResult, overrideResult] = await Promise.all([
    syncBrandStyleSystemsToCloud(profile),
    syncBrandPromptOverridesToCloud(profile),
  ]);

  creativeDirectionHydrationCache.set(profile.id, Date.now());
  return {
    ok: styleResult.ok || overrideResult.ok,
    message: `Creative direction synced. ${styleResult.message} ${overrideResult.message}`,
    uploaded: (styleResult.uploaded || 0) + (overrideResult.uploaded || 0),
  };
};
