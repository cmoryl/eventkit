import { supabase } from '@/integrations/supabase/client';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';
import type { PresentationEventRecord, PresentationEventType } from './presentationEventHistoryService';
import { createPresentationEvent } from './presentationEventHistoryService';
import type { PresentationStudioIntelligenceInput } from './presentationStudioIntelligenceOrchestrator';
import { buildPresentationStudioIntelligenceState } from './presentationStudioIntelligenceOrchestrator';

export const savePresentationEvent = async (input: {
  userId: string;
  artifactId: string;
  eventType: PresentationEventType;
  actorRole?: 'user' | 'agent' | 'system';
  actorName?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<PresentationEventRecord | null> => {
  const event = createPresentationEvent({
    artifactId: input.artifactId,
    eventType: input.eventType,
    actor: { id: input.userId, role: input.actorRole || 'system', name: input.actorName },
    summary: input.summary,
    metadata: input.metadata,
  });

  const { error } = await supabase.from('presentation_events').insert({
    id: event.id,
    user_id: input.userId,
    artifact_id: event.artifactId,
    event_type: event.eventType,
    actor_role: event.actor.role || 'system',
    actor_name: event.actor.name || null,
    summary: event.summary,
    metadata: event.metadata || {},
    created_at: event.createdAt,
  } as never);

  if (error) {
    console.warn('Could not save presentation event:', error);
    return null;
  }

  return event;
};

export const loadPresentationEvents = async (input: { userId: string; artifactId: string; limit?: number }): Promise<PresentationEventRecord[]> => {
  const { data, error } = await supabase
    .from('presentation_events')
    .select('*')
    .eq('user_id', input.userId)
    .eq('artifact_id', input.artifactId)
    .order('created_at', { ascending: false })
    .limit(input.limit || 50);

  if (error) {
    console.warn('Could not load presentation events:', error);
    return [];
  }

  return (data || []).reverse().map((row: any) => ({
    id: row.id,
    artifactId: row.artifact_id,
    eventType: row.event_type,
    createdAt: row.created_at,
    actor: { id: input.userId, role: row.actor_role, name: row.actor_name },
    summary: row.summary,
    metadata: row.metadata || {},
  }));
};

export const savePresentationIntelligenceSnapshot = async (input: PresentationStudioIntelligenceInput & {
  userId: string;
  artifactId: string;
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
}) => {
  const state = buildPresentationStudioIntelligenceState(input);

  const { error } = await supabase.from('presentation_intelligence_snapshots').insert({
    user_id: input.userId,
    artifact_id: input.artifactId,
    status: state.status,
    score: state.score,
    creation_mode: input.creationMode,
    deck_style: input.deckStyle,
    slide_count: input.slides.length,
    agent_qa: state.agentQA,
    export_fidelity: state.exportFidelity,
    event_summary: state.eventHistory,
    metadata: {
      hasSourceMaterial: input.hasSourceMaterial,
      hasBrandProfile: input.hasBrandProfile,
      hasExactLogoSource: input.hasExactLogoSource,
      humanApproved: input.humanApproved,
    },
  } as never);

  if (error) {
    console.warn('Could not save presentation intelligence snapshot:', error);
    return null;
  }

  return state;
};
