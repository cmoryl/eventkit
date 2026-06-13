import React, { useState } from 'react';
import { Box, CheckCircle2, Eye, MousePointerClick, PackageCheck, PlusCircle, ShieldCheck } from 'lucide-react';
import { editorActionGroups, type PresentationEditorActionGroupId } from '@/services/presentationEditorActionAuditService';
import { getPresentationEditorActionsByGroup, type PresentationEditorActionId } from '@/services/presentationEditorActionContractService';
import { cn } from '@/lib/utils';

const groupIcons: Record<PresentationEditorActionGroupId, React.ElementType> = {
  create_insert: PlusCircle,
  edit_canvas: MousePointerClick,
  view_present: Eye,
  brand_assets: ShieldCheck,
  review_export: CheckCircle2,
  reuse_system: PackageCheck,
};

export const EditorConsolidatedActionBar: React.FC<{
  activeGroup?: PresentationEditorActionGroupId;
  onSelectGroup?: (group: PresentationEditorActionGroupId) => void;
  onAction?: (action: PresentationEditorActionId, group: PresentationEditorActionGroupId) => void;
  className?: string;
}> = ({ activeGroup = 'create_insert', onSelectGroup, onAction, className }) => {
  const [expandedGroup, setExpandedGroup] = useState<PresentationEditorActionGroupId | null>(activeGroup);

  return (
    <div className={cn('rounded-2xl border border-border bg-card/95 p-2 text-xs shadow-xl backdrop-blur', className)}>
      <div className="mb-2 flex items-center gap-2 px-1 font-black text-primary">
        <Box className="h-4 w-4" /> Consolidated Actions
      </div>
      <div className="flex flex-wrap gap-1.5">
        {editorActionGroups.map((group) => {
          const Icon = groupIcons[group.id];
          const active = expandedGroup === group.id;
          return (
            <button
              key={group.id}
              type="button"
              onClick={() => {
                setExpandedGroup(active ? null : group.id);
                onSelectGroup?.(group.id);
              }}
              className={cn(
                'inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 font-bold transition',
                active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {group.primaryButton}
            </button>
          );
        })}
      </div>
      {expandedGroup && (
        <div className="mt-2 rounded-xl border border-border bg-background/90 p-2">
          {editorActionGroups.filter((group) => group.id === expandedGroup).map((group) => {
            const actions = getPresentationEditorActionsByGroup(group.id);
            return (
              <div key={group.id}>
                <div className="font-black">{group.label}</div>
                <p className="mt-1 text-muted-foreground">{group.purpose}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => onAction?.(action.id, group.id)}
                      className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground transition hover:bg-primary hover:text-primary-foreground"
                      title={action.userFeedback}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
