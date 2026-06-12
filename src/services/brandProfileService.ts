import type { BrandMode, BrandProfile } from '@/types/brandProfile';
import { brandPresets, getBrandPresetById } from '@/brandPresets';

const ACTIVE_BRAND_PROFILE_KEY = 'active-brand-profile';
const ACTIVE_BRAND_MODE_KEY = 'active-brand-mode';
const CUSTOM_BRAND_PROFILES_KEY = 'custom-brand-profiles';

const hasStorage = () => typeof localStorage !== 'undefined';

export const readCustomBrandProfiles = (): BrandProfile[] => {
  if (!hasStorage()) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BRAND_PROFILES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeCustomBrandProfiles = (profiles: BrandProfile[]) => {
  if (hasStorage()) {
    localStorage.setItem(CUSTOM_BRAND_PROFILES_KEY, JSON.stringify(profiles));
  }
};

const findBrandProfile = (id: string) => getBrandPresetById(id) || readCustomBrandProfiles().find((profile) => profile.id === id);

export const isPresetBrandProfile = (id: string) => Boolean(getBrandPresetById(id));

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
  writeCustomBrandProfiles(nextProfiles);
  return profile;
};

export const deleteCustomBrandProfile = (brandProfileId: string) => {
  if (isPresetBrandProfile(brandProfileId)) {
    throw new Error('Preset brand profiles cannot be deleted.');
  }

  const nextProfiles = readCustomBrandProfiles().filter((profile) => profile.id !== brandProfileId);
  writeCustomBrandProfiles(nextProfiles);

  if (hasStorage() && localStorage.getItem(ACTIVE_BRAND_PROFILE_KEY) === brandProfileId) {
    localStorage.setItem(ACTIVE_BRAND_PROFILE_KEY, brandPresets[0].id);
    localStorage.setItem(ACTIVE_BRAND_MODE_KEY, brandPresets[0].defaultMode);
  }

  return nextProfiles;
};

export const importBrandProfile = (profile: BrandProfile) => {
  if (!profile.id || !profile.name || !profile.defaultMode) {
    throw new Error('Invalid brand profile. Missing id, name, or defaultMode.');
  }

  return createCustomBrandProfile({
    ...profile,
    id: isPresetBrandProfile(profile.id) ? `custom-${profile.id}-${Date.now()}` : profile.id,
  });
};

export const duplicateBrandProfile = (profile: BrandProfile) => {
  return createCustomBrandProfile({
    ...profile,
    id: `custom-${profile.id}-${Date.now()}`,
    name: `${profile.name} Copy`,
    defaultMode: profile.defaultMode === 'locked' ? 'guided' : profile.defaultMode,
  });
};
