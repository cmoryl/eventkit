import React, { useMemo, useState } from 'react';
import { UsersRound } from 'lucide-react';
import {
  buildAudienceAdaptation,
  type PresentationAudienceProfile,
  type PresentationAudienceType,
} from '@/services/presentationAudienceAdapterService';
import { cn } from '@/lib/utils';

const audiences: Array<{ id: PresentationAudienceType; label: string }> = [
  { id: 'executive', label: 'Executive' },
  { id: 'sales', label: 'Sales' },
  { id: 'technical', label: 'Technical' },
  { id: 'training', label: 'Training' },
  { id: 'customer', label: 'Customer' },
  { id: 'investor', label: 'Investor' },
  { id: 'internal_team', label: 'Internal' },
];

export const PresentationAudiencePanel: React.FC<{ className?: string }> = ({ className }) => {
  const [audienceType, setAudienceType] = useState<PresentationAudienceType>('executive');
  const profile: PresentationAudienceProfile = {
    audienceType,
    readingDepth: audienceType === 'technical' ? 'deep' : audienceType === 'executive' ? 'skim' : 'balanced',
    proofPreference: audienceType === 'sales' ? 'case_studies' : audienceType === 'technical' ? 'process' : 'mixed',
    tone: audienceType === 'technical' ? 'technical' : audienceType === 'training' ? 'instructional' : 'consultative',
  };
  const adaptation = useMemo(() => buildAudienceAdaptation(profile), [audienceType]);

  return (
    <section className={cn('rounded-3xl border border-border bg-card p-5 shadow-sm', className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-primary"><UsersRound className="h-4 w-4" /> Audience Adapter</div>
          <h3 className="mt-1 text-xl font-black tracking-tight">Audience-aware deck behavior</h3>
          <p className="mt-1 text-sm text-muted-foreground">Change the audience and the studio adjusts headline, density, proof, visual, and speaker-note rules.</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {audiences.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setAudienceType(item.id)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', audienceType === item.id ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:bg-secondary')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['Headline', adaptation.headlineRule],
          ['Density', adaptation.contentDensityRule],
          ['Proof', adaptation.proofRule],
          ['Visual', adaptation.visualRule],
          ['Speaker Notes', adaptation.speakerNotesRule],
          ['Emphasis', adaptation.recommendedSlideEmphasis.join(', ')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-border bg-background p-4 text-xs">
            <div className="font-black text-foreground">{label}</div>
            <p className="mt-1 text-muted-foreground">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
