// Presentation Templates - Slide Decks, Webinar Slides, Stream Overlays

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

const createPixelDimensions = (w: number, h: number) => ({
  widthInches: w / 72, heightInches: h / 72, widthPx: w, heightPx: h, bleedInches: 0, safeZoneInches: 0,
  orientation: (w > h ? 'landscape' : h > w ? 'portrait' : 'square') as 'portrait' | 'landscape' | 'square'
});

const createTextField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'text', position, style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', textAlign: 'left', color: '#ffffff', ...options.style }, ...options
});

const createLogoField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'logo', position, style: { objectFit: 'contain', ...options.style }, acceptedFormats: ['png', 'svg'], ...options
});

const createImageField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'image', position, style: { objectFit: 'cover', borderRadius: 0, ...options.style }, acceptedFormats: ['jpg', 'png', 'webp'], ...options
});

// ============= PRESENTATION SLIDE TEMPLATES =============

export const PRESENTATION_SLIDE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'pres-title-dark',
    name: 'Title Slide – Dark',
    description: 'Bold title slide with dark gradient background',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createLogoField('logo', 'Event Logo', { x: 5, y: 5, width: 12, height: 10 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 10, y: 30, width: 80, height: 20 }, { placeholder: 'Your Presentation Title', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontFamily: 'Inter' } }),
      createTextField('subtitle', 'Subtitle', { x: 15, y: 55, width: 70, height: 10 }, { placeholder: 'Supporting tagline or event name', style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } }),
      createTextField('presenter', 'Presenter', { x: 25, y: 75, width: 50, height: 8 }, { placeholder: 'Presenter Name  •  Title', style: { fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } }),
      createTextField('date', 'Date', { x: 35, y: 88, width: 30, height: 5 }, { placeholder: 'March 2026', style: { fontSize: 14, textAlign: 'center', color: 'rgba(255,255,255,0.4)' } }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#1e293b', accent: '#60a5fa', text: '#ffffff', background: '#0f172a' },
    tags: ['presentation', 'title', 'dark', 'corporate', 'keynote'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-title-light',
    name: 'Title Slide – Light',
    description: 'Clean title slide with light background',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createLogoField('logo', 'Event Logo', { x: 5, y: 5, width: 12, height: 10 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 10, y: 30, width: 80, height: 20 }, { placeholder: 'Your Presentation Title', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#0f172a' } }),
      createTextField('subtitle', 'Subtitle', { x: 15, y: 55, width: 70, height: 10 }, { placeholder: 'Event name or description', style: { fontSize: 24, textAlign: 'center', color: '#64748b' } }),
      createTextField('presenter', 'Presenter', { x: 25, y: 75, width: 50, height: 8 }, { placeholder: 'Presenter Name  •  Title', style: { fontSize: 18, textAlign: 'center', color: '#94a3b8' } }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#f1f5f9', accent: '#2563eb', text: '#0f172a', background: '#ffffff' },
    tags: ['presentation', 'title', 'light', 'clean', 'minimal'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-content-two-column',
    name: 'Two-Column Content',
    description: 'Content slide with two-column layout',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'solid', value: '#0f172a' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 5, y: 5, width: 70, height: 10 }, { placeholder: 'Section Title', required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 5, y: 16, width: 15, height: 0.4 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('left-content', 'Left Column', { x: 5, y: 22, width: 42, height: 65 }, { placeholder: 'Key points and details for the left column...', style: { fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 } }),
      createTextField('right-content', 'Right Column', { x: 53, y: 22, width: 42, height: 65 }, { placeholder: 'Supporting content for the right column...', style: { fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 } }),
      createLogoField('logo', 'Logo', { x: 88, y: 90, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#1e293b', accent: '#60a5fa', text: '#ffffff', background: '#0f172a' },
    tags: ['presentation', 'content', 'two-column', 'layout'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-image-left',
    name: 'Image + Content',
    description: 'Full-bleed image on left with text content on right',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'solid', value: '#0f172a' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createImageField('hero-image', 'Hero Image', { x: 0, y: 0, width: 45, height: 100 }, { placeholder: 'Full-height image' }),
      createTextField('heading', 'Heading', { x: 50, y: 15, width: 45, height: 12 }, { placeholder: 'Key Insight', required: true, style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff' } }),
      { id: 'accent-bar', type: 'divider', name: 'Accent Bar', position: { x: 50, y: 30, width: 10, height: 0.4 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('body', 'Body Text', { x: 50, y: 35, width: 45, height: 40 }, { placeholder: 'Explain your key point here with supporting details and evidence...', style: { fontSize: 20, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 } }),
      createLogoField('logo', 'Logo', { x: 88, y: 90, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#1e293b', accent: '#60a5fa', text: '#ffffff', background: '#0f172a' },
    tags: ['presentation', 'image', 'split', 'content'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-quote-slide',
    name: 'Quote Slide',
    description: 'Highlighted quote or key takeaway',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('quote', 'Quote', { x: 10, y: 25, width: 80, height: 35 }, { placeholder: '"Innovation distinguishes between a leader and a follower."', required: true, style: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', fontStyle: 'italic', lineHeight: 1.5 } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 40, y: 65, width: 20, height: 0.3 }, style: { backgroundColor: '#60a5fa' } },
      createTextField('attribution', 'Attribution', { x: 20, y: 70, width: 60, height: 8 }, { placeholder: '— Steve Jobs', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 88, y: 90, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Georgia', body: 'Inter' },
    defaultColors: { primary: '#60a5fa', secondary: '#1e3a5f', accent: '#93c5fd', text: '#ffffff', background: '#0f172a' },
    tags: ['presentation', 'quote', 'keynote', 'inspiration'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-stats-grid',
    name: 'Stats & Metrics',
    description: 'Four key statistics with labels',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'solid', value: '#0f172a' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 5, y: 5, width: 90, height: 10 }, { placeholder: 'Key Results', required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('stat1-value', 'Stat 1 Value', { x: 5, y: 30, width: 20, height: 15 }, { placeholder: '2.4M', style: { fontSize: 56, fontWeight: 'bold', color: '#3b82f6', textAlign: 'center' } }),
      createTextField('stat1-label', 'Stat 1 Label', { x: 5, y: 48, width: 20, height: 8 }, { placeholder: 'Total Users', style: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' } }),
      createTextField('stat2-value', 'Stat 2 Value', { x: 28, y: 30, width: 20, height: 15 }, { placeholder: '98%', style: { fontSize: 56, fontWeight: 'bold', color: '#10b981', textAlign: 'center' } }),
      createTextField('stat2-label', 'Stat 2 Label', { x: 28, y: 48, width: 20, height: 8 }, { placeholder: 'Satisfaction', style: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' } }),
      createTextField('stat3-value', 'Stat 3 Value', { x: 52, y: 30, width: 20, height: 15 }, { placeholder: '150+', style: { fontSize: 56, fontWeight: 'bold', color: '#f59e0b', textAlign: 'center' } }),
      createTextField('stat3-label', 'Stat 3 Label', { x: 52, y: 48, width: 20, height: 8 }, { placeholder: 'Countries', style: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' } }),
      createTextField('stat4-value', 'Stat 4 Value', { x: 75, y: 30, width: 20, height: 15 }, { placeholder: '$12B', style: { fontSize: 56, fontWeight: 'bold', color: '#ef4444', textAlign: 'center' } }),
      createTextField('stat4-label', 'Stat 4 Label', { x: 75, y: 48, width: 20, height: 8 }, { placeholder: 'Revenue', style: { fontSize: 16, color: 'rgba(255,255,255,0.6)', textAlign: 'center' } }),
      createLogoField('logo', 'Logo', { x: 88, y: 90, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#1e293b', accent: '#60a5fa', text: '#ffffff', background: '#0f172a' },
    tags: ['presentation', 'stats', 'metrics', 'data', 'numbers'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'pres-closing-cta',
    name: 'Closing / CTA Slide',
    description: 'Thank you and call-to-action closing slide',
    assetType: AssetType.PresentationSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #0ea5e9 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('thank-you', 'Heading', { x: 10, y: 25, width: 80, height: 18 }, { placeholder: 'Thank You', required: true, style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('cta', 'Call to Action', { x: 15, y: 50, width: 70, height: 10 }, { placeholder: 'Visit our booth #42 or scan the QR code below', style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.85)' } }),
      createTextField('contact', 'Contact Info', { x: 20, y: 70, width: 60, height: 8 }, { placeholder: 'hello@company.com  •  @company  •  company.com', style: { fontSize: 18, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 42, y: 82, width: 16, height: 12 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#1e40af', accent: '#93c5fd', text: '#ffffff', background: '#3b82f6' },
    tags: ['presentation', 'closing', 'thank-you', 'cta'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
];

// ============= WEBINAR SLIDE TEMPLATES =============

export const WEBINAR_SLIDE_TEMPLATES: EditableTemplate[] = [
  {
    id: 'webinar-title-modern',
    name: 'Webinar Title – Modern',
    description: 'Eye-catching webinar intro slide',
    assetType: AssetType.WebinarSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('badge', 'Badge', { x: 30, y: 10, width: 40, height: 6 }, { placeholder: 'LIVE WEBINAR', style: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', letterSpacing: 3, textTransform: 'uppercase' } }),
      createTextField('title', 'Title', { x: 8, y: 22, width: 84, height: 22 }, { placeholder: 'Mastering Event Design in 2026', required: true, style: { fontSize: 52, fontWeight: 'bold', textAlign: 'center', color: '#ffffff', lineHeight: 1.2 } }),
      createTextField('subtitle', 'Subtitle', { x: 15, y: 48, width: 70, height: 10 }, { placeholder: 'Expert strategies for creating unforgettable experiences', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      { id: 'divider', type: 'divider', name: 'Divider', position: { x: 40, y: 62, width: 20, height: 0.3 }, style: { backgroundColor: 'rgba(255,255,255,0.3)' } },
      createTextField('presenter-name', 'Presenter Name', { x: 25, y: 68, width: 50, height: 8 }, { placeholder: 'Sarah Chen, Head of Events', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('datetime', 'Date & Time', { x: 25, y: 78, width: 50, height: 6 }, { placeholder: 'March 15, 2026 • 2:00 PM EST', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 42, y: 88, width: 16, height: 10 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#4f46e5', accent: '#fbbf24', text: '#ffffff', background: '#4f46e5' },
    tags: ['webinar', 'title', 'live', 'virtual', 'modern'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'webinar-agenda-slide',
    name: 'Webinar Agenda',
    description: 'Agenda overview with numbered sections',
    assetType: AssetType.WebinarSlide,
    category: 'universal',
    background: { type: 'solid', value: '#0f172a' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 5, y: 5, width: 50, height: 10 }, { placeholder: "Today's Agenda", required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('item1', 'Item 1', { x: 8, y: 25, width: 84, height: 10 }, { placeholder: '01  —  Introduction & Overview', style: { fontSize: 24, color: '#ffffff' } }),
      createTextField('item2', 'Item 2', { x: 8, y: 38, width: 84, height: 10 }, { placeholder: '02  —  Key Strategies & Best Practices', style: { fontSize: 24, color: '#ffffff' } }),
      createTextField('item3', 'Item 3', { x: 8, y: 51, width: 84, height: 10 }, { placeholder: '03  —  Live Demo & Case Studies', style: { fontSize: 24, color: '#ffffff' } }),
      createTextField('item4', 'Item 4', { x: 8, y: 64, width: 84, height: 10 }, { placeholder: '04  —  Q&A Session', style: { fontSize: 24, color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 88, y: 5, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#1e293b', accent: '#a78bfa', text: '#ffffff', background: '#0f172a' },
    tags: ['webinar', 'agenda', 'outline', 'schedule'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'webinar-speaker-bio',
    name: 'Speaker Bio Card',
    description: 'Speaker introduction with photo and credentials',
    assetType: AssetType.WebinarSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createImageField('speaker-photo', 'Speaker Photo', { x: 8, y: 15, width: 25, height: 60 }, { placeholder: 'Speaker headshot', style: { borderRadius: 12 } }),
      createTextField('name', 'Speaker Name', { x: 40, y: 20, width: 55, height: 10 }, { placeholder: 'Dr. James Wilson', required: true, style: { fontSize: 40, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('title-role', 'Title & Role', { x: 40, y: 33, width: 55, height: 8 }, { placeholder: 'Chief Innovation Officer, TechCorp', style: { fontSize: 20, color: '#7c3aed' } }),
      { id: 'accent-line', type: 'divider', name: 'Accent Line', position: { x: 40, y: 44, width: 12, height: 0.3 }, style: { backgroundColor: '#7c3aed' } },
      createTextField('bio', 'Bio', { x: 40, y: 48, width: 55, height: 30 }, { placeholder: '15+ years driving digital transformation across Fortune 500 companies. Keynote speaker at 50+ international conferences. Published author of "The Future of Events."', style: { fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 } }),
      createLogoField('logo', 'Logo', { x: 88, y: 88, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#1e293b', accent: '#a78bfa', text: '#ffffff', background: '#0f172a' },
    tags: ['webinar', 'speaker', 'bio', 'introduction'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'webinar-qa-slide',
    name: 'Q&A Slide',
    description: 'Interactive Q&A prompt for audience engagement',
    assetType: AssetType.WebinarSlide,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 10, y: 20, width: 80, height: 18 }, { placeholder: 'Questions?', required: true, style: { fontSize: 72, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('instructions', 'Instructions', { x: 15, y: 50, width: 70, height: 12 }, { placeholder: 'Type your questions in the chat or raise your hand to unmute', style: { fontSize: 24, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('hashtag', 'Hashtag', { x: 25, y: 72, width: 50, height: 8 }, { placeholder: '#EventDesign2026', style: { fontSize: 20, textAlign: 'center', color: 'rgba(255,255,255,0.5)' } }),
      createLogoField('logo', 'Logo', { x: 42, y: 85, width: 16, height: 10 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#4f46e5', accent: '#fbbf24', text: '#ffffff', background: '#7c3aed' },
    tags: ['webinar', 'qa', 'questions', 'interactive'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'webinar-poll-slide',
    name: 'Poll / Survey Slide',
    description: 'Interactive poll with answer options',
    assetType: AssetType.WebinarSlide,
    category: 'universal',
    background: { type: 'solid', value: '#0f172a' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('badge', 'Badge', { x: 5, y: 5, width: 15, height: 5 }, { placeholder: 'LIVE POLL', style: { fontSize: 12, fontWeight: 'bold', color: '#fbbf24', letterSpacing: 2, textTransform: 'uppercase' } }),
      createTextField('question', 'Question', { x: 5, y: 15, width: 90, height: 15 }, { placeholder: 'What is your biggest challenge with event design?', required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('option-a', 'Option A', { x: 8, y: 38, width: 84, height: 10 }, { placeholder: 'A)  Budget constraints', style: { fontSize: 22, color: '#ffffff' } }),
      createTextField('option-b', 'Option B', { x: 8, y: 50, width: 84, height: 10 }, { placeholder: 'B)  Finding the right vendors', style: { fontSize: 22, color: '#ffffff' } }),
      createTextField('option-c', 'Option C', { x: 8, y: 62, width: 84, height: 10 }, { placeholder: 'C)  Time management', style: { fontSize: 22, color: '#ffffff' } }),
      createTextField('option-d', 'Option D', { x: 8, y: 74, width: 84, height: 10 }, { placeholder: 'D)  Brand consistency', style: { fontSize: 22, color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 88, y: 88, width: 8, height: 7 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#1e293b', accent: '#fbbf24', text: '#ffffff', background: '#0f172a' },
    tags: ['webinar', 'poll', 'survey', 'interactive', 'engagement'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
];

// ============= LIVE STREAM OVERLAY TEMPLATES =============

export const STREAM_OVERLAY_TEMPLATES: EditableTemplate[] = [
  {
    id: 'stream-lower-third',
    name: 'Lower Third Overlay',
    description: 'Speaker name and title lower-third bar',
    assetType: AssetType.LiveStreamOverlay,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(90deg, rgba(15,23,42,0.95) 0%, rgba(30,41,59,0.9) 70%, transparent 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('name', 'Speaker Name', { x: 5, y: 78, width: 35, height: 7 }, { placeholder: 'Sarah Chen', required: true, style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('title', 'Title', { x: 5, y: 86, width: 35, height: 6 }, { placeholder: 'Head of Events, TechCorp', style: { fontSize: 18, color: 'rgba(255,255,255,0.7)' } }),
      { id: 'accent-bar', type: 'divider', name: 'Accent', position: { x: 3, y: 78, width: 0.3, height: 15 }, style: { backgroundColor: '#3b82f6' } },
      createLogoField('logo', 'Logo', { x: 88, y: 80, width: 8, height: 12 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#0f172a', accent: '#60a5fa', text: '#ffffff', background: 'transparent' },
    tags: ['stream', 'overlay', 'lower-third', 'broadcast', 'live'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'stream-starting-soon',
    name: 'Starting Soon Screen',
    description: 'Pre-stream waiting screen with countdown',
    assetType: AssetType.LiveStreamOverlay,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createLogoField('logo', 'Event Logo', { x: 35, y: 15, width: 30, height: 20 }, { placeholder: 'Logo' }),
      createTextField('heading', 'Heading', { x: 10, y: 42, width: 80, height: 15 }, { placeholder: 'Starting Soon', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('event-name', 'Event Name', { x: 15, y: 60, width: 70, height: 10 }, { placeholder: 'International Tech Summit 2026', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createTextField('social', 'Social Info', { x: 20, y: 85, width: 60, height: 6 }, { placeholder: '#TechSummit2026  •  @techsummit', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.4)' } }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#3b82f6', secondary: '#0f172a', accent: '#60a5fa', text: '#ffffff', background: '#0f172a' },
    tags: ['stream', 'overlay', 'starting-soon', 'waiting', 'countdown'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'stream-brb',
    name: 'Be Right Back',
    description: 'Intermission screen for stream breaks',
    assetType: AssetType.LiveStreamOverlay,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 50%, #1e293b 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 10, y: 35, width: 80, height: 18 }, { placeholder: 'Be Right Back', required: true, style: { fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('message', 'Message', { x: 15, y: 58, width: 70, height: 10 }, { placeholder: 'Taking a short break — we\'ll be back shortly!', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 42, y: 78, width: 16, height: 12 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#60a5fa', secondary: '#1e3a5f', accent: '#93c5fd', text: '#ffffff', background: '#0f172a' },
    tags: ['stream', 'overlay', 'brb', 'break', 'intermission'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
  {
    id: 'stream-end-screen',
    name: 'Stream End Screen',
    description: 'Thank you and follow-up screen',
    assetType: AssetType.LiveStreamOverlay,
    category: 'universal',
    background: { type: 'gradient', value: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #2563eb 100%)' },
    dimensions: createPixelDimensions(1920, 1080),
    fields: [
      createTextField('heading', 'Heading', { x: 10, y: 25, width: 80, height: 15 }, { placeholder: 'Thanks for Watching!', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('next-event', 'Next Event', { x: 15, y: 48, width: 70, height: 10 }, { placeholder: 'Next session: Advanced Branding — March 20th, 2 PM EST', style: { fontSize: 22, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('cta', 'CTA', { x: 20, y: 65, width: 60, height: 8 }, { placeholder: 'Subscribe for updates at events.company.com', style: { fontSize: 20, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 42, y: 80, width: 16, height: 12 }, { placeholder: 'Logo' }),
    ],
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#7c3aed', accent: '#fbbf24', text: '#ffffff', background: '#4f46e5' },
    tags: ['stream', 'overlay', 'end-screen', 'thank-you', 'closing'],
    colorMode: 'RGB',
    dpi: 72,
    isSystemTemplate: true
  },
];

// ============= COMBINED EXPORT =============

export const ALL_PRESENTATION_TEMPLATES: EditableTemplate[] = [
  ...PRESENTATION_SLIDE_TEMPLATES,
  ...WEBINAR_SLIDE_TEMPLATES,
  ...STREAM_OVERLAY_TEMPLATES,
];
