import { describe, expect, it } from 'vitest';
import type { SlideData } from '@/components/slides/slideTypes';
import { buildPresentationInteractionModel, getMaximumInteractionRoadmap } from './presentationInteractionControlService';

const baseSlide: SlideData = {
  id: 'slide-1',
  layout: 'content',
  title: 'Slide title',
  body: 'Body copy',
  variant: 'default',
};

describe('presentationInteractionControlService', () => {
  it('builds baseline live controls for a slide', () => {
    const model = buildPresentationInteractionModel(baseSlide);

    expect(model.summary.total).toBeGreaterThan(8);
    expect(model.controls.map((control) => control.id)).toContain('edit-title');
    expect(model.controls.map((control) => control.id)).toContain('change-layout');
    expect(model.summary.categories).toContain('content');
  });

  it('adds layout-specific controls for chart and parallax slides', () => {
    const chartModel = buildPresentationInteractionModel({
      ...baseSlide,
      layout: 'chart',
      chart: { type: 'bar', data: [{ label: 'A', value: 1 }] },
    });
    const parallaxModel = buildPresentationInteractionModel({
      ...baseSlide,
      layout: 'parallax',
      parallaxLayers: [{ id: 'layer-1', kind: 'text', depth: 20, content: 'Layer' }],
    });

    expect(chartModel.controls.map((control) => control.id)).toContain('edit-chart-data');
    expect(parallaxModel.controls.map((control) => control.id)).toContain('edit-parallax-layers');
  });

  it('documents the maximum interaction roadmap', () => {
    expect(getMaximumInteractionRoadmap().length).toBeGreaterThan(5);
  });
});
