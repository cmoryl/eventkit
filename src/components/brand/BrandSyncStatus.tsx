import React, { useState } from 'react';
import { RefreshCw, Cloud, CloudOff, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { checkAndSyncBrand } from '@/services/brandAutoSync';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BrandSyncStatusProps {
  brandId: string;
  brandName: string;
  shareToken?: string;
  lastSynced?: string;
  lastChecked?: string;
  autoSync?: boolean;
  onSyncComplete?: () => void;
  className?: string;
}

export const BrandSyncStatus: React.FC<BrandSyncStatusProps> = ({
  brandId,
  brandName,
  shareToken,
  lastSynced,
  onSyncComplete,
  className,
}) => {
  const { user } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  if (!shareToken) return null;

  const lastSyncDate = lastSynced ? new Date(lastSynced) : null;
  const isStale = lastSyncDate
    ? Date.now() - lastSyncDate.getTime() > 24 * 60 * 60 * 1000
    : true;

  const handleSync = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const updated = await checkAndSyncBrand(brandId, user.id, { silent: true });
      if (updated) {
        setJustSynced(true);
        toast.success(`${brandName} synced from BrandHub`);
        setTimeout(() => setJustSynced(false), 3000);
        onSyncComplete?.();
      } else {
        toast.info('Brand is up to date');
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncLabel = lastSyncDate
    ? `Synced ${formatDistanceToNow(lastSyncDate, { addSuffix: true })}`
    : 'Never synced';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className={cn(
              'relative flex items-center gap-1.5 px-2 py-1 rounded-md text-xs transition-all',
              'hover:bg-accent/50 disabled:opacity-60',
              isStale && !isSyncing && !justSynced
                ? 'text-primary/80'
                : 'text-muted-foreground',
              className,
            )}
          >
            {/* Pulse ring for stale brands */}
            {isStale && !isSyncing && !justSynced && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}

            {isSyncing ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : justSynced ? (
              <Check className="h-3 w-3 text-accent" />
            ) : isStale ? (
              <CloudOff className="h-3 w-3" />
            ) : (
              <Cloud className="h-3 w-3" />
            )}

            <span className="hidden sm:inline">
              {isSyncing ? 'Syncing…' : justSynced ? 'Updated' : syncLabel}
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-[200px]">
          <p className="font-medium">BrandHub Sync</p>
          <p className="text-muted-foreground">
            {lastSyncDate
              ? `Last synced ${formatDistanceToNow(lastSyncDate, { addSuffix: true })}`
              : 'Not yet synced from BrandHub'}
          </p>
          {isStale && <p className="text-primary mt-1">Click to sync latest data</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
