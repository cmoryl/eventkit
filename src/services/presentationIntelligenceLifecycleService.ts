import type { ExportFidelityReport } from './presentationExportFidelityService';
import type { PresentationAgentQALoopReport } from './presentationAgentQALoopService';
import { savePresentationEvent, savePresentationIntelligenceSnapshot } from './presentationIntelligenceCloudService';
import type { PresentationStudioIntelligenceInput } from './presentationStudioIntelligenceOrchestrator';

export interface PresentationLifecycleContext {
  userId?: string;
  artifactId: string;
  actorName?: string;
}

const canPersist = (context: PresentationLifecycleContext) => Boolean(context.userId && context.artifactId);

export const recordPresentationArtifactCreated = async (context: PresentationLifecycleContext, title: string) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'artifact_created',
    actorRole: 'user',
    actorName: context.actorName,
    summary: `Created presentation artifact: ${title}`,
    metadata: { title },
  });
};

export const recordPresentationSourceAttached = async (context: PresentationLifecycleContext, source: { kind: string; name?: string; influence?: number }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'source_attached',
    actorRole: 'user',
    actorName: context.actorName,
    summary: `Attached ${source.kind} source${source.name ? `: ${source.name}` : ''}`,
    metadata: source,
  });
};

export const recordPresentationBrandApplied = async (context: PresentationLifecycleContext, brand: { id?: string; name?: string; hasExactLogo?: boolean }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'brand_applied',
    actorRole: 'system',
    actorName: 'Presentation Studio',
    summary: `Applied brand${brand.name ? `: ${brand.name}` : ''}`,
    metadata: brand,
  });
};

export const recordPresentationTemplateSelected = async (context: PresentationLifecycleContext, template: { id?: string; name?: string }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'template_selected',
    actorRole: 'user',
    actorName: context.actorName,
    summary: `Selected template${template.name ? `: ${template.name}` : ''}`,
    metadata: template,
  });
};

export const recordPresentationTemplateSlotsValidated = async (context: PresentationLifecycleContext, result: { errors: number; warnings: number }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'template_slots_validated',
    actorRole: 'system',
    actorName: 'Presentation Studio',
    summary: `Template slots validated with ${result.errors} errors and ${result.warnings} warnings`,
    metadata: result,
  });
};

export const recordPresentationOutlineGenerated = async (context: PresentationLifecycleContext, outline: { title?: string; slideCount?: number }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'outline_generated',
    actorRole: 'agent',
    actorName: 'PowerPoint Agent',
    summary: `Generated outline${outline.title ? `: ${outline.title}` : ''}`,
    metadata: outline,
  });
};

export const recordPresentationDeckBuilt = async (context: PresentationLifecycleContext, deck: { title?: string; slideCount?: number; filename?: string }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'deck_built',
    actorRole: 'agent',
    actorName: 'PowerPoint Agent',
    summary: `Built deck${deck.title ? `: ${deck.title}` : ''}`,
    metadata: deck,
  });
};

export const recordPresentationSlideEdited = async (context: PresentationLifecycleContext, slide: { id?: string; title?: string; changeType?: string }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'slide_edited',
    actorRole: 'user',
    actorName: context.actorName,
    summary: `Edited slide${slide.title ? `: ${slide.title}` : ''}`,
    metadata: slide,
  });
};

export const recordPresentationExportChecked = async (context: PresentationLifecycleContext, report: ExportFidelityReport) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'export_fidelity_checked',
    actorRole: 'system',
    actorName: 'Presentation Studio',
    summary: `Export fidelity checked: ${report.score}/100`,
    metadata: report as unknown as Record<string, unknown>,
  });
};

export const recordPresentationHumanReviewed = async (context: PresentationLifecycleContext, approved: boolean, notes?: string) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'human_reviewed',
    actorRole: 'user',
    actorName: context.actorName,
    summary: approved ? 'Human review approved' : 'Human review requested changes',
    metadata: { approved, notes },
  });
};

export const recordPresentationExportCreated = async (context: PresentationLifecycleContext, exportInfo: { format: string; filename?: string }) => {
  if (!canPersist(context)) return null;
  return savePresentationEvent({
    userId: context.userId!,
    artifactId: context.artifactId,
    eventType: 'export_created',
    actorRole: 'system',
    actorName: 'Presentation Studio',
    summary: `Created ${exportInfo.format} export${exportInfo.filename ? `: ${exportInfo.filename}` : ''}`,
    metadata: exportInfo,
  });
};

export const savePresentationLifecycleSnapshot = async (context: PresentationLifecycleContext, input: PresentationStudioIntelligenceInput) => {
  if (!canPersist(context)) return null;
  return savePresentationIntelligenceSnapshot({
    userId: context.userId!,
    artifactId: context.artifactId,
    ...input,
  });
};
