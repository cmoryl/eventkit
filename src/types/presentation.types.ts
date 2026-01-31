// Presentation types

export type ElementType = 'text' | 'image' | 'chart' | 'shape' | 'icon';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color: string;
  align: 'left' | 'center' | 'right';
  fontFamily?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  objectFit?: 'cover' | 'contain';
}

export interface IconElement extends BaseElement {
  type: 'icon';
  iconName?: string;
  svgContent?: string;
  color: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie' | 'doughnut';
  data: unknown;
  title?: string;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'line';
  backgroundColor: string;
  borderColor?: string;
  borderWidth?: number;
}

export type SlideElement = TextElement | ImageElement | ChartElement | ShapeElement | IconElement;

export interface PresentationTheme {
  backgroundColor: string;
  titleColor: string;
  textColor: string;
  accentColor: string;
  titleFont: string;
  bodyFont: string;
}

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image';
  value: string;
  overlayOpacity?: number;
  imageFit?: 'cover' | 'contain' | 'fill';
  filterBrightness?: number;
  filterContrast?: number;
}

export interface Slide {
  id: string;
  type: 'title' | 'content' | 'image-split' | 'chart' | 'blank';
  elements: SlideElement[];
  speakerNotes?: string;
  background?: string;
  backgroundConfig?: BackgroundConfig;
}

export interface PresentationData {
  title: string;
  theme: PresentationTheme;
  slides: Slide[];
}

export interface PdfExportOptions {
  paperSize: string;
  bleed: number;
  showTrimMarks: boolean;
}
