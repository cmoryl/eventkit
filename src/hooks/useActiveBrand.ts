// Hook for managing the active brand across the application
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { applyBrandTheme, resetBrandTheme, isBrandThemeApplied } from '@/services/brandThemeService';

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
  applyBrandToUI: (brand?: ActiveBrand | null) => void;
  resetUITheme: () => void;
  isThemeApplied: boolean;
  refreshBrands: () => Promise<void>;
}

export const useActiveBrand = (): UseActiveBrandReturn => {
  const { user, isAuthenticated } = useAuth();
  const [brands, setBrands] = useState<ActiveBrand[]>([]);
  const [activeBrand, setActiveBrandState] = useState<ActiveBrand | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isThemeApplied, setIsThemeApplied] = useState(isBrandThemeApplied());

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

      // Set default brand as active if none selected
      const defaultBrand = brandsWithStyles.find(b => b.is_default) || brandsWithStyles[0];
      
      // Check if there's a stored active brand in session
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

  // Apply brand colors to UI theme
  const applyBrandToUI = useCallback((brand?: ActiveBrand | null) => {
    const brandToApply = brand ?? activeBrand;
    if (brandToApply?.styles) {
      applyBrandTheme({
        primary_color: brandToApply.styles.primary_color,
        secondary_color: brandToApply.styles.secondary_color,
        accent_color: brandToApply.styles.accent_color,
        color_palette: brandToApply.styles.color_palette
      });
      setIsThemeApplied(true);
    }
  }, [activeBrand]);

  // Reset UI theme to defaults
  const resetUITheme = useCallback(() => {
    resetBrandTheme();
    setIsThemeApplied(false);
  }, []);

  return {
    activeBrand,
    brands,
    isLoading,
    setActiveBrand,
    applyBrandToUI,
    resetUITheme,
    isThemeApplied,
    refreshBrands: loadBrands
  };
};
