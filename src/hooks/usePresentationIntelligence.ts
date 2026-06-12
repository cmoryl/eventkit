import { useCallback, useMemo, useState } from 'react';
import type { SlideData } from '@/components/slides/slideTypes';
import type { GammaCreationMode, GammaDeckStyle } from '@/services/gammaPresentationResearchService';
import type { PresentationEventRecord, PresentationEventType } from '@/services/presentationEventHistoryService';
import type { PresentationTemplateSlotSet } from '@/services/presentationTemplateSlotService';
import { buildPresentationStudioIntelligenceState } from '@/services/presentationStudioIntelligenceOrchestrator';
import { loadPresentationEvents, savePresentationEvent, savePresentationIntelligenceSnapshot } from '@/services/presentationIntelligenceCloudService';

export interface UsePresentationIntelligenceOptions {
  userId?: string;
  artifactId: string;
  slides: SlideData[];
  creationMode: GammaCreationMode;
  deckStyle: GammaDeckStyle;
  hasSourceMaterial?: boolean;
  hasBrandProfile?: boolean;
  hasExactLogoSource?: boolean;
  templateSlotSet?: PresentationTemplateSlotSet;
  templateSlotValues?: Record<string, unknown>;
  humanApproved?: boolean;
}

export const usePresentationIntelligence = (options: UsePresentationIntelligenceOptions) => {
  const [events, setEvents] = useState<PresentationEventRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  const state = useMemo(() => buildPresentationStudioIntelligenceState({
    slides: options.slides,
    creationMode: options.creationMode,
    deckStyle: options.deckStyle,
    events,
    hasSourceMaterial: options.hasSourceMaterial,
    hasBrandProfile: options.hasBrandProfile,
    hasExactLogoSource: options.hasExactLogoSource,
    templateSlotSet: options.templateSlotSet,
    templateSlotValues: options.templateSlotValues,
    humanApproved: options.humanApproved,
  }), [options, events]);

  const refreshEvents = useCallback(async () => {
    if (!options.userId) return [];
    setIsLoadingEvents(true);
    try {
      const loaded = await loadPresentationEvents({ userId: options.userId, artifactId: options.artifactId });
      setEvents(loaded);
      return loaded;
    } finally {
      setIsLoadingEvents(false);
    }
  }, [options.userId, options.artifactId]);

  const recordEvent = useCallback(async (input: {
    eventType: PresentationEventType;
    actorRole?: 'user' | 'agent' | 'system';
    actorName?: string;
    summary: string;
    metadata?: Record<string, unknown>;
  }) => {
    if (!options.userId) return null;
    setIsSaving(true);
    try {
      const saved = await savePresentationEvent({
        userId: options.userId,
        artifactId: options.artifactId,
        ...input,
      });
      if (saved) setEvents((prev) => [...prev, saved]);
      return saved;
    } finally {
      setIsSaving(false);
    }
  }, [options.userId, options.artifactId]);

  const saveSnapshot = useCallback(async () => {
    if (!options.userId) return null;
    setIsSaving(true);
    try {
      return await savePresentationIntelligenceSnapshot({
        userId: options.userId,
        artifactId: options.artifactId,
        slides: options.slides,
        creationMode: options.creationMode,
        deckStyle: options.deckStyle,
        events,
        hasSourceMaterial: options.hasSourceMaterial,
        hasBrandProfile: options.hasBrandProfile,
        hasExactLogoSource: options.hasExactLogoSource,
        templateSlotSet: options.templateSlotSet,
        templateSlotValues: options.templateSlotValues,
        humanApproved: options.humanApproved,
      });
    } finally {
      setIsSaving(false);
    }
  }, [options, events]);

  return {
    state,
    events,
    isSaving,
    isLoadingEvents,
    refreshEvents,
    recordEvent,
    saveSnapshot,
  };
};
