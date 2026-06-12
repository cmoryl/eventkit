import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import type { BrandProfile } from '@/types/brandProfile';
import type { BrandGuideAsset } from './brandAssetLibraryService';
import { getBrandGuideAssetsForProfile, saveBrandGuideAsset } from './brandAssetLibraryService';

const BUCKET = 'brand-brain-assets';

type CloudBrandBrainRow = {
  id: string;
  user_id: string;
  brand_profile_id: string;
  brand_name: string;
  profile_snapshot: unknown;
};

type CloudBrandBrainAssetRow = {
  id: string;
  brand_brain_id: string;
  user_id: string;
  brand_profile_id: string;
  name: string;
  file_name: string;
  mime_type: string;
  storage_path: string;
  asset_type: BrandGuideAsset['type'];
  usage_role: BrandGuideAsset['usage'];
  tags: string[];
  notes: string | null;
  is_primary: boolean;
  locked: boolean;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export interface CloudSyncResult {
  ok: boolean;
  message: string;
  uploaded?: number;
  pulled?: number;
  skipped?: number;
}

const getCurrentUser = async () => {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
};

const dataUrlToBlob = async (dataUrl: string) => {
  const response = await fetch(dataUrl);
  return response.blob();
};

const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error('Failed to convert cloud file to data URL'));
  reader.readAsDataURL(blob);
});

const extensionFromAsset = (asset: BrandGuideAsset) => {
  const extension = asset.fileName.split('.').pop();
  if (extension && extension.length <= 8) return extension;
  if (asset.mimeType.includes('svg')) return 'svg';
  if (asset.mimeType.includes('png')) return 'png';
  if (asset.mimeType.includes('jpeg')) return 'jpg';
  if (asset.mimeType.includes('webp')) return 'webp';
  return 'asset';
};

const buildStoragePath = (userId: string, brandProfileId: string, asset: BrandGuideAsset) =>
  `${userId}/${brandProfileId}/${asset.id}.${extensionFromAsset(asset)}`;

const toLocalAsset = async (row: CloudBrandBrainAssetRow): Promise<BrandGuideAsset> => {
  const { data, error } = await supabase.storage.from(BUCKET).download(row.storage_path);
  if (error) throw error;

  return {
    id: row.id,
    brandProfileId: row.brand_profile_id,
    name: row.name,
    fileName: row.file_name,
    mimeType: row.mime_type,
    dataUrl: await blobToDataUrl(data),
    type: row.asset_type,
    usage: row.usage_role,
    tags: row.tags || [],
    notes: row.notes || undefined,
    isPrimary: row.is_primary,
    locked: row.locked,
    createdAt: row.created_at,
  };
};

export const ensureCloudBrandBrain = async (profile: BrandProfile): Promise<CloudBrandBrainRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const payload = {
    user_id: user.id,
    brand_profile_id: profile.id,
    brand_name: profile.name,
    profile_snapshot: profile,
  };

  const { data, error } = await (supabase as any)
    .from('brand_brains')
    .upsert(payload, { onConflict: 'user_id,brand_profile_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as CloudBrandBrainRow;
};

export const uploadBrandGuideAssetToCloud = async (asset: BrandGuideAsset, profile: BrandProfile): Promise<CloudBrandBrainAssetRow | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const brain = await ensureCloudBrandBrain(profile);
  if (!brain) return null;

  const storagePath = buildStoragePath(user.id, profile.id, asset);
  const blob = await dataUrlToBlob(asset.dataUrl);

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, blob, {
      contentType: asset.mimeType,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const payload = {
    id: asset.id,
    brand_brain_id: brain.id,
    user_id: user.id,
    brand_profile_id: profile.id,
    name: asset.name,
    file_name: asset.fileName,
    mime_type: asset.mimeType,
    storage_path: storagePath,
    asset_type: asset.type,
    usage_role: asset.usage,
    tags: asset.tags,
    notes: asset.notes || null,
    is_primary: Boolean(asset.isPrimary),
    locked: Boolean(asset.locked),
    metadata: {
      source: 'eventkit-brand-guide-assets',
      local_created_at: asset.createdAt,
    },
  };

  const { data, error } = await (supabase as any)
    .from('brand_brain_assets')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as CloudBrandBrainAssetRow;
};

export const syncBrandGuideAssetsToCloud = async (profile: BrandProfile): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase is not configured. Brand brain remains local.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: 'Sign in to sync this brand brain to the cloud.' };
  }

  const assets = getBrandGuideAssetsForProfile(profile.id);
  if (!assets.length) {
    await ensureCloudBrandBrain(profile);
    return { ok: true, message: 'Cloud brand brain created. No assets to upload yet.', uploaded: 0 };
  }

  let uploaded = 0;
  for (const asset of assets) {
    await uploadBrandGuideAssetToCloud(asset, profile);
    uploaded += 1;
  }

  return { ok: true, message: `${uploaded} brand brain asset${uploaded === 1 ? '' : 's'} synced to Supabase.`, uploaded };
};

export const pullBrandGuideAssetsFromCloud = async (profile: BrandProfile): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) {
    return { ok: false, message: 'Supabase is not configured. Cannot pull cloud brand brain assets.' };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: 'Sign in to pull this brand brain from the cloud.' };
  }

  const brain = await ensureCloudBrandBrain(profile);
  if (!brain) return { ok: false, message: 'No cloud brand brain available.' };

  const { data, error } = await (supabase as any)
    .from('brand_brain_assets')
    .select('*')
    .eq('brand_brain_id', brain.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const rows = (data || []) as CloudBrandBrainAssetRow[];
  let pulled = 0;
  for (const row of rows) {
    const local = await toLocalAsset(row);
    saveBrandGuideAsset(local);
    pulled += 1;
  }

  return { ok: true, message: `${pulled} brand brain asset${pulled === 1 ? '' : 's'} pulled from Supabase.`, pulled };
};

export const deleteBrandGuideAssetFromCloud = async (asset: BrandGuideAsset): Promise<CloudSyncResult> => {
  if (!isSupabaseConfigured) return { ok: true, message: 'Supabase is not configured. Local delete only.' };

  const user = await getCurrentUser();
  if (!user) return { ok: true, message: 'Not signed in. Local delete only.' };

  const storagePath = buildStoragePath(user.id, asset.brandProfileId, asset);
  await supabase.storage.from(BUCKET).remove([storagePath]);
  const { error } = await (supabase as any).from('brand_brain_assets').delete().eq('id', asset.id).eq('user_id', user.id);
  if (error) throw error;

  return { ok: true, message: 'Brand brain asset deleted from cloud.' };
};
