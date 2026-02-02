// Hook for managing the active brand across the application
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { applyBrandTheme, resetBrandTheme, isBrandThemeApplied } from '@/services/brandThemeService';
import { toast } from 'sonner';

interface BrandStyleSimple {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette?: Array<{ hex: string; name?: string }>;
  heading_font?: string;
  body_font?: string;
  mood_keywords?: string[];
}

interface ActiveBrand {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  logo_url?: string;
  logo_monochrome_url?: string;
  logo_reversed_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  brandhub_share_token?: string;
  styles?: BrandStyleSimple;
}

interface UseActiveBrandReturn {
  activeBrand: ActiveBrand | null;
  brands: ActiveBrand[];
  isLoading: boolean;
  setActiveBrand: (brand: ActiveBrand | null) => void;
  applyBrandToUI: (brand?: ActiveBrand | null, persist?: boolean) => Promise<void>;
  resetUITheme: (persist?: boolean) => Promise<void>;
  isThemeApplied: boolean;
  savedBrandId: string | null; // The brand ID saved in the user's profile
  refreshBrands: () => Promise<void>;
}

export const useActiveBrand = (): UseActiveBrandReturn => {
  const { user, isAuthenticated } = useAuth();
  const [brands, setBrands] = useState<ActiveBrand[]>([]);
  const [activeBrand, setActiveBrandState] = useState<ActiveBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeApplied, setIsThemeApplied] = useState(isBrandThemeApplied());
  const [savedBrandId, setSavedBrandId] = useState<string | null>(null);

  // Load brands with their styles
  const loadBrands = useCallback(async () => {
    if (!user) {
      setBrands([]);
      setActiveBrandState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load brands
      const { data: brandsData, error: brandsError } = await supabase
        .from('brands')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (brandsError) throw brandsError;

      // Load styles for each brand
      const brandsWithStyles: ActiveBrand[] = [];
      
      for (const brand of brandsData || []) {
        const { data: styleData } = await supabase
          .from('brand_styles')
          .select('*')
          .eq('brand_id', brand.id)
          .maybeSingle();

        brandsWithStyles.push({
          ...brand,
          is_default: brand.is_default ?? false,
          styles: styleData ? {
            primary_color: styleData.primary_color ?? undefined,
            secondary_color: styleData.secondary_color ?? undefined,
            accent_color: styleData.accent_color ?? undefined,
            color_palette: Array.isArray(styleData.color_palette) 
              ? styleData.color_palette as Array<{ hex: string; name?: string }>
              : [],
            heading_font: styleData.heading_font ?? undefined,
            body_font: styleData.body_font ?? undefined,
            mood_keywords: styleData.mood_keywords ?? [],
          } : undefined
        });
      }

      setBrands(brandsWithStyles);

      // Check if there's a persisted applied brand in the database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('applied_brand_id')
        .eq('user_id', user.id)
        .maybeSingle();

      const persistedBrandId = profileData?.applied_brand_id;
      setSavedBrandId(persistedBrandId || null);
      
      // Try to restore the persisted brand theme
      if (persistedBrandId) {
        const persistedBrand = brandsWithStyles.find(b => b.id === persistedBrandId);
        if (persistedBrand) {
          setActiveBrandState(persistedBrand);
          // Apply the theme without notification on initial load
          if (persistedBrand.styles) {
            applyBrandTheme({
              primary_color: persistedBrand.styles.primary_color,
              secondary_color: persistedBrand.styles.secondary_color,
              accent_color: persistedBrand.styles.accent_color,
              color_palette: persistedBrand.styles.color_palette
            }, false);
            setIsThemeApplied(true);
          }
          return;
        }
      }

      // Fallback: Set default brand as active if none persisted
      const defaultBrand = brandsWithStyles.find(b => b.is_default) || brandsWithStyles[0];
      
      // Check session storage as secondary fallback
      const storedBrandId = sessionStorage.getItem('active-brand-id');
      const storedBrand = storedBrandId 
        ? brandsWithStyles.find(b => b.id === storedBrandId) 
        : null;
      
      setActiveBrandState(storedBrand || defaultBrand || null);

    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBrands();
    } else {
      setBrands([]);
      setActiveBrandState(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, loadBrands]);

  // Set active brand and persist to session
  const setActiveBrand = useCallback((brand: ActiveBrand | null) => {
    setActiveBrandState(brand);
    if (brand) {
      sessionStorage.setItem('active-brand-id', brand.id);
    } else {
      sessionStorage.removeItem('active-brand-id');
    }
  }, []);

  // Persist applied brand to database
  const persistAppliedBrand = useCallback(async (brandId: string | null) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ applied_brand_id: brandId })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error persisting brand theme:', error);
      }
    } catch (error) {
      console.error('Error persisting brand theme:', error);
    }
  }, [user]);

  // Apply brand colors to UI theme
  const applyBrandToUI = useCallback(async (brand?: ActiveBrand | null, persist = true) => {
    const brandToApply = brand ?? activeBrand;
    if (brandToApply?.styles) {
      applyBrandTheme({
        primary_color: brandToApply.styles.primary_color,
        secondary_color: brandToApply.styles.secondary_color,
        accent_color: brandToApply.styles.accent_color,
        color_palette: brandToApply.styles.color_palette
      });
      setIsThemeApplied(true);

      // Persist to database
      if (persist) {
        await persistAppliedBrand(brandToApply.id);
        setSavedBrandId(brandToApply.id);
        toast.success('Theme saved', {
          description: 'Your brand theme will persist across sessions'
        });
      }
    }
  }, [activeBrand, persistAppliedBrand]);

  // Reset UI theme to defaults
  const resetUITheme = useCallback(async (persist = true) => {
    resetBrandTheme();
    setIsThemeApplied(false);

    // Clear from database
    if (persist) {
      await persistAppliedBrand(null);
      setSavedBrandId(null);
    }
  }, [persistAppliedBrand]);

  return {
    activeBrand,
    brands,
    isLoading,
    setActiveBrand,
    applyBrandToUI,
    resetUITheme,
    isThemeApplied,
    savedBrandId,
    refreshBrands: loadBrands
  };
};
