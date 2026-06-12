import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { brandPresets, getBrandPresetById } from '@/brandPresets';

const ACTIVE_BRAND_PROFILE_KEY = 'active-brand-profile';
const ACTIVE_BRAND_MODE_KEY = 'active-brand-mode';
const CUSTOM_BRAND_PROFILES_KEY = 'custom-brand-profiles';

const hasStorage = () => typeof localStorage !== 'undefined';

const readCustomBrandProfiles = (): BrandProfile[] => {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BRAND_PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const findBrandProfile = (id: string) => getBrandPresetById(id) || readCustomBrandProfiles().find((profile) => profile.id === id);

export const getAvailableBrandProfiles = () => [...brandPresets, ...readCustomBrandProfiles()];

export const getActiveBrandProfile = (): BrandProfile => {
  const savedId = hasStorage() ? localStorage.getItem(ACTIVE_BRAND_PROFILE_KEY) : null;
  return (savedId && findBrandProfile(savedId)) || brandPresets[0];
};

export const setActiveBrandProfile = (brandProfileId: string) => {
  const profile = findBrandProfile(brandProfileId);
  if (!profile) {
    throw new Error('Unknown brand profile: ' + brandProfileId);
  }

  if (hasStorage()) {
    localStorage.setItem(ACTIVE_BRAND_PROFILE_KEY, profile.id);
    localStorage.setItem(ACTIVE_BRAND_MODE_KEY, profile.defaultMode);
  }
  return profile;
};

export const getActiveBrandMode = (): BrandMode => {
  const profile = getActiveBrandProfile();
  return (hasStorage() ? localStorage.getItem(ACTIVE_BRAND_MODE_KEY) as BrandMode | null : null) || profile.defaultMode;
};

export const setActiveBrandMode = (mode: BrandMode) => {
  if (hasStorage()) {
    localStorage.setItem(ACTIVE_BRAND_MODE_KEY, mode);
  }
  return mode;
};

export const createCustomBrandProfile = (profile: BrandProfile) => {
  const customProfiles = readCustomBrandProfiles();
  const nextProfiles = [...customProfiles.filter((item) => item.id !== profile.id), profile];
  if (hasStorage()) {
    localStorage.setItem(CUSTOM_BRAND_PROFILES_KEY, JSON.stringify(nextProfiles));
  }
  return profile;
};
