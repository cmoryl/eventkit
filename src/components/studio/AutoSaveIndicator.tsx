import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: AutoSaveStatus;
  lastSavedAt: Date | null;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSavedAt,
  className,
}) => {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const config: Record<AutoSaveStatus, { icon: React.ElementType; label: string; color: string }> = {
    idle: { icon: Cloud, label: 'Auto-save on', color: 'text-muted-foreground' },
    pending: { icon: Cloud, label: 'Unsaved changes', color: 'text-amber-500' },
    saving: { icon: Loader2, label: 'Saving...', color: 'text-primary' },
    saved: { icon: Check, label: lastSavedAt ? `Saved ${getTimeAgo(lastSavedAt)}` : 'Saved', color: 'text-emerald-500' },
    error: { icon: AlertCircle, label: 'Save failed', color: 'text-destructive' },
  };

  const { icon: Icon, label, color } = config[status];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
          'bg-muted/50 border border-border/50',
          color,
          className
        )}
      >
        <Icon className={cn('h-3 w-3', status === 'saving' && 'animate-spin')} />
        <span>{label}</span>
        {status === 'pending' && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
