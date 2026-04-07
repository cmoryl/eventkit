import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { LogoPlacement } from '@/components/studio/DraggableLogoOverlay';

/**
 * Loads and saves the user's preferred logo placement for a given asset type.
 * Returns { savedPlacement, savePlacement, isLoading }.
 */
export function useLogoPlacement(assetType: string) {
  const { user } = useAuth();
  const [savedPlacement, setSavedPlacement] = useState<LogoPlacement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load on mount
  useEffect(() => {
    if (!user?.id || !assetType) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    supabase
      .from('logo_placements' as any)
      .select('x, y, scale')
      .eq('user_id', user.id)
      .eq('asset_type', assetType)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSavedPlacement({
            x: Number((data as any).x),
            y: Number((data as any).y),
            scale: Number((data as any).scale),
          });
        }
        setIsLoading(false);
      });
  }, [user?.id, assetType]);

  const savePlacement = useCallback(
    async (placement: LogoPlacement) => {
      if (!user?.id || !assetType) return;
      setSavedPlacement(placement);

      // Upsert using the unique(user_id, asset_type) constraint
      await supabase.from('logo_placements' as any).upsert(
        {
          user_id: user.id,
          asset_type: assetType,
          x: placement.x,
          y: placement.y,
          scale: placement.scale,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,asset_type' }
      );
    },
    [user?.id, assetType]
  );

  const clearPlacement = useCallback(
    async () => {
      if (!user?.id || !assetType) return;
      setSavedPlacement(null);
      await supabase
        .from('logo_placements' as any)
        .delete()
        .eq('user_id', user.id)
        .eq('asset_type', assetType);
    },
    [user?.id, assetType]
  );

  const clearAllPlacements = useCallback(
    async () => {
      if (!user?.id) return;
      setSavedPlacement(null);
      await supabase
        .from('logo_placements' as any)
        .delete()
        .eq('user_id', user.id);
    },
    [user?.id]
  );

  return { savedPlacement, savePlacement, clearPlacement, clearAllPlacements, isLoading };
}
