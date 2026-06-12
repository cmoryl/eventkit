import type { PresentationDeckBrainPayload } from './presentationDeckBrainService';

export type DeckQualityStatus = 'pass' | 'warn' | 'fail';

export interface MinimalSlideOutline {
  layout?: string;
  title?: string;
  subtitle?: string;
  bullets?: string[];
  notes?: string;
  kpis?: unknown[];
  metrics?: unknown[];
  agenda?: unknown[];
  timeline?: unknown[];
  process?: unknown[];
  chart?: unknown;
}

export interface MinimalDeckOutline {
  title?: string;
  subtitle?: string;
  slides?: MinimalSlideOutline[];
}

export interface DeckQualityIssue {
  status: DeckQualityStatus;
  category: 'brand' | 'logo' | 'content' | 'layout' | 'notes' | 'source' | 'export';
  slideIndex?: number;
  message: string;
  recommendation: string;
}

export interface DeckQualityReport {
  score: number;
  status: DeckQualityStatus;
  totalSlides: number;
  issues: DeckQualityIssue[];
  summary: string;
}

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

const statusFromScore = (score: number): DeckQualityStatus => score >= 85 ? 'pass' : score >= 70 ? 'warn' : 'fail';

const estimateTextDensity = (slide: MinimalSlideOutline) => {
  const titleWords = (slide.title || '').split(/\s+/).filter(Boolean).length;
  const subtitleWords = (slide.subtitle || '').split(/\s+/).filter(Boolean).length;
  const bulletWords = (slide.bullets || []).join(' ').split(/\s+/).filter(Boolean).length;
  return titleWords + subtitleWords + bulletWords;
};

export const auditPresentationDeck = (args: {
  deck: MinimalDeckOutline;
  requestedSlideCount?: number;
  deckBrain?: PresentationDeckBrainPayload | null;
}): DeckQualityReport => {
  const { deck, requestedSlideCount, deckBrain } = args;
  const slides = deck.slides || [];
  const issues: DeckQualityIssue[] = [];

  if (!slides.length) {
    return {
      score: 0,
      status: 'fail',
      totalSlides: 0,
      issues: [{
        status: 'fail',
        category: 'content',
        message: 'Deck has no slides.',
        recommendation: 'Generate or import a deck before running QA.',
      }],
      summary: 'Deck QA failed because no slides were available.',
    };
  }

  if (requestedSlideCount && Math.abs(slides.length - requestedSlideCount) > 2) {
    issues.push({
      status: 'warn',
      category: 'content',
      message: `Slide count is ${slides.length}, requested ${requestedSlideCount}.`,
      recommendation: 'Review whether the deck should be expanded or compressed to match the requested scope.',
    });
  }

  if (deckBrain && !deckBrain.hasExactLogoSource) {
    issues.push({
      status: 'warn',
      category: 'logo',
      message: 'No exact source logo is available in the Presentation Deck Brain.',
      recommendation: 'Add or set a primary logo in Brand Assets before producing final branded PowerPoint decks.',
    });
  }

  if (deckBrain && !deckBrain.styleSystems.length) {
    issues.push({
      status: 'warn',
      category: 'brand',
      message: 'No full brand set style systems are active for this deck.',
      recommendation: 'Select or infer style systems in Brand Style Systems to improve cross-slide consistency.',
    });
  }

  slides.forEach((slide, index) => {
    if (!slide.title?.trim()) {
      issues.push({
        status: 'fail',
        category: 'content',
        slideIndex: index,
        message: `Slide ${index + 1} has no title.`,
        recommendation: 'Add a clear slide title that communicates the main takeaway.',
      });
    }

    if (!slide.notes?.trim()) {
      issues.push({
        status: 'warn',
        category: 'notes',
        slideIndex: index,
        message: `Slide ${index + 1} is missing speaker notes.`,
        recommendation: 'Add speaker notes so the deck is presentation-ready.',
      });
    }

    const density = estimateTextDensity(slide);
    if (density > 95) {
      issues.push({
        status: 'warn',
        category: 'layout',
        slideIndex: index,
        message: `Slide ${index + 1} appears text-heavy (${density} estimated words).`,
        recommendation: 'Move detail into speaker notes or convert content into KPI, timeline, process, comparison, or chart layouts.',
      });
    }

    if ((slide.bullets || []).length > 7) {
      issues.push({
        status: 'warn',
        category: 'layout',
        slideIndex: index,
        message: `Slide ${index + 1} has more than seven bullets.`,
        recommendation: 'Split into multiple slides or convert bullets into a richer structure.',
      });
    }
  });

  for (let i = 2; i < slides.length; i += 1) {
    const a = slides[i - 2]?.layout;
    const b = slides[i - 1]?.layout;
    const c = slides[i]?.layout;
    if (a && a === b && b === c) {
      issues.push({
        status: 'warn',
        category: 'layout',
        slideIndex: i,
        message: `Slides ${i - 1}-${i + 1} repeat the same layout (${c}) three times in a row.`,
        recommendation: 'Vary layout rhythm with a section, KPI grid, comparison, timeline, process, chart, or image hero slide.',
      });
    }
  }

  const failCount = issues.filter((issue) => issue.status === 'fail').length;
  const warnCount = issues.filter((issue) => issue.status === 'warn').length;
  const score = clampScore(100 - failCount * 18 - warnCount * 6);
  const status = statusFromScore(score);

  return {
    score,
    status,
    totalSlides: slides.length,
    issues,
    summary: issues.length
      ? `${issues.length} deck issue${issues.length === 1 ? '' : 's'} found: ${failCount} fail, ${warnCount} warn.`
      : 'Deck passed QA checks for structure, notes, brand brain readiness, and layout rhythm.',
  };
};
