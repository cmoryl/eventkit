export type TemplateSlotKind =
  | 'title'
  | 'subtitle'
  | 'body'
  | 'kpi'
  | 'chart'
  | 'image'
  | 'logo'
  | 'quote'
  | 'timeline'
  | 'process'
  | 'cta'
  | 'footnote';

export interface PresentationTemplateSlot {
  id: string;
  name: string;
  kind: TemplateSlotKind;
  required: boolean;
  description?: string;
  fallback?: string;
  maxLength?: number;
}

export interface PresentationTemplateSlotSet {
  templateId: string;
  templateName: string;
  slots: PresentationTemplateSlot[];
}

export interface TemplateSlotValidationIssue {
  slotId: string;
  severity: 'warning' | 'error';
  message: string;
}

export const defaultPresentationTemplateSlots: PresentationTemplateSlot[] = [
  { id: 'hero_title', name: 'Hero title', kind: 'title', required: true, maxLength: 80, description: 'Primary title or big idea for the deck.' },
  { id: 'hero_subtitle', name: 'Hero subtitle', kind: 'subtitle', required: false, maxLength: 160, description: 'Supporting promise or audience framing.' },
  { id: 'story_problem', name: 'Problem statement', kind: 'body', required: true, maxLength: 360, description: 'The core problem, tension, or opportunity.' },
  { id: 'proof_metric_1', name: 'Proof metric 1', kind: 'kpi', required: false, description: 'Primary measurable proof point.' },
  { id: 'proof_metric_2', name: 'Proof metric 2', kind: 'kpi', required: false, description: 'Secondary measurable proof point.' },
  { id: 'hero_image', name: 'Hero image', kind: 'image', required: false, description: 'Main visual or accent media.' },
  { id: 'brand_logo', name: 'Brand logo', kind: 'logo', required: false, description: 'Exact source logo only; never model-generated.' },
  { id: 'timeline_items', name: 'Timeline items', kind: 'timeline', required: false, description: 'Milestones, dates, phases, or roadmap items.' },
  { id: 'cta', name: 'Call to action', kind: 'cta', required: true, fallback: 'Next steps', maxLength: 120, description: 'Closing action or decision ask.' },
];

export const createTemplateSlotSet = (templateId: string, templateName: string, slots = defaultPresentationTemplateSlots): PresentationTemplateSlotSet => ({
  templateId,
  templateName,
  slots,
});

export const validateTemplateSlotValues = (
  slotSet: PresentationTemplateSlotSet,
  values: Record<string, unknown>,
): TemplateSlotValidationIssue[] => {
  const issues: TemplateSlotValidationIssue[] = [];

  slotSet.slots.forEach((slot) => {
    const rawValue = values[slot.id];
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue;

    if (slot.required && (value === undefined || value === null || value === '')) {
      issues.push({ slotId: slot.id, severity: 'error', message: `${slot.name} is required.` });
    }

    if (typeof value === 'string' && slot.maxLength && value.length > slot.maxLength) {
      issues.push({ slotId: slot.id, severity: 'warning', message: `${slot.name} is longer than ${slot.maxLength} characters.` });
    }

    if (slot.kind === 'logo' && typeof value === 'string' && value.toLowerCase().includes('generate')) {
      issues.push({ slotId: slot.id, severity: 'error', message: 'Logo slots must use exact source assets, not generated logo prompts.' });
    }
  });

  return issues;
};

export const buildTemplateSlotPromptBlock = (slotSet: PresentationTemplateSlotSet) => [
  'DETERMINISTIC TEMPLATE SLOT MODEL',
  `Template: ${slotSet.templateName} (${slotSet.templateId})`,
  'Use named slots for enterprise-safe template filling. Do not rely only on vague prompt substitution.',
  'Slots:',
  ...slotSet.slots.map((slot) => `- ${slot.id} [${slot.kind}] ${slot.required ? 'required' : 'optional'}: ${slot.description || slot.name}${slot.fallback ? ` Fallback: ${slot.fallback}.` : ''}`),
].join('\n');
