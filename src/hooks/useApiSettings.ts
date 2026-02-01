import { useState, useEffect, useCallback } from 'react';

interface ApiSettings {
  googleMapsApiKey?: string;
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

  return {
    settings,
    isLoaded,
    updateSettings,
    clearSettings,
    hasGoogleMapsKey: Boolean(settings.googleMapsApiKey),
  };
};

export type { ApiSettings };
