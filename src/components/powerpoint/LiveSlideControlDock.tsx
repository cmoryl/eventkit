import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { SlideData } from '@/components/slides/slideTypes';
import type { LiveSlideAction } from '@/services/presentationLiveActionRegistry';
import type { PresentationInteractionControl } from '@/services/presentationInteractionControlService';
import { resolveLiveControl, type LiveControlResolution } from '@/services/presentationLiveControlResolver';
import { LivePresentationControlPanel } from './LivePresentationControlPanel';
import { LiveSlideFloatingToolbar } from './LiveSlideFloatingToolbar';

export interface LiveSlideControlDockProps {
  slide: SlideData;
  onResolve?: (resolution: LiveControlResolution) => void;
  className?: string;
}

export const LiveSlideControlDock: React.FC<LiveSlideControlDockProps> = ({ slide, onResolve, className }) => {
  const [activeControlId, setActiveControlId] = useState<string | undefined>();
  const activeResolution = useMemo(
    () => activeControlId ? resolveLiveControl(activeControlId, slide) : undefined,
    [activeControlId, slide],
  );

  const handleControl = (control: LiveSlideAction | PresentationInteractionControl) => {
    const resolution = resolveLiveControl(control, slide);
    setActiveControlId(control.id);
    onResolve?.(resolution);
    toast.info(resolution.label, { description: resolution.message });
  };

  return (
    <div className={className}>
      <LiveSlideFloatingToolbar slide={slide} activeActionId={activeControlId} onAction={handleControl} />
      <div className="mt-3">
        <LivePresentationControlPanel slide={slide} selectedControlId={activeControlId} onSelectControl={handleControl} />
      </div>
      {activeResolution && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-3 text-xs text-muted-foreground">
          <div className="font-bold text-foreground">{activeResolution.label}</div>
          <div className="mt-1">Mode: <span className="font-mono">{activeResolution.mode}</span></div>
          <div className="mt-1">{activeResolution.message}</div>
        </div>
      )}
    </div>
  );
};
