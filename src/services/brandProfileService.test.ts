import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getActiveBrandProfile, getAvailableBrandProfiles, setActiveBrandProfile } from './brandProfileService';

describe('brandProfileService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('defaults to the neutral blank custom brand', () => {
    expect(getActiveBrandProfile().id).toBe('blank-custom-brand');
  });

  it('can switch to a preset brand profile', () => {
    const profile = setActiveBrandProfile('modern-saas');
    expect(profile.id).toBe('modern-saas');
    expect(getActiveBrandProfile().id).toBe('modern-saas');
  });

  it('returns available presets', () => {
    expect(getAvailableBrandProfiles().length).toBeGreaterThan(1);
  });
});
