/**
 * Push-to-BrandHub Service
 * Pushes generated EventKIT assets back to BrandHub
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushableAsset {
  imageUrl: string;
  assetType: string;
  title: string;
  prompt?: string;
  fonts?: { heading?: string; body?: string };
}

/**
 * Push generated assets back to BrandHub
 */
export async function pushAssetsToBrandHub(
  brandId: string,
  assets: PushableAsset[]
): Promise<boolean> {
  if (assets.length === 0) return false;

  try {
    const { data, error } = await supabase.functions.invoke('push-to-brandhub', {
      body: { brandId, assets },
    });

    if (error || !data?.success) {
      toast.error(data?.error || 'Failed to push assets to BrandHub');
      return false;
    }

    toast.success(`${data.pushed} asset(s) pushed to BrandHub`);
    return true;
  } catch (e) {
    console.error('Push to BrandHub error:', e);
    toast.error('Failed to push assets');
    return false;
  }
}
