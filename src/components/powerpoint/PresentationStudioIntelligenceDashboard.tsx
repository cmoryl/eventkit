import React, { useMemo } from 'react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import type { PresentationEventRecord } from '@/services/presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import { buildPresentationStudioIntelligenceState } from '@/services/presentationStudioIntelligenceOrchestrator';
import { evaluatePresentationExportReadiness } from '@/services/presentationExportReadinessService';
import { AgentQALoopPanel } from './AgentQALoopPanel';
import { ExportFidelityPanel } from './ExportFidelityPanel';
import { GammaInspiredStudioPanel } from './GammaInspiredStudioPanel';
import { PresentationCompetitiveEdgePanel } from './PresentationCompetitiveEdgePanel';
import { PresentationEventHistoryPanel } from './PresentationEventHistoryPanel';
import { PresentationStudioIntelligenceStatus } from './PresentationStudioIntelligenceStatus';
import { PresentationExportReadinessPanel } from './PresentationExportReadinessPanel';
import { PresentationUserFlowPanel } from './PresentationUserFlowPanel';
import { PresentationFunctionPanel } from './PresentationFunctionPanel';
import { PresentationSmartBlockPanel } from './PresentationSmartBlockPanel';
import { PresentationDeckRecipePanel } from './PresentationDeckRecipePanel';
import { PresentationNarrativePanel } from './PresentationNarrativePanel';
import { PresentationAudiencePanel } from './PresentationAudiencePanel';
import { PresentationAutopilotPanel } from './PresentationAutopilotPanel';
import { PresentationCommandRouterPanel } from './PresentationCommandRouterPanel';
import { PresentationFixPlanPanel } from './PresentationFixPlanPanel';
import { PresentationStudioInterfaceShell } from './PresentationStudioInterfaceShell';
import { PresentationStudioQuickActions } from './PresentationStudioQuickActions';
import { PresentationProductionRunbookPanel } from './PresentationProductionRunbookPanel';
import { PresentationEditorUXPanel } from './PresentationEditorUXPanel';
import { PresentationEditorActionAuditPanel } from './PresentationEditorActionAuditPanel';
import { PresentationEditorUserFlowMatrixPanel } from './PresentationEditorUserFlowMatrixPanel';
import { PresentationAssetSuggestionPanel } from './PresentationAssetSuggestionPanel';
import { PresentationAssetDropZonePanel } from './PresentationAssetDropZonePanel';
import { PresentationAssetReadinessPanel } from './composer/PresentationAssetReadinessPanel';
import { PresentationAssetValidationPanel } from './composer/PresentationAssetValidationPanel';
import { PresentationAssetVariantsPanel } from './composer/PresentationAssetVariantsPanel';
import { PresentationExtendedSystemAssetsPanel } from './composer/PresentationExtendedSystemAssetsPanel';
import { PrebuiltPresentationObjectsPanel } from './composer/PrebuiltPresentationObjectsPanel';
import { PrebuiltDataVizStylesPanel } from './composer/PrebuiltDataVizStylesPanel';
import { AdvancedDataStoryBlocksPanel } from './composer/AdvancedDataStoryBlocksPanel';

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
}) => {
  const state = useMemo(() => buildPresentationStudioIntelligenceState({
    slides,
    creationMode,
    deckStyle,
    events,
    hasSourceMaterial,
    hasBrandProfile,
    hasExactLogoSource,
    templateSlotSet,
    templateSlotValues,
    humanApproved,
  }), [slides, creationMode, deckStyle, events, hasSourceMaterial, hasBrandProfile, hasExactLogoSource, templateSlotSet, templateSlotValues, humanApproved]);
  const exportReadiness = useMemo(() => evaluatePresentationExportReadiness({ exportFidelity: state.exportFidelity, agentQA: state.agentQA, allowReviewedProceed: humanApproved }), [state.exportFidelity, state.agentQA, humanApproved]);

  return (
    <PresentationStudioInterfaceShell readinessScore={state.score} activeStage="Editor">
      <PresentationStudioQuickActions />
      <PresentationStudioIntelligenceStatus
        slides={slides}
        creationMode={creationMode}
        deckStyle={deckStyle}
        events={events}
        hasSourceMaterial={hasSourceMaterial}
        hasBrandProfile={hasBrandProfile}
        hasExactLogoSource={hasExactLogoSource}
        templateSlotSet={templateSlotSet}
        templateSlotValues={templateSlotValues}
        humanApproved={humanApproved}
      />
      <PresentationAutopilotPanel
        creationMode={creationMode}
        deckStyle={deckStyle}
        slides={slides}
        events={events}
        hasSourceMaterial={hasSourceMaterial}
        hasBrandProfile={hasBrandProfile}
        hasExactLogoSource={hasExactLogoSource}
        templateSlotSet={templateSlotSet}
        templateSlotValues={templateSlotValues}
        humanApproved={humanApproved}
      />
      <PresentationProductionRunbookPanel
        slides={slides}
        events={events}
        hasSourceMaterial={hasSourceMaterial}
        hasBrandProfile={hasBrandProfile}
        hasExactLogoSource={hasExactLogoSource}
        qaStatus={state.agentQA.status}
        exportDecision={exportReadiness.decision}
        humanApproved={humanApproved}
      />
      <PresentationEditorUXPanel
        slides={slides}
        readinessScore={state.score}
        hasBrand={Boolean(hasBrandProfile && hasExactLogoSource)}
        exportReady={exportReadiness.canProceed}
      />
      <PresentationEditorActionAuditPanel />
      <PresentationEditorUserFlowMatrixPanel />
      <PresentationCommandRouterPanel />
      <PresentationUserFlowPanel
        creationMode={creationMode}
        deckStyle={deckStyle}
        hasSourceMaterial={hasSourceMaterial}
        hasBrandProfile={hasBrandProfile}
        hasExactLogoSource={hasExactLogoSource}
        hasTemplate={Boolean(templateSlotSet)}
        hasOutline={slides.length > 0}
        hasDeck={slides.length > 0}
        hasEdits={events.some((event) => event.eventType === 'slide_edited')}
        qaStatus={state.agentQA.status}
        exportDecision={exportReadiness.decision}
        hasSavedSnapshot={events.some((event) => event.eventType === 'export_created')}
      />
      <PresentationFunctionPanel />
      <PresentationAudiencePanel />
      <PresentationNarrativePanel />
      <PresentationSmartBlockPanel />
      <PresentationAssetSuggestionPanel />
      <PresentationAssetDropZonePanel />
      <PresentationAssetReadinessPanel />
      <PresentationAssetValidationPanel />
      <PresentationAssetVariantsPanel />
      <PresentationExtendedSystemAssetsPanel />
      <PrebuiltPresentationObjectsPanel />
      <PrebuiltDataVizStylesPanel />
      <AdvancedDataStoryBlocksPanel />
      <PresentationDeckRecipePanel title="Studio deck recipe" goal="Create an editable, brand-safe, export-ready presentation system." />
      <PresentationExportReadinessPanel exportFidelity={state.exportFidelity} agentQA={state.agentQA} allowReviewedProceed={humanApproved} />
      <PresentationFixPlanPanel />
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
    </PresentationStudioInterfaceShell>
  );
};
