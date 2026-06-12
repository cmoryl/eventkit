import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { brandPresets, getBrandPresetById } from '@/brandPresets';

const ACTIVE_BRAND_PROFILE_KEY = 'active-brand-profile';
const ACTIVE_BRAND_MODE_KEY = 'active-brand-mode';

export const getAvailableBrandProfiles = () => brandPresets;

export const getActiveBrandProfile = (): BrandProfile => {
  const savedId = localStorage.getItem(ACTIVE_BRAND_PROFILE_KEY);
  return (savedId && getBrandPresetById(savedId)) || brandPresets[0];
};

export const setActiveBrandProfile = (brandProfileId: string) => {
  const profile = getBrandPresetById(brandProfileId);
  if (!profile) {
    throw new Error(`Unknown brand profile: ${brandProfileId}`);
  }

  localStorage.setItem(ACTIVE_BRAND_PROFILE_KEY, profile.id);
  localStorage.setItem(ACTIVE_BRAND_MODE_KEY, profile.defaultMode);
  return profile;
};

export const getActiveBrandMode = (): BrandMode => {
  const profile = getActiveBrandProfile();
  return (localStorage.getItem(ACTIVE_BRAND_MODE_KEY) as BrandMode | null) || profile.defaultMode;
};

export const setActiveBrandMode = (mode: BrandMode) => {
  localStorage.setItem(ACTIVE_BRAND_MODE_KEY, mode);
  return mode;
};

export const createCustomBrandProfile = (profile: BrandProfile) => {
  const customProfilesRaw = localStorage.getItem('custom-brand-profiles');
  const customProfiles: BrandProfile[] = customProfilesRaw ? JSON.parse(customProfilesRaw) : [];
  const nextProfiles = [...customProfiles.filter((item) => item.id !== profile.id), profile];
  localStorage.setItem('custom-brand-profiles', JSON.stringify(nextProfiles));
  return profile;
};
