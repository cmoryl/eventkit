import { describe, expect, it } from 'vitest';
import { auditPresentationDeck } from './presentationDeckQualityService';

describe('presentationDeckQualityService', () => {
  it('passes a clean deck outline', () => {
    const report = auditPresentationDeck({
      requestedSlideCount: 3,
      deck: {
        title: 'Clean Deck',
        slides: [
          { layout: 'title', title: 'Title', notes: 'Open the talk.' },
          { layout: 'agenda', title: 'Agenda', notes: 'Walk through agenda.' },
          { layout: 'closing', title: 'Next Steps', notes: 'Close with action.' },
        ],
      },
    });

    expect(report.status).toBe('pass');
    expect(report.score).toBeGreaterThanOrEqual(85);
  });

  it('flags missing titles, notes, and repeated layouts', () => {
    const report = auditPresentationDeck({
      deck: {
        slides: [
          { layout: 'bullets', title: '', bullets: ['A'], notes: '' },
          { layout: 'bullets', title: 'Two', bullets: ['A'], notes: '' },
          { layout: 'bullets', title: 'Three', bullets: ['A'], notes: '' },
        ],
      },
    });

    expect(report.issues.some((issue) => issue.category === 'content' && issue.status === 'fail')).toBe(true);
    expect(report.issues.some((issue) => issue.message.includes('repeat'))).toBe(true);
  });
});
