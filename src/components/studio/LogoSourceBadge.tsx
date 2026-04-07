import React from 'react';
import { Image, Layers, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LogoSourceBadgeProps {
  assetLogoOverride: string | null;
  projectLogoOverride?: string | null;
  brandLogoUrl?: string | null;
  className?: string;
}

type LogoSource = 'asset' | 'project' | 'brand' | 'none';

const sourceConfig: Record<LogoSource, { label: string; icon: React.ElementType; color: string; tooltip: string }> = {
  asset: { label: 'Asset', icon: Layers, color: 'bg-accent/15 text-accent border-accent/30', tooltip: 'Using asset-level logo override' },
  project: { label: 'Project', icon: Image, color: 'bg-primary/15 text-primary border-primary/30', tooltip: 'Using project-level logo override' },
  brand: { label: 'Brand', icon: Building2, color: 'bg-secondary/80 text-secondary-foreground border-secondary', tooltip: 'Using approved brand logo' },
  none: { label: 'No Logo', icon: Image, color: 'bg-muted text-muted-foreground border-border', tooltip: 'No logo configured' },
};

export const LogoSourceBadge: React.FC<LogoSourceBadgeProps> = ({
  assetLogoOverride,
  projectLogoOverride,
  brandLogoUrl,
  className,
}) => {
  const source: LogoSource = assetLogoOverride
    ? 'asset'
    : projectLogoOverride
    ? 'project'
    : brandLogoUrl
    ? 'brand'
    : 'none';

  const config = sourceConfig[source];
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase select-none transition-colors',
            config.color,
            className
          )}
        >
          <Icon className="h-3 w-3" />
          {config.label}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
};
