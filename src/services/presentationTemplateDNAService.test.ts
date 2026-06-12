import { describe, expect, it } from 'vitest';
import type { SlideData } from '@/components/slides/slideTypes';
import { extractPresentationTemplateDNA } from './presentationTemplateDNAService';

const slide = (partial: Partial<SlideData>): SlideData => ({
  id: crypto.randomUUID(),
  layout: 'content',
  title: 'Untitled',
  variant: 'default',
  ...partial,
});

describe('presentationTemplateDNAService', () => {
  it('extracts reusable deck template patterns from slides', () => {
    const dna = extractPresentationTemplateDNA([
      slide({ layout: 'title', title: 'Annual Strategy Update', notes: 'Open here.', variant: 'dark' }),
      slide({ layout: 'chart', title: 'Growth Performance', chart: { type: 'bar', data: [{ label: 'A', value: 1 }] }, notes: 'Explain chart.' }),
      slide({ layout: 'timeline', title: 'Roadmap Milestones', timeline: [{ title: 'Launch' }] }),
      slide({ layout: 'parallax', title: 'Vision Moment', parallaxLayers: [{ id: 'a', kind: 'text', depth: 0, content: 'Vision' }] }),
    ]);

    expect(dna.slideCount).toBe(4);
    expect(dna.layoutFamilies.title).toBe(1);
    expect(dna.mediaSystem.slidesWithCharts).toBe(1);
    expect(dna.mediaSystem.slidesWithTimelines).toBe(1);
    expect(dna.mediaSystem.slidesWithParallax).toBe(1);
    expect(dna.reusablePromptBlock).toContain('LEARNED PRESENTATION TEMPLATE DNA');
  });
});
