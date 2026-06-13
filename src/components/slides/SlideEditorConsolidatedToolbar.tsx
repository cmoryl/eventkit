import React, { useMemo, useRef } from 'react';
import { Download, Grid3X3, Play, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { EditorConsolidatedActionHandlers } from '@/hooks/useEditorConsolidatedActionDispatcher';
import { useEditorConsolidatedActionDispatcher } from '@/hooks/useEditorConsolidatedActionDispatcher';
import { EditorConsolidatedActionBar } from './EditorConsolidatedActionBar';
import { cn } from '@/lib/utils';

export interface SlideEditorConsolidatedToolbarProps {
  assetName: string;
  slideCount: number;
  zoom: number;
  isGridView?: boolean;
  hasBrand?: boolean;
  exportReady?: boolean;
  onClose: () => void;
  onImportPptxChange?: React.ChangeEventHandler<HTMLInputElement>;
  handlers?: EditorConsolidatedActionHandlers;
  className?: string;
}

export const SlideEditorConsolidatedToolbar: React.FC<SlideEditorConsolidatedToolbarProps> = ({
  assetName,
  slideCount,
  zoom,
  isGridView,
  hasBrand,
  exportReady,
  onClose,
  onImportPptxChange,
  handlers,
  className,
}) => {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const resolvedHandlers = useMemo<EditorConsolidatedActionHandlers>(() => ({
    ...handlers,
    importPptx: handlers?.importPptx ?? (() => importInputRef.current?.click()),
  }), [handlers]);
  const dispatchAction = useEditorConsolidatedActionDispatcher(resolvedHandlers);

  return (
    <header className={cn('border-b bg-card/95 px-4 py-3 shadow-sm backdrop-blur', className)}>
      <input ref={importInputRef} type="file" accept=".pptx" className="hidden" onChange={onImportPptxChange} />
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black tracking-tight">{assetName}</h2>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span>{slideCount} slides</span>
              <span>·</span>
              <span>{zoom}% zoom</span>
              {isGridView && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary"><Grid3X3 className="h-3 w-3" /> Grid</span>}
              {hasBrand && <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-bold text-primary"><ShieldCheck className="h-3 w-3" /> Brand</span>}
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <Button size="sm" variant="outline" onClick={() => dispatchAction('view_present', 'view_present')}>
            <Play className="mr-1.5 h-3.5 w-3.5" /> Present
          </Button>
          <Button size="sm" variant={exportReady ? 'default' : 'outline'} onClick={() => dispatchAction('review_export_pptx', 'review_export')}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Review & Export
          </Button>
        </div>
      </div>

      <EditorConsolidatedActionBar onAction={dispatchAction} />
    </header>
  );
};
