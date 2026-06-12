import type { SlideData } from '@/components/slides/slideTypes';

export interface PresentationTemplateDNA {
  version: '1.0';
  slideCount: number;
  layoutFamilies: Record<string, number>;
  variantUsage: Record<string, number>;
  titleSystem: {
    commonTitleLength: number;
    longestTitle: number;
    averageTitleWords: number;
    titleCaseLikely: boolean;
  };
  notesSystem: {
    slidesWithNotes: number;
    notesCoveragePercent: number;
  };
  mediaSystem: {
    slidesWithImages: number;
    slidesWithCharts: number;
    slidesWithTimelines: number;
    slidesWithProcess: number;
    slidesWithParallax: number;
  };
  recommendedStyleOverrides: string[];
  reusablePromptBlock: string;
}

const countBy = (values: string[]) => values.reduce<Record<string, number>>((acc, value) => {
  acc[value] = (acc[value] || 0) + 1;
  return acc;
}, {});

const titleWords = (title?: string) => (title || '').split(/\s+/).filter(Boolean);

const isTitleCaseLike = (title: string) => {
  const words = titleWords(title).filter((word) => /^[A-Za-z]/.test(word));
  if (!words.length) return false;
  const titleCaseWords = words.filter((word) => /^[A-Z]/.test(word));
  return titleCaseWords.length / words.length > 0.65;
};

export const extractPresentationTemplateDNA = (slides: SlideData[]): PresentationTemplateDNA => {
  const slideCount = slides.length;
  const titles = slides.map((slide) => slide.title || '').filter(Boolean);
  const titleLengths = titles.map((title) => titleWords(title).length);
  const averageTitleWords = titleLengths.length
    ? Math.round((titleLengths.reduce((sum, value) => sum + value, 0) / titleLengths.length) * 10) / 10
    : 0;
  const longestTitle = titleLengths.length ? Math.max(...titleLengths) : 0;
  const commonTitleLength = titleLengths.length ? Math.round(averageTitleWords) : 0;
  const slidesWithNotes = slides.filter((slide) => Boolean(slide.notes?.trim())).length;
  const slidesWithImages = slides.filter((slide) => Boolean(slide.imageUrl || slide.images?.length)).length;
  const slidesWithCharts = slides.filter((slide) => Boolean(slide.chart)).length;
  const slidesWithTimelines = slides.filter((slide) => Boolean(slide.timeline?.length)).length;
  const slidesWithProcess = slides.filter((slide) => Boolean(slide.process?.length)).length;
  const slidesWithParallax = slides.filter((slide) => slide.layout === 'parallax' || Boolean(slide.parallaxLayers?.length)).length;
  const layoutFamilies = countBy(slides.map((slide) => slide.layout || 'unknown'));
  const variantUsage = countBy(slides.map((slide) => slide.variant || 'default'));

  const recommendedStyleOverrides = [
    slideCount > 0 ? `Keep deck pacing around ${slideCount} slides unless the source requires otherwise.` : '',
    commonTitleLength > 0 ? `Target title length around ${commonTitleLength} words; avoid titles longer than ${Math.max(10, longestTitle)} words.` : '',
    slidesWithNotes / Math.max(slideCount, 1) > 0.75 ? 'Preserve speaker notes as a core template behavior.' : 'Add speaker notes when generating decks from this template style.',
    slidesWithImages > slideCount * 0.4 ? 'Use strong image-led pacing and protect image crop zones.' : '',
    slidesWithCharts + slidesWithTimelines + slidesWithProcess > 0 ? 'Preserve structured visual/data layouts as editable PowerPoint objects.' : '',
    slidesWithParallax > 0 ? 'Preserve parallax/motion-ready layer intent for video/storyboard variants.' : '',
  ].filter(Boolean);

  const topLayouts = Object.entries(layoutFamilies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([layout, count]) => `${layout}: ${count}`)
    .join(', ');

  const reusablePromptBlock = `
=== LEARNED PRESENTATION TEMPLATE DNA ===
Slide count: ${slideCount}
Dominant layouts: ${topLayouts || 'none'}
Variants: ${Object.entries(variantUsage).map(([variant, count]) => `${variant}: ${count}`).join(', ') || 'none'}
Average title length: ${averageTitleWords} words
Notes coverage: ${slideCount ? Math.round((slidesWithNotes / slideCount) * 100) : 0}%
Media behavior: ${slidesWithImages} image slides, ${slidesWithCharts} chart slides, ${slidesWithTimelines} timeline slides, ${slidesWithProcess} process slides, ${slidesWithParallax} parallax slides.
Recommended override rules:
${recommendedStyleOverrides.map((rule) => `  • ${rule}`).join('\n') || '  • No reusable style override recommendations detected.'}
=== END LEARNED PRESENTATION TEMPLATE DNA ===
`;

  return {
    version: '1.0',
    slideCount,
    layoutFamilies,
    variantUsage,
    titleSystem: {
      commonTitleLength,
      longestTitle,
      averageTitleWords,
      titleCaseLikely: titles.length ? titles.filter(isTitleCaseLike).length / titles.length > 0.6 : false,
    },
    notesSystem: {
      slidesWithNotes,
      notesCoveragePercent: slideCount ? Math.round((slidesWithNotes / slideCount) * 100) : 0,
    },
    mediaSystem: {
      slidesWithImages,
      slidesWithCharts,
      slidesWithTimelines,
      slidesWithProcess,
      slidesWithParallax,
    },
    recommendedStyleOverrides,
    reusablePromptBlock,
  };
};
