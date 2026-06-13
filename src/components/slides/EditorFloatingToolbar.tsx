import React from 'react';
import { AlignCenter, ImagePlus, LayoutTemplate, Palette, ShieldCheck, Sparkles, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EditorFloatingToolbarAction {
  id: string;
  label: string;
  icon: React.ElementType;
  tone?: 'default' | 'primary' | 'warning';
}

export const defaultEditorFloatingActions: EditorFloatingToolbarAction[] = [
  { id: 'edit_text', label: 'Text', icon: Type, tone: 'default' },
  { id: 'layout', label: 'Layout', icon: LayoutTemplate, tone: 'default' },
  { id: 'image', label: 'Image', icon: ImagePlus, tone: 'default' },
  { id: 'align', label: 'Align', icon: AlignCenter, tone: 'default' },
  { id: 'brand', label: 'Brand', icon: ShieldCheck, tone: 'primary' },
  { id: 'style', label: 'Style', icon: Palette, tone: 'default' },
  { id: 'ai_fix', label: 'AI Fix', icon: Sparkles, tone: 'warning' },
];

export const EditorFloatingToolbar: React.FC<{
  actions?: EditorFloatingToolbarAction[];
  activeAction?: string;
  onAction?: (id: string) => void;
  className?: string;
}> = ({ actions = defaultEditorFloatingActions, activeAction, onAction, className }) => {
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-2xl border border-border bg-card/95 p-1.5 text-xs shadow-xl backdrop-blur', className)}>
      {actions.map((action) => {
        const Icon = action.icon;
        const active = activeAction === action.id;
        return (
          <button
            key={action.id}
            type="button"
            onClick={() => onAction?.(action.id)}
            className={cn(
              'inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 font-bold transition',
              active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              action.tone === 'primary' && !active && 'text-primary',
              action.tone === 'warning' && !active && 'text-amber-600 dark:text-amber-300',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
};
