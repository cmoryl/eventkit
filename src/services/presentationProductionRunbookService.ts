import type { SlideData } from '@/components/slides/slideTypes';
import type { PresentationEventRecord } from './presentationEventHistoryService';
import type { PresentationExportReadinessDecision } from './presentationExportReadinessService';
import type { PresentationAgentQALoopStatus } from './presentationAgentQALoopService';

export type PresentationRunbookPhaseId =
  | 'intake'
  | 'brand_lock'
  | 'structure'
  | 'generation'
  | 'live_edit'
  | 'qa'
  | 'export'
  | 'reuse';

export type PresentationRunbookPhaseStatus = 'complete' | 'active' | 'blocked' | 'upcoming';

export interface PresentationRunbookInput {
  slides: SlideData[];
  events?: PresentationEventRecord[];
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  qaStatus?: PresentationAgentQALoopStatus;
  exportDecision?: PresentationExportReadinessDecision;
  humanApproved?: boolean;
}

export interface PresentationRunbookPhase {
  id: PresentationRunbookPhaseId;
  label: string;
  status: PresentationRunbookPhaseStatus;
  action: string;
  successCriteria: string[];
  blockers: string[];
}

const hasEvent = (events: PresentationEventRecord[] = [], type: PresentationEventRecord['eventType']) => events.some((event) => event.eventType === type);

export const buildPresentationProductionRunbook = (input: PresentationRunbookInput): PresentationRunbookPhase[] => {
  const events = input.events || [];
  const hasSlides = input.slides.length > 0;
  const sourceComplete = Boolean(input.hasSourceMaterial || hasEvent(events, 'source_attached'));
  const brandComplete = Boolean(input.hasBrandProfile && input.hasExactLogoSource);
  const structureComplete = hasEvent(events, 'template_slots_validated') || hasEvent(events, 'outline_generated');
  const deckBuilt = hasSlides || hasEvent(events, 'deck_built');
  const edited = hasEvent(events, 'slide_edited');
  const qaComplete = input.qaStatus === 'pass' || hasEvent(events, 'human_reviewed');
  const exportReady = input.exportDecision === 'ready' || input.exportDecision === 'ready_with_notes';
  const saved = hasEvent(events, 'export_created');

  return [
    {
      id: 'intake',
      label: 'Intake',
      status: sourceComplete ? 'complete' : 'active',
      action: 'Attach or paste source material, define goal, and select creation path.',
      successCriteria: ['Source summarized', 'Goal captured', 'Deck style selected'],
      blockers: sourceComplete ? [] : ['Missing source or goal context'],
    },
    {
      id: 'brand_lock',
      label: 'Brand Lock',
      status: brandComplete ? 'complete' : sourceComplete ? 'active' : 'blocked',
      action: 'Apply Brand Brain, exact logo source, typography, colors, and prompt overrides.',
      successCriteria: ['Brand profile loaded', 'Exact logo source available', 'No AI-redrawn logos'],
      blockers: brandComplete ? [] : ['Brand profile or exact logo source missing'],
    },
    {
      id: 'structure',
      label: 'Structure',
      status: structureComplete ? 'complete' : brandComplete ? 'active' : 'blocked',
      action: 'Choose Smart Blocks, template slots, narrative arc, and deterministic deck recipe.',
      successCriteria: ['Smart Blocks selected', 'Recipe generated', 'Template slots validated'],
      blockers: structureComplete ? [] : ['Deck recipe or template slots not validated'],
    },
    {
      id: 'generation',
      label: 'Generation',
      status: deckBuilt ? 'complete' : structureComplete ? 'active' : 'blocked',
      action: 'Generate the first deck from the intelligence payload and recipe.',
      successCriteria: ['Slides generated', 'Editable regions preserved', 'Speaker notes drafted'],
      blockers: deckBuilt ? [] : ['No generated slides yet'],
    },
    {
      id: 'live_edit',
      label: 'Live Edit',
      status: edited ? 'complete' : deckBuilt ? 'active' : 'blocked',
      action: 'Use live controls for text, layout, imagery, data, motion, and brand repairs.',
      successCriteria: ['Slide edits recorded', 'Important elements remain editable', 'No layout collisions'],
      blockers: edited ? [] : ['No slide edits recorded yet'],
    },
    {
      id: 'qa',
      label: 'QA',
      status: qaComplete ? 'complete' : deckBuilt ? 'active' : 'blocked',
      action: 'Run Agent QA gates for source, brand, template, export fidelity, and human review.',
      successCriteria: ['QA score reviewed', 'Critical issues fixed', 'Human review noted when needed'],
      blockers: qaComplete ? [] : ['QA not fully passed or reviewed'],
    },
    {
      id: 'export',
      label: 'Export',
      status: exportReady ? 'complete' : qaComplete ? 'active' : 'blocked',
      action: 'Check export readiness and create editable PPTX/PDF handoff.',
      successCriteria: ['Export readiness approved', 'PPTX remains editable', 'PDF handoff available when needed'],
      blockers: exportReady ? [] : ['Export readiness not approved'],
    },
    {
      id: 'reuse',
      label: 'Reuse',
      status: saved ? 'complete' : exportReady ? 'active' : 'blocked',
      action: 'Save the intelligence snapshot, event history, and reusable system assets.',
      successCriteria: ['Snapshot saved', 'Event history complete', 'Deck system reusable'],
      blockers: saved ? [] : ['Final export or snapshot not saved'],
    },
  ];
};

export const getActiveRunbookPhase = (phases: PresentationRunbookPhase[]) => phases.find((phase) => phase.status === 'active') || phases.find((phase) => phase.status === 'blocked') || phases[phases.length - 1];
