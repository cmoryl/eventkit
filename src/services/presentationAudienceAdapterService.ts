export type PresentationAudienceType =
  | 'executive'
  | 'sales'
  | 'technical'
  | 'training'
  | 'customer'
  | 'investor'
  | 'internal_team';

export interface PresentationAudienceProfile {
  audienceType: PresentationAudienceType;
  readingDepth: 'skim' | 'balanced' | 'deep';
  proofPreference: 'metrics' | 'case_studies' | 'process' | 'vision' | 'mixed';
  tone: 'direct' | 'consultative' | 'inspirational' | 'technical' | 'instructional';
}

export interface PresentationAudienceAdaptation {
  headlineRule: string;
  contentDensityRule: string;
  proofRule: string;
  visualRule: string;
  speakerNotesRule: string;
  recommendedSlideEmphasis: string[];
}

const adaptations: Record<PresentationAudienceType, PresentationAudienceAdaptation> = {
  executive: {
    headlineRule: 'Lead with decisions, outcomes, risk, and impact.',
    contentDensityRule: 'Keep slides sparse and move detail to notes or appendix.',
    proofRule: 'Use credible metrics, clear source context, and executive-level implications.',
    visualRule: 'Use strong hierarchy, large numbers, and minimal clutter.',
    speakerNotesRule: 'Add concise talking points that frame decisions and tradeoffs.',
    recommendedSlideEmphasis: ['executive_summary', 'metric_stack', 'risk_matrix', 'cta_panel'],
  },
  sales: {
    headlineRule: 'Lead with customer value, pain transformation, and action.',
    contentDensityRule: 'Keep slides conversational with proof and concise supporting detail.',
    proofRule: 'Use case studies, testimonials, before/after, and ROI indicators.',
    visualRule: 'Use clear comparison, proof cards, and CTA-heavy endings.',
    speakerNotesRule: 'Add objection-handling and discovery prompts.',
    recommendedSlideEmphasis: ['before_after', 'case_study', 'comparison_grid', 'cta_panel'],
  },
  technical: {
    headlineRule: 'Lead with system behavior, architecture, constraints, and rationale.',
    contentDensityRule: 'Allow deeper content but preserve slide hierarchy.',
    proofRule: 'Use process, data, assumptions, system diagrams, and implementation detail.',
    visualRule: 'Use structured diagrams, tables, process maps, and code/data callouts where appropriate.',
    speakerNotesRule: 'Add implementation assumptions, caveats, and technical dependencies.',
    recommendedSlideEmphasis: ['process_map', 'risk_matrix', 'appendix_table', 'timeline'],
  },
  training: {
    headlineRule: 'Lead with learning objective and practical action.',
    contentDensityRule: 'Chunk content into teachable units with recap moments.',
    proofRule: 'Use examples, step-by-step explanations, and check-for-understanding prompts.',
    visualRule: 'Use sequence, repetition, and clear instructional framing.',
    speakerNotesRule: 'Add facilitator prompts, timing, and exercises.',
    recommendedSlideEmphasis: ['process_map', 'timeline', 'quote_proof', 'appendix_table'],
  },
  customer: {
    headlineRule: 'Lead with user benefit, clarity, and trust.',
    contentDensityRule: 'Avoid internal jargon and keep the path obvious.',
    proofRule: 'Use simple proof, customer outcomes, and transparent next steps.',
    visualRule: 'Use approachable structure, clear CTA, and human-centered language.',
    speakerNotesRule: 'Add plain-language explanation and reassurance points.',
    recommendedSlideEmphasis: ['before_after', 'case_study', 'quote_proof', 'cta_panel'],
  },
  investor: {
    headlineRule: 'Lead with market, traction, growth, defensibility, and ask.',
    contentDensityRule: 'Balance narrative with sharp metrics and appendix depth.',
    proofRule: 'Use growth data, market proof, team proof, and financial signals.',
    visualRule: 'Use metric stacks, roadmap, comparison grids, and clear investment ask.',
    speakerNotesRule: 'Add investor objections, assumptions, and defensibility notes.',
    recommendedSlideEmphasis: ['metric_stack', 'roadmap', 'comparison_grid', 'cta_panel'],
  },
  internal_team: {
    headlineRule: 'Lead with clarity, ownership, next step, and alignment.',
    contentDensityRule: 'Use practical detail without burying ownership or decisions.',
    proofRule: 'Use timelines, owners, operating metrics, and risk mitigation.',
    visualRule: 'Use process maps, roadmap, tables, and responsibility callouts.',
    speakerNotesRule: 'Add owner notes, follow-up actions, and meeting facilitation prompts.',
    recommendedSlideEmphasis: ['process_map', 'roadmap', 'timeline', 'risk_matrix'],
  },
};

export const buildAudienceAdaptation = (profile: PresentationAudienceProfile): PresentationAudienceAdaptation => adaptations[profile.audienceType];

export const buildAudienceAdaptationPromptBlock = (profile: PresentationAudienceProfile) => {
  const adaptation = buildAudienceAdaptation(profile);
  return [
    'PRESENTATION AUDIENCE ADAPTER',
    `Audience type: ${profile.audienceType}`,
    `Reading depth: ${profile.readingDepth}`,
    `Proof preference: ${profile.proofPreference}`,
    `Tone: ${profile.tone}`,
    `Headline rule: ${adaptation.headlineRule}`,
    `Content density rule: ${adaptation.contentDensityRule}`,
    `Proof rule: ${adaptation.proofRule}`,
    `Visual rule: ${adaptation.visualRule}`,
    `Speaker notes rule: ${adaptation.speakerNotesRule}`,
    `Recommended emphasis: ${adaptation.recommendedSlideEmphasis.join(', ')}`,
  ].join('\n');
};
