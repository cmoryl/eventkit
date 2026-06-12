export type PresentationEventType =
  | 'artifact_created'
  | 'source_attached'
  | 'brand_applied'
  | 'template_selected'
  | 'template_slots_validated'
  | 'outline_generated'
  | 'deck_built'
  | 'slide_edited'
  | 'export_fidelity_checked'
  | 'human_reviewed'
  | 'export_created';

export interface PresentationEventActor {
  id?: string;
  name?: string;
  role?: 'user' | 'agent' | 'system';
}

export interface PresentationEventRecord {
  id: string;
  artifactId: string;
  eventType: PresentationEventType;
  createdAt: string;
  actor: PresentationEventActor;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface PresentationEventHistorySummary {
  totalEvents: number;
  humanActions: number;
  agentActions: number;
  systemActions: number;
  sourceAttached: boolean;
  brandApplied: boolean;
  templateValidated: boolean;
  exportChecked: boolean;
  humanReviewed: boolean;
}

export const createPresentationEvent = (input: Omit<PresentationEventRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): PresentationEventRecord => ({
  id: input.id || crypto.randomUUID(),
  createdAt: input.createdAt || new Date().toISOString(),
  artifactId: input.artifactId,
  eventType: input.eventType,
  actor: input.actor,
  summary: input.summary,
  metadata: input.metadata,
});

export const summarizePresentationEventHistory = (events: PresentationEventRecord[]): PresentationEventHistorySummary => ({
  totalEvents: events.length,
  humanActions: events.filter((event) => event.actor.role === 'user').length,
  agentActions: events.filter((event) => event.actor.role === 'agent').length,
  systemActions: events.filter((event) => event.actor.role === 'system').length,
  sourceAttached: events.some((event) => event.eventType === 'source_attached'),
  brandApplied: events.some((event) => event.eventType === 'brand_applied'),
  templateValidated: events.some((event) => event.eventType === 'template_slots_validated'),
  exportChecked: events.some((event) => event.eventType === 'export_fidelity_checked'),
  humanReviewed: events.some((event) => event.eventType === 'human_reviewed'),
});

export const buildPresentationEventHistoryPromptBlock = (events: PresentationEventRecord[]) => {
  const summary = summarizePresentationEventHistory(events);
  return [
    'PRESENTATION EVENT HISTORY',
    `Total events: ${summary.totalEvents}`,
    `Human actions: ${summary.humanActions}`,
    `Agent actions: ${summary.agentActions}`,
    `System actions: ${summary.systemActions}`,
    `Source attached: ${summary.sourceAttached ? 'yes' : 'no'}`,
    `Brand applied: ${summary.brandApplied ? 'yes' : 'no'}`,
    `Template validated: ${summary.templateValidated ? 'yes' : 'no'}`,
    `Export checked: ${summary.exportChecked ? 'yes' : 'no'}`,
    `Human reviewed: ${summary.humanReviewed ? 'yes' : 'no'}`,
    'Recent events:',
    ...events.slice(-8).map((event) => `- ${event.createdAt} [${event.actor.role || 'system'}] ${event.eventType}: ${event.summary}`),
  ].join('\n');
};
