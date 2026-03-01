// Slide data types for the editor
export interface SlideData {
  id: string;
  layout: 'title' | 'content' | 'image-left' | 'image-right' | 'blank' | 'section' | 'two-column';
  title: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string;
  notes?: string;
  variant: 'default' | 'dark' | 'gradient';
}

export const DEFAULT_SLIDES: SlideData[] = [
  {
    id: 'slide-1',
    layout: 'title',
    title: 'Presentation Title',
    subtitle: 'Your subtitle goes here',
    variant: 'gradient',
  },
  {
    id: 'slide-2',
    layout: 'content',
    title: 'Key Points',
    body: '• First important point\n• Second important point\n• Third important point',
    variant: 'default',
  },
  {
    id: 'slide-3',
    layout: 'section',
    title: 'Thank You',
    subtitle: 'Questions?',
    variant: 'dark',
  },
];
