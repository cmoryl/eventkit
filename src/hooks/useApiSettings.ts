import { useState, useEffect, useCallback } from 'react';

interface ApiSettings {
  googleMapsApiKey?: string;
  googleCloudApiKey?: string;
  openaiApiKey?: string;
  stabilityApiKey?: string;
  replicateApiKey?: string;
}

const STORAGE_KEY = 'event-design-kit-api-settings';

export const useApiSettings = () => {
  const [settings, setSettings] = useState<ApiSettings>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load API settings:', error);
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = useCallback((updates: Partial<ApiSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save API settings:', error);
      }
      return updated;
    });
  }, []);

  const clearSettings = useCallback(() => {
    setSettings({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear API settings:', error);
    }
  }, []);

  const configuredKeysCount = [
    settings.googleMapsApiKey,
    settings.googleCloudApiKey,
    settings.openaiApiKey,
    settings.stabilityApiKey,
    settings.replicateApiKey,
  ].filter(Boolean).length;

  return {
    settings,
    isLoaded,
    updateSettings,
    clearSettings,
    hasGoogleMapsKey: Boolean(settings.googleMapsApiKey),
    hasGoogleCloudKey: Boolean(settings.googleCloudApiKey),
    hasOpenAIKey: Boolean(settings.openaiApiKey),
    hasStabilityKey: Boolean(settings.stabilityApiKey),
    hasReplicateKey: Boolean(settings.replicateApiKey),
    configuredKeysCount,
  };
};

export type { ApiSettings };
