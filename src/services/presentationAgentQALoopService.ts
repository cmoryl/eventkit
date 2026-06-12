import type { SlideData } from '@/components/slides/slideTypes';
import { auditPresentationExportFidelity } from './presentationExportFidelityService';
import type { PresentationTemplateSlotSet, TemplateSlotValidationIssue } from './presentationTemplateSlotService';
import { validateTemplateSlotValues } from './presentationTemplateSlotService';
import type { GammaCreationMode, GammaDeckStyle } from './gammaPresentationResearchService';

export type AgentQAGateStatus = 'pass' | 'warning' | 'fail';
export type AgentQAGateId = 'source' | 'brand' | 'template_slots' | 'export_fidelity' | 'human_review';

export interface AgentQAGate {
  id: AgentQAGateId;
  label: string;
  status: AgentQAGateStatus;
  message: string;
  fixes: string[];
}

export interface PresentationAgentQALoopInput {
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

export interface PresentationAgentQALoopReport {
  status: AgentQAGateStatus;
  score: number;
  gates: AgentQAGate[];
  summary: {
    creationMode: GammaCreationMode;
    deckStyle: GammaDeckStyle;
    slides: number;
    failures: number;
    warnings: number;
  };
}

const worstStatus = (gates: AgentQAGate[]): AgentQAGateStatus => {
  if (gates.some((gate) => gate.status === 'fail')) return 'fail';
  if (gates.some((gate) => gate.status === 'warning')) return 'warning';
  return 'pass';
};

const templateSlotGate = (issues: TemplateSlotValidationIssue[]): AgentQAGate => {
  const failures = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  if (failures.length) {
    return {
      id: 'template_slots',
      label: 'Template slots',
      status: 'fail',
      message: `${failures.length} required template slot issue${failures.length === 1 ? '' : 's'} found.`,
      fixes: failures.concat(warnings).map((issue) => issue.message),
    };
  }
  if (warnings.length) {
    return {
      id: 'template_slots',
      label: 'Template slots',
      status: 'warning',
      message: `${warnings.length} template slot warning${warnings.length === 1 ? '' : 's'} found.`,
      fixes: warnings.map((issue) => issue.message),
    };
  }
  return {
    id: 'template_slots',
    label: 'Template slots',
    status: 'pass',
    message: 'Template slot validation passed.',
    fixes: [],
  };
};

export const runPresentationAgentQALoop = (input: PresentationAgentQALoopInput): PresentationAgentQALoopReport => {
  const exportReport = auditPresentationExportFidelity(input.slides);
  const templateIssues = input.templateSlotSet
    ? validateTemplateSlotValues(input.templateSlotSet, input.templateSlotValues || {})
    : [];

  const gates: AgentQAGate[] = [
    {
      id: 'source',
      label: 'Source awareness',
      status: input.creationMode === 'import' && !input.hasSourceMaterial ? 'warning' : 'pass',
      message: input.hasSourceMaterial ? 'Source material is attached to the workflow.' : 'No source material attached.',
      fixes: input.creationMode === 'import' && !input.hasSourceMaterial ? ['Attach source material or switch creation mode away from import.'] : [],
    },
    {
      id: 'brand',
      label: 'Brand governance',
      status: !input.hasBrandProfile ? 'fail' : !input.hasExactLogoSource ? 'warning' : 'pass',
      message: !input.hasBrandProfile
        ? 'No brand profile is attached.'
        : input.hasExactLogoSource
          ? 'Brand profile and exact logo source are available.'
          : 'Brand profile is available but no exact source logo is attached.',
      fixes: !input.hasBrandProfile
        ? ['Attach a Brand Brain profile before final generation.']
        : !input.hasExactLogoSource
          ? ['Attach exact source logo assets or reserve logo-free layout zones.']
          : [],
    },
    templateSlotGate(templateIssues),
    {
      id: 'export_fidelity',
      label: 'Export fidelity',
      status: exportReport.status,
      message: `Export fidelity score is ${exportReport.score}/100.`,
      fixes: exportReport.issues.map((issue) => issue.recommendation),
    },
    {
      id: 'human_review',
      label: 'Human approval',
      status: input.humanApproved ? 'pass' : 'warning',
      message: input.humanApproved ? 'Human review approved.' : 'Human review has not been completed.',
      fixes: input.humanApproved ? [] : ['Require review before final export or external delivery.'],
    },
  ];

  const failures = gates.filter((gate) => gate.status === 'fail').length;
  const warnings = gates.filter((gate) => gate.status === 'warning').length;
  const score = Math.max(0, 100 - failures * 25 - warnings * 8);

  return {
    status: worstStatus(gates),
    score,
    gates,
    summary: {
      creationMode: input.creationMode,
      deckStyle: input.deckStyle,
      slides: input.slides.length,
      failures,
      warnings,
    },
  };
};
