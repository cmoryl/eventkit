import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LogoSettings {
  type: 'default' | 'custom' | 'icon-only';
  url: string | null;
  iconUrl: string | null;
}

interface AppSettings {
  logo: LogoSettings;
}

const defaultSettings: AppSettings = {
  logo: {
    type: 'default',
    url: null,
    iconUrl: null
  }
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['logo']);

      if (error) throw error;

      const newSettings = { ...defaultSettings };
      data?.forEach((row) => {
        if (row.key === 'logo' && row.value) {
          const val = row.value as Record<string, unknown>;
          newSettings.logo = {
            type: (val.type as LogoSettings['type']) || 'default',
            url: (val.url as string | null) || null,
            iconUrl: (val.iconUrl as string | null) || null
          };
        }
      });

      setSettings(newSettings);
    } catch (err) {
      console.error('Failed to fetch app settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateLogoSettings = useCallback(async (logoSettings: Partial<LogoSettings>) => {
    const newLogo = { ...settings.logo, ...logoSettings };
    
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: newLogo })
        .eq('key', 'logo');

      if (error) throw error;

      setSettings(prev => ({ ...prev, logo: newLogo }));
      return true;
    } catch (err) {
      console.error('Failed to update logo settings:', err);
      throw err;
    }
  }, [settings.logo]);

  return {
    settings,
    isLoading,
    error,
    updateLogoSettings,
    refetch: fetchSettings,
    logoUrl: settings.logo.url,
    logoIconUrl: settings.logo.iconUrl,
    logoType: settings.logo.type,
    hasCustomLogo: settings.logo.type === 'custom' && !!settings.logo.url
  };
};

export type { LogoSettings, AppSettings };
