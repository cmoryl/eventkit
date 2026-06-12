import { describe, expect, it } from 'vitest';
import type { SlideData } from '@/components/slides/slideTypes';
import { buildLiveSlideActions, getDefaultLiveActionForSlide } from './presentationLiveActionRegistry';

const slide: SlideData = {
  id: 'slide-1',
  layout: 'content',
  title: 'Title',
  body: 'Body',
  variant: 'default',
};

describe('presentationLiveActionRegistry', () => {
  it('returns always-on live canvas actions', () => {
    const actions = buildLiveSlideActions(slide);

    expect(actions.map((action) => action.id)).toContain('inline-edit-title');
    expect(actions.map((action) => action.id)).toContain('style-slide');
    expect(actions.map((action) => action.id)).toContain('qa-slide');
  });

  it('adds data-specific actions for chart slides', () => {
    const actions = buildLiveSlideActions({
      ...slide,
      layout: 'chart',
      chart: { type: 'bar', data: [{ label: 'A', value: 1 }] },
    });

    expect(actions.map((action) => action.id)).toContain('edit-chart');
    expect(getDefaultLiveActionForSlide({ ...slide, layout: 'chart', chart: { type: 'bar', data: [{ label: 'A', value: 1 }] } }).id).toBe('edit-chart');
  });

  it('adds motion actions for parallax slides', () => {
    const actions = buildLiveSlideActions({
      ...slide,
      layout: 'parallax',
      parallaxLayers: [{ id: 'layer', kind: 'text', depth: 10, content: 'Text' }],
    });

    expect(actions.map((action) => action.id)).toContain('edit-motion');
  });
});
