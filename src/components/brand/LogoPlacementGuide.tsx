import React, { useMemo } from 'react';
import { AssetType } from '@/types';
import type { LogoVisibilityMode } from '@/services/logoVisibilityService';
import { getLogoVisibilityDecision } from '@/services/logoVisibilityService';
import { BadgeCheck, Ban, LayoutTemplate, Maximize2, ShieldCheck } from 'lucide-react';

interface LogoPlacementGuideProps {
  assetType?: AssetType;
  mode?: LogoVisibilityMode;
  hasLogo?: boolean;
}

const defaultAssetTypes = [
  AssetType.Banner,
  AssetType.EventSignage,
  AssetType.NameTag,
  AssetType.SocialPost,
  AssetType.Tshirt,
  AssetType.PresentationSlide,
  AssetType.QRCode,
];

export const LogoPlacementGuide: React.FC<LogoPlacementGuideProps> = ({ assetType, mode = 'auto', hasLogo = true }) => {
  const items = useMemo(() => {
    const types = assetType ? [assetType] : defaultAssetTypes;
    return types.map((type) => ({ type, decision: getLogoVisibilityDecision(type, mode, hasLogo) }));
  }, [assetType, mode, hasLogo]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <div>
          <div className="text-sm font-semibold">Logo placement rules</div>
          <p className="text-xs text-muted-foreground">Placement, size, safe-area, and suppression guidance by asset type.</p>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(({ type, decision }) => (
          <div key={type} className="rounded-xl border border-border bg-background p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{type.replace(/_/g, ' ')}</div>
                <p className="mt-1 text-xs text-muted-foreground">{decision.placementGuidance}</p>
              </div>
              <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize text-muted-foreground">{decision.requirement}</span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-1 font-semibold text-foreground"><Maximize2 className="h-3.5 w-3.5" /> Size</div>
                Max {decision.constraints.maxWidthPercent}% width · {decision.constraints.maxHeightPercent}% height
              </div>
              <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-1 font-semibold text-foreground"><LayoutTemplate className="h-3.5 w-3.5" /> Location</div>
                {decision.constraints.preferredLocations.length ? decision.constraints.preferredLocations.join(', ') : 'suppressed'}
              </div>
              <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-1 font-semibold text-foreground"><BadgeCheck className="h-3.5 w-3.5" /> Best</div>
                {decision.constraints.bestPractices[0]}
              </div>
              <div className="rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
                <div className="mb-1 flex items-center gap-1 font-semibold text-foreground"><Ban className="h-3.5 w-3.5" /> Avoid</div>
                {decision.constraints.avoidLocations.slice(0, 2).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogoPlacementGuide;
