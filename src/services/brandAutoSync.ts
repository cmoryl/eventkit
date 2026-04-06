/**
 * Auto-Sync Service for BrandHub brands
 * Checks if a brand's BrandHub data is stale and triggers background re-sync
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const SYNC_STALENESS_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if a BrandHub-connected brand needs re-syncing
 * Returns true if sync was triggered
 */
export async function checkAndSyncBrand(
  brandId: string,
  userId: string,
  options?: { silent?: boolean }
): Promise<boolean> {
  try {
    const { data: brand } = await supabase
      .from('brands')
      .select('brandhub_share_token, brandhub_last_synced, brandhub_last_checked, brandhub_auto_sync, name')
      .eq('id', brandId)
      .eq('user_id', userId)
      .maybeSingle();

    if (!brand?.brandhub_share_token || brand.brandhub_auto_sync === false) {
      return false;
    }

    const lastChecked = brand.brandhub_last_checked
      ? new Date(brand.brandhub_last_checked).getTime()
      : 0;
    const now = Date.now();

    if (now - lastChecked < SYNC_STALENESS_MS) {
      return false; // Recently checked, skip
    }

    // Mark as checked to prevent duplicate syncs
    await supabase
      .from('brands')
      .update({ brandhub_last_checked: new Date().toISOString() })
      .eq('id', brandId);

    // Trigger background sync
    console.log(`Auto-syncing BrandHub brand: ${brand.name}`);
    
    const { data, error } = await supabase.functions.invoke('fetch-brandhub-brand', {
      body: { shareToken: brand.brandhub_share_token },
    });

    if (error || !data?.success) {
      console.warn('Auto-sync failed:', error || data?.error);
      return false;
    }

    // Update brand data with fresh BrandHub data
    const hubBrand = data.brand;
    if (hubBrand) {
      await supabase.from('brands').update({
        logo_url: hubBrand.logo_url || undefined,
        logo_monochrome_url: hubBrand.logo_monochrome_url || undefined,
        logo_reversed_url: hubBrand.logo_reversed_url || undefined,
        brandhub_last_synced: new Date().toISOString(),
      }).eq('id', brandId);

      // Update styles
      const { data: existingStyle } = await supabase
        .from('brand_styles')
        .select('id')
        .eq('brand_id', brandId)
        .maybeSingle();

      const styleUpdate = {
        primary_color: hubBrand.primary_color,
        secondary_color: hubBrand.secondary_color,
        accent_color: hubBrand.accent_color,
        color_palette: hubBrand.colors?.map((c: { hex: string; name?: string }) => ({ hex: c.hex, name: c.name || '' })) || [],
        heading_font: hubBrand.heading_font,
        body_font: hubBrand.body_font,
        brand_voice: hubBrand.voice || [],
        photography_dos: hubBrand.photography_dos || [],
        photography_donts: hubBrand.photography_donts || [],
        tagline: hubBrand.tagline,
        all_imagery: hubBrand.allImagery || {},
      };

      if (existingStyle) {
        await supabase.from('brand_styles').update(styleUpdate).eq('id', existingStyle.id);
      }

      if (!options?.silent) {
        toast.info(`"${brand.name}" synced with latest BrandHub data`, { duration: 3000 });
      }
    }

    return true;
  } catch (e) {
    console.warn('Auto-sync error:', e);
    return false;
  }
}

/**
 * Force re-sync a brand from BrandHub (manual trigger)
 */
export async function forceResyncBrand(brandId: string, userId: string): Promise<boolean> {
  // Reset the checked timestamp so sync runs
  await supabase
    .from('brands')
    .update({ brandhub_last_checked: null })
    .eq('id', brandId);

  return checkAndSyncBrand(brandId, userId, { silent: false });
}
