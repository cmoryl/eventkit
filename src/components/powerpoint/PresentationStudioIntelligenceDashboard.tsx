import React from 'react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import type { PresentationEventRecord } from '@/services/presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import { AgentQALoopPanel } from './AgentQALoopPanel';
import { ExportFidelityPanel } from './ExportFidelityPanel';
import { GammaInspiredStudioPanel } from './GammaInspiredStudioPanel';
import { PresentationCompetitiveEdgePanel } from './PresentationCompetitiveEdgePanel';
import { PresentationEventHistoryPanel } from './PresentationEventHistoryPanel';

export interface PresentationStudioIntelligenceDashboardProps {
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
}

export const PresentationStudioIntelligenceDashboard: React.FC<PresentationStudioIntelligenceDashboardProps> = ({
  slides,
  creationMode,
  deckStyle,
  events = [],
  hasSourceMaterial,
  hasBrandProfile,
  hasExactLogoSource,
  templateSlotSet,
  templateSlotValues,
  humanApproved,
}) => (
  <div className="space-y-5">
    <PresentationCompetitiveEdgePanel />
    <GammaInspiredStudioPanel />
    <div className="grid gap-5 xl:grid-cols-2">
      <AgentQALoopPanel
        slides={slides}
        creationMode={creationMode}
        deckStyle={deckStyle}
        hasSourceMaterial={hasSourceMaterial}
        hasBrandProfile={hasBrandProfile}
        hasExactLogoSource={hasExactLogoSource}
        templateSlotSet={templateSlotSet}
        templateSlotValues={templateSlotValues}
        humanApproved={humanApproved}
      />
      <ExportFidelityPanel slides={slides} />
    </div>
    <PresentationEventHistoryPanel events={events} />
  </div>
);
