import type { SlideData } from '@/components/slides/slideTypes';

export type ExportFidelitySeverity = 'pass' | 'warning' | 'fail';

export interface ExportFidelityIssue {
  id: string;
  severity: ExportFidelitySeverity;
  slideId?: string;
  slideTitle?: string;
  message: string;
  recommendation: string;
}

export interface ExportFidelityReport {
  status: ExportFidelitySeverity;
  score: number;
  issues: ExportFidelityIssue[];
  summary: {
    slideCount: number;
    warnings: number;
    failures: number;
    parallaxSlides: number;
    imageHeavySlides: number;
    chartSlides: number;
  };
}

const slideTextLength = (slide: SlideData) => [slide.title, slide.subtitle, slide.body, slide.notes]
  .filter(Boolean)
  .join(' ')
  .length;

const issue = (input: ExportFidelityIssue): ExportFidelityIssue => input;

export const auditPresentationExportFidelity = (slides: SlideData[]): ExportFidelityReport => {
  const issues: ExportFidelityIssue[] = [];

  if (!slides.length) {
    issues.push(issue({
      id: 'no-slides',
      severity: 'fail',
      message: 'No slides are available for export.',
      recommendation: 'Generate or import at least one slide before exporting.',
    }));
  }

  slides.forEach((slide, index) => {
    const title = slide.title || `Slide ${index + 1}`;
    const textLength = slideTextLength(slide);
    const imageCount = (slide.images?.length || 0) + (slide.imageUrl ? 1 : 0) + (slide.bgImage ? 1 : 0);

    if (!slide.title?.trim()) {
      issues.push(issue({
        id: `missing-title-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'warning',
        message: 'Slide is missing a title.',
        recommendation: 'Add a concise title so editor, present mode, and exports maintain navigation clarity.',
      }));
    }

    if (textLength > 1200) {
      issues.push(issue({
        id: `text-density-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'warning',
        message: 'Slide is text-heavy and may not export cleanly to PPTX/PDF.',
        recommendation: 'Split into multiple cards/slides or convert dense text into smart layout blocks.',
      }));
    }

    if (slide.layout === 'parallax') {
      issues.push(issue({
        id: `parallax-export-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'warning',
        message: 'Parallax motion is an in-app/present-mode feature and may flatten during PPTX export.',
        recommendation: 'Use export-safe layered images or create a video/storyboard export profile.',
      }));
    }

    if (imageCount >= 4) {
      issues.push(issue({
        id: `image-heavy-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'warning',
        message: 'Slide is image-heavy and may increase export size or render time.',
        recommendation: 'Compress images and keep only necessary accent/background media.',
      }));
    }

    if (slide.layout === 'chart' && !slide.chart) {
      issues.push(issue({
        id: `chart-missing-data-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'fail',
        message: 'Chart slide has no structured chart data.',
        recommendation: 'Add structured chart data so export can render an editable chart instead of fake chart art.',
      }));
    }

    if (slide.demoTemplate && slide.demoTemplate?.palette && !slide.demoTemplate?.id) {
      issues.push(issue({
        id: `demo-template-id-${slide.id}`,
        slideId: slide.id,
        slideTitle: title,
        severity: 'warning',
        message: 'Demo template slide is missing a stable template id.',
        recommendation: 'Save the deck as a template or assign a template id before enterprise reuse.',
      }));
    }
  });

  const failures = issues.filter((item) => item.severity === 'fail').length;
  const warnings = issues.filter((item) => item.severity === 'warning').length;
  const score = Math.max(0, 100 - failures * 25 - warnings * 8);
  const status: ExportFidelitySeverity = failures ? 'fail' : warnings ? 'warning' : 'pass';

  return {
    status,
    score,
    issues,
    summary: {
      slideCount: slides.length,
      warnings,
      failures,
      parallaxSlides: slides.filter((slide) => slide.layout === 'parallax').length,
      imageHeavySlides: slides.filter((slide) => ((slide.images?.length || 0) + (slide.imageUrl ? 1 : 0) + (slide.bgImage ? 1 : 0)) >= 4).length,
      chartSlides: slides.filter((slide) => slide.layout === 'chart').length,
    },
  };
};
