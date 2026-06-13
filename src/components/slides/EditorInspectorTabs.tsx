import React, { useState } from 'react';
import { BarChart3, Image, LayoutTemplate, Palette, Settings2, Sparkles, Type } from 'lucide-react';
import type { SlideData } from './slideTypes';
import { cn } from '@/lib/utils';

export type EditorInspectorTabId = 'content' | 'layout' | 'style' | 'media' | 'data' | 'advanced';

const tabs: Array<{ id: EditorInspectorTabId; label: string; icon: React.ElementType }> = [
  { id: 'content', label: 'Content', icon: Type },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate },
  { id: 'style', label: 'Style', icon: Palette },
  { id: 'media', label: 'Media', icon: Image },
  { id: 'data', label: 'Data', icon: BarChart3 },
  { id: 'advanced', label: 'Advanced', icon: Settings2 },
];

export const EditorInspectorTabs: React.FC<{
  slide?: SlideData;
  className?: string;
}> = ({ slide, className }) => {
  const [activeTab, setActiveTab] = useState<EditorInspectorTabId>('content');

  return (
    <div className={cn('rounded-2xl border border-border bg-card text-xs shadow-sm', className)}>
      <div className="border-b border-border p-3">
        <div className="flex items-center gap-2 font-black text-primary"><Sparkles className="h-4 w-4" /> Smart Inspector</div>
        <p className="mt-1 text-muted-foreground">Tabbed controls reduce clutter and keep advanced settings secondary.</p>
      </div>
      <div className="grid grid-cols-3 gap-1 p-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn('rounded-xl px-2 py-2 font-bold transition', active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}
            >
              <Icon className="mx-auto mb-1 h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="space-y-2 border-t border-border p-3">
        <div className="rounded-xl bg-muted p-3">
          <div className="font-black capitalize">{activeTab} controls</div>
          <p className="mt-1 text-muted-foreground">Active slide: {slide?.title || 'Untitled'} · {slide?.layout || 'No layout'}</p>
        </div>
        <div className="rounded-xl border border-border bg-background p-2 text-muted-foreground">
          Keep the current task obvious, make changes reversible, and reserve advanced controls for users who need them.
        </div>
      </div>
    </div>
  );
};
