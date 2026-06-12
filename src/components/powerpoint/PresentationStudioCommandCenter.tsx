import React, { useMemo, useState } from 'react';
import { Activity, CheckCircle2, Layers3, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import type { PowerPointToolCategory, PowerPointToolId } from '@/services/powerpointToolRegistry';
import { getPowerPointToolsByCategory, powerpointToolRegistry } from '@/services/powerpointToolRegistry';
import type { MinimalDeckOutline, DeckQualityReport } from '@/services/presentationDeckQualityService';
import { auditPresentationDeck } from '@/services/presentationDeckQualityService';
import type { PresentationDeckBrainPayload } from '@/services/presentationDeckBrainService';
import { cn } from '@/lib/utils';

const categories: Array<{ id: PowerPointToolCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'create', label: 'Create' },
  { id: 'source', label: 'Source' },
  { id: 'brand', label: 'Brand' },
  { id: 'repair', label: 'Repair' },
  { id: 'transform', label: 'Transform' },
  { id: 'content', label: 'Content' },
  { id: 'audit', label: 'Audit' },
  { id: 'export', label: 'Export' },
];

export interface PresentationStudioCommandCenterProps {
  deck?: MinimalDeckOutline | null;
  deckBrain?: PresentationDeckBrainPayload | null;
  selectedToolId?: PowerPointToolId;
  onToolSelect?: (toolId: PowerPointToolId) => void;
  requestedSlideCount?: number;
  className?: string;
}

const scoreTone = (report?: DeckQualityReport) => {
  if (!report) return 'text-muted-foreground border-border bg-card';
  if (report.status === 'pass') return 'text-emerald-700 border-emerald-500/20 bg-emerald-500/10';
  if (report.status === 'warn') return 'text-amber-700 border-amber-500/20 bg-amber-500/10';
  return 'text-destructive border-destructive/20 bg-destructive/10';
};

export const PresentationStudioCommandCenter: React.FC<PresentationStudioCommandCenterProps> = ({
  deck,
  deckBrain,
  selectedToolId,
  onToolSelect,
  requestedSlideCount,
  className,
}) => {
  const [category, setCategory] = useState<PowerPointToolCategory | 'all'>('all');
  const tools = category === 'all' ? powerpointToolRegistry : getPowerPointToolsByCategory(category);
  const report = useMemo(() => deck ? auditPresentationDeck({ deck, deckBrain, requestedSlideCount }) : undefined, [deck, deckBrain, requestedSlideCount]);

  return (
    <aside className={cn('rounded-3xl border border-border bg-card p-4 shadow-sm', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary"><Wand2 className="h-4 w-4" /> PowerPoint Command Center</div>
          <p className="mt-1 text-xs text-muted-foreground">Advanced deck actions powered by the Presentation Deck Brain.</p>
        </div>
        <div className={cn('rounded-2xl border px-3 py-2 text-right text-xs', scoreTone(report))}>
          <div className="font-bold">{report ? report.score : '—'}</div>
          <div className="capitalize">{report ? report.status : 'no deck'}</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Brand Brain</div><div className="mt-1 flex items-center gap-1 font-semibold">{deckBrain ? <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> : <Activity className="h-3.5 w-3.5" />} {deckBrain ? 'Loaded' : 'Pending'}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Logo</div><div className="mt-1 flex items-center gap-1 font-semibold">{deckBrain?.hasExactLogoSource ? <ShieldCheck className="h-3.5 w-3.5 text-primary" /> : <Activity className="h-3.5 w-3.5" />} {deckBrain?.hasExactLogoSource ? 'Exact' : 'Missing'}</div></div>
        <div className="rounded-2xl border border-border bg-background p-3"><div className="text-muted-foreground">Systems</div><div className="mt-1 flex items-center gap-1 font-semibold"><Layers3 className="h-3.5 w-3.5" /> {deckBrain?.styleSystems.length || 0}</div></div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={cn('rounded-full border px-3 py-1 text-xs font-semibold transition', category === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onToolSelect?.(tool.id)}
            className={cn('rounded-2xl border p-3 text-left transition hover:bg-secondary', selectedToolId === tool.id ? 'border-primary bg-primary/5' : 'border-border bg-background')}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-semibold text-sm">{tool.label}</div>
              {tool.requiresBrandBrain && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Brand Brain</span>}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
          </button>
        ))}
      </div>

      {report && report.issues.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-primary" /> QA quick hits</div>
          <div className="space-y-2 text-xs text-muted-foreground">
            {report.issues.slice(0, 4).map((issue, index) => (
              <div key={`${issue.category}-${index}`}>
                <span className="font-semibold text-foreground">{issue.category}:</span> {issue.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
