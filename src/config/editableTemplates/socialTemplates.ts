// Social Media Templates - Posts, stories, banners

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

const createPixelDimensions = (w: number, h: number) => ({
  widthInches: w / 72, heightInches: h / 72, widthPx: w, heightPx: h, bleedInches: 0, safeZoneInches: 0,
  orientation: (w > h ? 'landscape' : h > w ? 'portrait' : 'square') as 'portrait' | 'landscape' | 'square'
});

const createTextField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'text', position, style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'normal', textAlign: 'left', color: '#1a1a1a', ...options.style }, ...options
});

const createLogoField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'logo', position, style: { objectFit: 'contain', ...options.style }, acceptedFormats: ['png', 'svg'], ...options
});

const createImageField = (id: string, name: string, position: TemplateField['position'], options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}): TemplateField => ({
  id, name, type: 'image', position, style: { objectFit: 'cover', borderRadius: 0, ...options.style }, acceptedFormats: ['jpg', 'png', 'webp'], ...options
});

// ============= SOCIAL POST TEMPLATES =============

export const SOCIAL_POST_TEMPLATES: EditableTemplate[] = [
  {
    id: 'social-post-event-announcement', name: 'Event Announcement', description: 'Square post for event announcements',
    assetType: AssetType.SocialPost, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#667eea', secondary: '#764ba2', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 35, y: 5, width: 30, height: 15 }, { placeholder: 'Event logo' }),
      createTextField('event-type', 'Event Type', { x: 10, y: 22, width: 80, height: 5 }, { placeholder: 'ANNUAL CONFERENCE', style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.9)', letterSpacing: 4, textTransform: 'uppercase' } }),
      createTextField('event-name', 'Event Name', { x: 5, y: 30, width: 90, height: 18 }, { placeholder: 'INNOVATE 2024', required: true, style: { fontSize: 56, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 } }),
      createImageField('featured-image', 'Featured Image', { x: 10, y: 52, width: 80, height: 25 }, { placeholder: 'Event photo or graphic', style: { borderRadius: 12 } }),
      createTextField('date', 'Date', { x: 15, y: 80, width: 70, height: 6 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('cta', 'Call to Action', { x: 25, y: 88, width: 50, height: 6 }, { placeholder: 'Register Now →', style: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#ffffff' } })
    ],
    tags: ['social', 'instagram', 'square', 'announcement']
  },
  {
    id: 'social-post-speaker-spotlight', name: 'Speaker Spotlight', description: 'Feature a speaker or guest',
    assetType: AssetType.SocialPost, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#3b82f6', accent: '#f59e0b', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 8, width: 40, height: 5 }, { placeholder: 'FEATURED SPEAKER', style: { fontSize: 12, fontWeight: '600', color: '#f59e0b', letterSpacing: 2 } }),
      createLogoField('logo', 'Event Logo', { x: 75, y: 5, width: 20, height: 10 }, { placeholder: 'Event logo' }),
      createImageField('speaker-photo', 'Speaker Photo', { x: 15, y: 18, width: 70, height: 45 }, { placeholder: 'Speaker headshot', required: true, style: { borderRadius: 12 } }),
      createTextField('speaker-name', 'Speaker Name', { x: 10, y: 66, width: 80, height: 10 }, { placeholder: 'Dr. Jane Smith', required: true, style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title', 'Title & Company', { x: 10, y: 77, width: 80, height: 6 }, { placeholder: 'CEO, TechCorp', style: { fontSize: 16, textAlign: 'center', color: '#94a3b8' } }),
      createTextField('topic', 'Talk Topic', { x: 10, y: 86, width: 80, height: 8 }, { placeholder: '"The Future of AI in Healthcare"', style: { fontSize: 14, textAlign: 'center', color: '#3b82f6', fontStyle: 'italic' } })
    ],
    tags: ['social', 'speaker', 'spotlight', 'feature']
  },
  {
    id: 'social-post-quote', name: 'Quote Card', description: 'Inspirational quote card for social',
    assetType: AssetType.SocialPost, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'solid', value: '#fafafa' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a1a', background: '#fafafa' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('quote-mark', 'Quote Mark', { x: 10, y: 15, width: 20, height: 15 }, { placeholder: '"', style: { fontSize: 96, fontWeight: 'bold', color: '#3b82f6' } }),
      createTextField('quote', 'Quote', { x: 10, y: 30, width: 80, height: 30 }, { placeholder: 'Innovation distinguishes between a leader and a follower.', required: true, style: { fontSize: 28, fontWeight: '500', lineHeight: 1.4, color: '#1a1a1a', fontStyle: 'italic' } }),
      { id: 'line', type: 'divider', name: 'Line', position: { x: 10, y: 68, width: 20, height: 0.3 }, style: { backgroundColor: '#3b82f6' } },
      createTextField('author', 'Author', { x: 10, y: 73, width: 80, height: 6 }, { placeholder: 'Steve Jobs', style: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('title', 'Title', { x: 10, y: 81, width: 80, height: 5 }, { placeholder: 'Keynote Speaker, Tech Summit 2024', style: { fontSize: 13, color: '#6b7280' } }),
      createLogoField('logo', 'Logo', { x: 75, y: 88, width: 18, height: 8 }, { placeholder: 'Logo' })
    ],
    tags: ['social', 'quote', 'inspiration']
  },
  {
    id: 'social-post-recap', name: 'Event Recap', description: 'Post-event recap with stats',
    assetType: AssetType.SocialPost, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#f59e0b', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 35, y: 5, width: 30, height: 12 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 10, y: 20, width: 80, height: 10 }, { placeholder: 'EVENT RECAP', style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#22d3ee', letterSpacing: 4 } }),
      createTextField('stat-1', 'Stat 1', { x: 5, y: 38, width: 28, height: 15 }, { placeholder: '500+\nAttendees', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('stat-2', 'Stat 2', { x: 36, y: 38, width: 28, height: 15 }, { placeholder: '30+\nSpeakers', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('stat-3', 'Stat 3', { x: 67, y: 38, width: 28, height: 15 }, { placeholder: '3\nDays', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('highlight', 'Highlight Photo', { x: 10, y: 58, width: 80, height: 25 }, { placeholder: 'Best event photo', style: { borderRadius: 12 } }),
      createTextField('cta', 'CTA', { x: 15, y: 88, width: 70, height: 6 }, { placeholder: 'See you next year! 🎉', style: { fontSize: 18, textAlign: 'center', color: '#f59e0b' } })
    ],
    tags: ['social', 'recap', 'stats']
  },
  {
    id: 'social-post-save-date', name: 'Save the Date', description: 'Save-the-date social media card',
    assetType: AssetType.SocialPost, category: 'universal', dimensions: createPixelDimensions(1080, 1080),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#4c1d95', accent: '#fbbf24', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('save-label', 'Save The', { x: 10, y: 15, width: 80, height: 8 }, { placeholder: 'SAVE THE', style: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.8)', letterSpacing: 8 } }),
      createTextField('date-label', 'Date', { x: 10, y: 24, width: 80, height: 15 }, { placeholder: 'DATE', style: { fontSize: 64, fontWeight: '800', textAlign: 'center', color: '#fbbf24' } }),
      createLogoField('logo', 'Logo', { x: 30, y: 42, width: 40, height: 15 }, { placeholder: 'Logo' }),
      createTextField('event-name', 'Event Name', { x: 10, y: 60, width: 80, height: 10 }, { placeholder: 'Tech Conference 2024', required: true, style: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 15, y: 73, width: 70, height: 8 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 22, textAlign: 'center', color: '#ffffff' } }),
      createTextField('location', 'Location', { x: 15, y: 83, width: 70, height: 6 }, { placeholder: 'San Francisco, CA', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      createTextField('url', 'Website', { x: 25, y: 92, width: 50, height: 5 }, { placeholder: 'event.com/register', style: { fontSize: 12, textAlign: 'center', color: '#fbbf24' } })
    ],
    tags: ['social', 'save-the-date', 'announcement']
  }
];

// ============= SOCIAL STORY TEMPLATES =============

export const SOCIAL_STORY_TEMPLATES: EditableTemplate[] = [
  {
    id: 'story-event-countdown', name: 'Event Countdown', description: 'Vertical story for event countdown',
    assetType: AssetType.SocialStory, category: 'universal', dimensions: createPixelDimensions(1080, 1920),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#3b82f6', accent: '#f59e0b', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Event Logo', { x: 30, y: 8, width: 40, height: 10 }, { placeholder: 'Event logo' }),
      createTextField('countdown-label', 'Countdown Label', { x: 10, y: 22, width: 80, height: 4 }, { placeholder: 'STARTS IN', style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#f59e0b', letterSpacing: 4 } }),
      createTextField('days', 'Days', { x: 20, y: 28, width: 60, height: 12 }, { placeholder: '5 DAYS', style: { fontSize: 72, fontWeight: '800', textAlign: 'center', color: '#ffffff' } }),
      createImageField('event-image', 'Event Image', { x: 5, y: 42, width: 90, height: 25 }, { placeholder: 'Event teaser image', style: { borderRadius: 16 } }),
      createTextField('event-name', 'Event Name', { x: 5, y: 70, width: 90, height: 8 }, { placeholder: 'TECH SUMMIT 2024', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('date-location', 'Date & Location', { x: 10, y: 80, width: 80, height: 5 }, { placeholder: 'March 15 • San Francisco', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } }),
      { id: 'swipe-up', type: 'text', name: 'Swipe Up CTA', position: { x: 30, y: 90, width: 40, height: 5 }, placeholder: '↑ SWIPE UP TO REGISTER', style: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: '#f59e0b' } }
    ],
    tags: ['story', 'countdown', 'instagram', 'vertical']
  },
  {
    id: 'story-speaker-announce', name: 'Speaker Announcement', description: 'Announce speakers via story',
    assetType: AssetType.SocialStory, category: 'universal', dimensions: createPixelDimensions(1080, 1920),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#8b5cf6', secondary: '#0f172a', accent: '#ffffff', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 8, width: 80, height: 4 }, { placeholder: 'SPEAKER ANNOUNCEMENT', style: { fontSize: 12, fontWeight: 'bold', textAlign: 'center', color: '#8b5cf6', letterSpacing: 3 } }),
      createImageField('photo', 'Speaker Photo', { x: 15, y: 15, width: 70, height: 35 }, { placeholder: 'Speaker photo', required: true, style: { borderRadius: 16 } }),
      createTextField('name', 'Name', { x: 10, y: 53, width: 80, height: 8 }, { placeholder: 'Dr. Jane Smith', style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('title', 'Title', { x: 10, y: 63, width: 80, height: 5 }, { placeholder: 'CEO, TechCorp', style: { fontSize: 16, textAlign: 'center', color: '#94a3b8' } }),
      createTextField('topic', 'Topic', { x: 10, y: 72, width: 80, height: 8 }, { placeholder: '"AI & The Future of Work"', style: { fontSize: 18, textAlign: 'center', color: '#8b5cf6', fontStyle: 'italic' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 84, width: 30, height: 8 }, { placeholder: 'Event logo' }),
      createTextField('cta', 'CTA', { x: 20, y: 93, width: 60, height: 4 }, { placeholder: 'Tap to learn more', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['story', 'speaker', 'announcement']
  },
  {
    id: 'story-behind-scenes', name: 'Behind the Scenes', description: 'BTS event story template',
    assetType: AssetType.SocialStory, category: 'universal', dimensions: createPixelDimensions(1080, 1920),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ef4444', text: '#ffffff', background: '#000000' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createImageField('photo', 'BTS Photo', { x: 0, y: 0, width: 100, height: 65 }, { placeholder: 'Behind-the-scenes photo', required: true }),
      createTextField('label', 'Label', { x: 5, y: 68, width: 50, height: 4 }, { placeholder: 'BEHIND THE SCENES', style: { fontSize: 11, fontWeight: 'bold', color: '#ef4444', letterSpacing: 2 } }),
      createTextField('caption', 'Caption', { x: 5, y: 74, width: 90, height: 10 }, { placeholder: 'Setting up for an incredible night! 🎤', style: { fontSize: 20, fontWeight: '600', color: '#ffffff' } }),
      createLogoField('logo', 'Logo', { x: 5, y: 88, width: 20, height: 8 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 30, y: 90, width: 65, height: 5 }, { placeholder: 'Tech Summit 2024', style: { fontSize: 13, textAlign: 'right', color: 'rgba(255,255,255,0.6)' } })
    ],
    tags: ['story', 'bts', 'behind-scenes']
  },
  {
    id: 'story-live-now', name: 'Live Now', description: 'Real-time event story',
    assetType: AssetType.SocialStory, category: 'universal', dimensions: createPixelDimensions(1080, 1920),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#dc2626', secondary: '#991b1b', accent: '#ffffff', text: '#ffffff', background: '#dc2626' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('live', 'LIVE', { x: 30, y: 8, width: 40, height: 6 }, { placeholder: '🔴 LIVE NOW', style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createImageField('photo', 'Live Photo', { x: 5, y: 18, width: 90, height: 40 }, { placeholder: 'Live event photo', required: true, style: { borderRadius: 16 } }),
      createTextField('title', 'Session Title', { x: 10, y: 62, width: 80, height: 10 }, { placeholder: 'Opening Keynote', style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' } }),
      createTextField('speaker', 'Speaker', { x: 10, y: 74, width: 80, height: 5 }, { placeholder: 'with Dr. Jane Smith', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.9)' } }),
      createLogoField('logo', 'Logo', { x: 35, y: 82, width: 30, height: 8 }, { placeholder: 'Logo' }),
      createTextField('tune-in', 'Tune In', { x: 20, y: 92, width: 60, height: 4 }, { placeholder: 'Watch live at event.com/stream', style: { fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['story', 'live', 'streaming']
  },
  {
    id: 'story-thank-you', name: 'Thank You Story', description: 'Post-event thank you story',
    assetType: AssetType.SocialStory, category: 'universal', dimensions: createPixelDimensions(1080, 1920),
    background: { type: 'gradient', value: 'linear-gradient(180deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#4c1d95', accent: '#fbbf24', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 30, y: 10, width: 40, height: 12 }, { placeholder: 'Logo' }),
      createTextField('thank-you', 'Thank You', { x: 10, y: 28, width: 80, height: 15 }, { placeholder: 'Thank You!', style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#fbbf24', fontStyle: 'italic' } }),
      createImageField('collage', 'Event Collage', { x: 10, y: 45, width: 80, height: 25 }, { placeholder: 'Event highlight photos', style: { borderRadius: 16 } }),
      createTextField('message', 'Message', { x: 10, y: 73, width: 80, height: 10 }, { placeholder: 'What an incredible event! We couldn\'t have done it without you.', style: { fontSize: 18, textAlign: 'center', color: '#ffffff', lineHeight: 1.4 } }),
      createTextField('see-you', 'See You', { x: 15, y: 88, width: 70, height: 5 }, { placeholder: 'See you next year! 💜', style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['story', 'thank-you', 'post-event']
  }
];

// ============= LINKEDIN BANNER TEMPLATES =============

export const LINKEDIN_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'linkedin-banner-professional', name: 'Professional LinkedIn Banner', description: 'LinkedIn profile banner for professionals',
    assetType: AssetType.LinkedInBanner, category: 'universal', dimensions: createPixelDimensions(1584, 396),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #0077b5 0%, #005582 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0077b5', secondary: '#005582', accent: '#ffffff', text: '#ffffff', background: '#0077b5' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Company Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Company logo' }),
      createTextField('headline', 'Headline', { x: 25, y: 25, width: 50, height: 25 }, { placeholder: 'Transforming Ideas into Reality', style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('tagline', 'Tagline', { x: 25, y: 55, width: 50, height: 15 }, { placeholder: 'Innovation • Strategy • Growth', style: { fontSize: 14, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('website', 'Website', { x: 75, y: 70, width: 20, height: 10 }, { placeholder: 'company.com', style: { fontSize: 12, textAlign: 'right', color: 'rgba(255,255,255,0.8)' } })
    ],
    tags: ['linkedin', 'banner', 'professional', 'header']
  },
  {
    id: 'linkedin-banner-event', name: 'Event LinkedIn Banner', description: 'Event promotion LinkedIn banner',
    assetType: AssetType.LinkedInBanner, category: 'universal', dimensions: createPixelDimensions(1584, 396),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#667eea', secondary: '#764ba2', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 3, y: 15, width: 12, height: 70 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event Name', { x: 18, y: 20, width: 45, height: 30 }, { placeholder: 'Tech Summit 2024', required: true, style: { fontSize: 32, fontWeight: '800', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 18, y: 55, width: 45, height: 12 }, { placeholder: 'March 15-17, 2024 | San Francisco', style: { fontSize: 14, color: 'rgba(255,255,255,0.9)' } }),
      createTextField('cta', 'CTA', { x: 18, y: 72, width: 30, height: 12 }, { placeholder: 'Register Now →', style: { fontSize: 13, fontWeight: 'bold', color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 } }),
      createImageField('image', 'Event Image', { x: 68, y: 5, width: 30, height: 90 }, { placeholder: 'Event image', style: { borderRadius: 12 } })
    ],
    tags: ['linkedin', 'banner', 'event']
  },
  {
    id: 'linkedin-banner-dark', name: 'Dark Tech LinkedIn Banner', description: 'Dark tech-themed LinkedIn banner',
    assetType: AssetType.LinkedInBanner, category: 'universal', dimensions: createPixelDimensions(1584, 396),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#22d3ee', secondary: '#0f172a', accent: '#8b5cf6', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 15, width: 12, height: 70 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 20, y: 20, width: 55, height: 25 }, { placeholder: 'Building the Future of Technology', style: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' } }),
      createTextField('subtitle', 'Subtitle', { x: 20, y: 55, width: 55, height: 15 }, { placeholder: 'AI • Cloud • DevOps • Innovation', style: { fontSize: 13, color: '#22d3ee' } }),
      createTextField('url', 'URL', { x: 20, y: 75, width: 30, height: 10 }, { placeholder: 'techcompany.com', style: { fontSize: 11, color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['linkedin', 'banner', 'dark', 'tech']
  },
  {
    id: 'linkedin-banner-minimal', name: 'Minimal LinkedIn Banner', description: 'Clean minimal LinkedIn header',
    assetType: AssetType.LinkedInBanner, category: 'universal', dimensions: createPixelDimensions(1584, 396),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#6b7280', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Logo' }),
      createTextField('name', 'Company Name', { x: 25, y: 25, width: 50, height: 20 }, { placeholder: 'Company Name', style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('tagline', 'Tagline', { x: 25, y: 55, width: 50, height: 15 }, { placeholder: 'Your compelling tagline here', style: { fontSize: 14, color: '#6b7280' } }),
      { id: 'accent', type: 'shape', name: 'Accent', position: { x: 0, y: 92, width: 100, height: 8 }, style: { backgroundColor: '#3b82f6' } }
    ],
    tags: ['linkedin', 'banner', 'minimal', 'clean']
  },
  {
    id: 'linkedin-banner-gradient', name: 'Gradient LinkedIn Banner', description: 'Bold gradient LinkedIn banner',
    assetType: AssetType.LinkedInBanner, category: 'universal', dimensions: createPixelDimensions(1584, 396),
    background: { type: 'gradient', value: 'linear-gradient(90deg, #f472b6 0%, #8b5cf6 50%, #22d3ee 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#f472b6', secondary: '#8b5cf6', accent: '#ffffff', text: '#ffffff', background: '#8b5cf6' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 12, height: 60 }, { placeholder: 'Logo' }),
      createTextField('title', 'Title', { x: 22, y: 25, width: 56, height: 25 }, { placeholder: 'Creative Studio', style: { fontSize: 36, fontWeight: '800', color: '#ffffff' } }),
      createTextField('subtitle', 'Subtitle', { x: 22, y: 58, width: 56, height: 12 }, { placeholder: 'Design • Brand • Experience', style: { fontSize: 15, color: 'rgba(255,255,255,0.9)' } })
    ],
    tags: ['linkedin', 'banner', 'gradient', 'creative']
  }
];

// ============= YOUTUBE THUMBNAIL TEMPLATES =============

export const YOUTUBE_THUMBNAIL_TEMPLATES: EditableTemplate[] = [
  {
    id: 'youtube-thumbnail-event', name: 'Event YouTube Thumbnail', description: 'Eye-catching thumbnail for event videos',
    assetType: AssetType.YouTubeThumbnail, category: 'universal', dimensions: createPixelDimensions(1280, 720),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#ef4444', secondary: '#dc2626', accent: '#fbbf24', text: '#ffffff', background: '#ef4444' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createImageField('background-image', 'Background Image', { x: 0, y: 0, width: 100, height: 100 }, { placeholder: 'Background photo', style: { opacity: 0.3 } }),
      createTextField('title', 'Title', { x: 5, y: 20, width: 65, height: 35 }, { placeholder: 'EVENT HIGHLIGHTS', required: true, style: { fontSize: 48, fontWeight: '800', color: '#ffffff', lineHeight: 1.1 } }),
      createTextField('subtitle', 'Subtitle', { x: 5, y: 60, width: 50, height: 15 }, { placeholder: 'Conference 2024', style: { fontSize: 24, fontWeight: '600', color: '#fbbf24' } }),
      createImageField('speaker-image', 'Featured Image', { x: 60, y: 10, width: 38, height: 80 }, { placeholder: 'Speaker or event image', style: { objectFit: 'contain' } }),
      createLogoField('logo', 'Logo', { x: 5, y: 80, width: 15, height: 15 }, { placeholder: 'Channel logo' })
    ],
    tags: ['youtube', 'thumbnail', 'video', 'event']
  },
  {
    id: 'youtube-thumbnail-interview', name: 'Interview Thumbnail', description: 'Two-person interview style thumbnail',
    assetType: AssetType.YouTubeThumbnail, category: 'universal', dimensions: createPixelDimensions(1280, 720),
    background: { type: 'solid', value: '#0f172a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#0f172a', secondary: '#3b82f6', accent: '#f59e0b', text: '#ffffff', background: '#0f172a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createImageField('person-1', 'Person 1', { x: 0, y: 10, width: 35, height: 80 }, { placeholder: 'Host photo' }),
      createImageField('person-2', 'Person 2', { x: 65, y: 10, width: 35, height: 80 }, { placeholder: 'Guest photo' }),
      createTextField('title', 'Title', { x: 28, y: 15, width: 44, height: 35 }, { placeholder: 'The Future of AI', required: true, style: { fontSize: 32, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 } }),
      createTextField('subtitle', 'Subtitle', { x: 28, y: 55, width: 44, height: 10 }, { placeholder: 'Exclusive Interview', style: { fontSize: 16, textAlign: 'center', color: '#f59e0b' } }),
      createLogoField('logo', 'Logo', { x: 38, y: 75, width: 24, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['youtube', 'thumbnail', 'interview']
  },
  {
    id: 'youtube-thumbnail-tutorial', name: 'Tutorial Thumbnail', description: 'How-to/tutorial style thumbnail',
    assetType: AssetType.YouTubeThumbnail, category: 'universal', dimensions: createPixelDimensions(1280, 720),
    background: { type: 'solid', value: '#1e40af' },
    defaultFonts: { heading: 'Poppins', body: 'Inter' },
    defaultColors: { primary: '#1e40af', secondary: '#ffffff', accent: '#fbbf24', text: '#ffffff', background: '#1e40af' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('step', 'Step Label', { x: 5, y: 5, width: 25, height: 12 }, { placeholder: 'HOW TO', style: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 4 } }),
      createTextField('title', 'Title', { x: 5, y: 25, width: 55, height: 40 }, { placeholder: 'Set Up Your Event Booth', required: true, style: { fontSize: 36, fontWeight: '800', color: '#ffffff', lineHeight: 1.1 } }),
      createImageField('image', 'Demo Image', { x: 55, y: 5, width: 43, height: 90 }, { placeholder: 'Tutorial screenshot', style: { borderRadius: 12 } }),
      createTextField('number', 'Step Count', { x: 5, y: 70, width: 20, height: 12 }, { placeholder: '5 Steps', style: { fontSize: 18, fontWeight: 'bold', color: '#fbbf24' } }),
      createLogoField('logo', 'Logo', { x: 5, y: 85, width: 15, height: 10 }, { placeholder: 'Logo' })
    ],
    tags: ['youtube', 'thumbnail', 'tutorial', 'how-to']
  },
  {
    id: 'youtube-thumbnail-recap', name: 'Recap Thumbnail', description: 'Event recap/highlights thumbnail',
    assetType: AssetType.YouTubeThumbnail, category: 'universal', dimensions: createPixelDimensions(1280, 720),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' },
    defaultFonts: { heading: 'Montserrat', body: 'Inter' },
    defaultColors: { primary: '#7c3aed', secondary: '#4c1d95', accent: '#fbbf24', text: '#ffffff', background: '#7c3aed' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createImageField('bg', 'Background', { x: 0, y: 0, width: 100, height: 100 }, { placeholder: 'Event highlight photo', style: { opacity: 0.25 } }),
      createTextField('label', 'Label', { x: 5, y: 10, width: 40, height: 8 }, { placeholder: '🎬 EVENT RECAP', style: { fontSize: 14, fontWeight: 'bold', color: '#fbbf24' } }),
      createTextField('title', 'Title', { x: 5, y: 25, width: 70, height: 30 }, { placeholder: 'Best Moments from Summit 2024', required: true, style: { fontSize: 38, fontWeight: '800', color: '#ffffff', lineHeight: 1.1 } }),
      createTextField('stats', 'Stats', { x: 5, y: 65, width: 60, height: 10 }, { placeholder: '500+ Attendees • 30+ Speakers • 3 Days', style: { fontSize: 14, color: 'rgba(255,255,255,0.8)' } }),
      createLogoField('logo', 'Logo', { x: 75, y: 78, width: 20, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['youtube', 'thumbnail', 'recap', 'highlights']
  },
  {
    id: 'youtube-thumbnail-announcement', name: 'Announcement Thumbnail', description: 'Big announcement style thumbnail',
    assetType: AssetType.YouTubeThumbnail, category: 'universal', dimensions: createPixelDimensions(1280, 720),
    background: { type: 'solid', value: '#000000' },
    defaultFonts: { heading: 'Bebas Neue', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#000000', accent: '#ef4444', text: '#ffffff', background: '#000000' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('big-text', 'Big Text', { x: 5, y: 10, width: 60, height: 50 }, { placeholder: 'HUGE NEWS!', required: true, style: { fontSize: 64, fontWeight: '800', color: '#ffffff', lineHeight: 1 } }),
      createTextField('subtitle', 'Subtitle', { x: 5, y: 62, width: 55, height: 12 }, { placeholder: 'You won\'t believe this...', style: { fontSize: 22, color: '#ef4444' } }),
      createImageField('image', 'Image', { x: 58, y: 5, width: 40, height: 90 }, { placeholder: 'Reaction or reveal image' }),
      createLogoField('logo', 'Logo', { x: 5, y: 80, width: 15, height: 12 }, { placeholder: 'Logo' })
    ],
    tags: ['youtube', 'thumbnail', 'announcement', 'news']
  }
];

// ============= TWITTER/X HEADER TEMPLATES =============

export const TWITTER_HEADER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'twitter-header-minimal', name: 'Minimal X Header', description: 'Clean minimal Twitter/X header',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1500, 500),
    background: { type: 'solid', value: '#ffffff' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#ffffff', accent: '#3b82f6', text: '#1a1a1a', background: '#ffffff' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 15, height: 60 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 25, y: 25, width: 50, height: 20 }, { placeholder: 'Brand Name', required: true, style: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a' } }),
      createTextField('tagline', 'Tagline', { x: 25, y: 50, width: 50, height: 15 }, { placeholder: 'Your tagline goes here', style: { fontSize: 16, color: '#6b7280' } })
    ],
    tags: ['twitter', 'x', 'header', 'minimal', 'social']
  },
  {
    id: 'twitter-header-event', name: 'Event X Header', description: 'Event-branded Twitter/X header',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1500, 500),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #1e3a5f 0%, #0c2340 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#1e3a5f', accent: '#fbbf24', text: '#ffffff', background: '#1e3a5f' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 3, y: 15, width: 12, height: 70 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 18, y: 15, width: 60, height: 30 }, { placeholder: 'ANNUAL CONFERENCE', required: true, style: { fontSize: 42, fontWeight: '800', color: '#ffffff' } }),
      createTextField('date', 'Date', { x: 18, y: 50, width: 40, height: 15 }, { placeholder: 'March 15-17, 2024', style: { fontSize: 18, color: '#fbbf24' } }),
      createTextField('hashtag', 'Hashtag', { x: 18, y: 68, width: 40, height: 12 }, { placeholder: '#Conference2024', style: { fontSize: 16, color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['twitter', 'x', 'header', 'event', 'social']
  },
  {
    id: 'twitter-header-dark-mode', name: 'Dark Mode X Header', description: 'Dark premium Twitter/X header',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1500, 500),
    background: { type: 'solid', value: '#0a0a0a' },
    defaultFonts: { heading: 'Space Grotesk', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#0a0a0a', accent: '#a78bfa', text: '#ffffff', background: '#0a0a0a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 5, y: 20, width: 12, height: 60 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 22, y: 20, width: 55, height: 25 }, { placeholder: 'BRAND NAME', required: true, style: { fontSize: 44, fontWeight: '800', color: '#ffffff' } }),
      createTextField('desc', 'Description', { x: 22, y: 50, width: 55, height: 15 }, { placeholder: 'Building the future of events', style: { fontSize: 18, color: '#a78bfa' } }),
      createTextField('url', 'URL', { x: 22, y: 70, width: 40, height: 10 }, { placeholder: 'brand.com', style: { fontSize: 14, color: 'rgba(255,255,255,0.5)' } })
    ],
    tags: ['twitter', 'x', 'header', 'dark', 'premium', 'social']
  }
];

// ============= PODCAST COVER TEMPLATES =============

export const PODCAST_COVER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'podcast-bold-minimal', name: 'Bold Minimal', description: 'Clean bold podcast cover',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(3000, 3000),
    background: { type: 'solid', value: '#0a0a0a' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#0a0a0a', accent: '#ef4444', text: '#ffffff', background: '#0a0a0a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('title', 'Title', { x: 8, y: 15, width: 84, height: 30 }, { placeholder: 'THE\nPODCAST', required: true, style: { fontSize: 72, fontWeight: '800', color: '#ffffff', lineHeight: 1.1 } }),
      { id: 'bar', type: 'shape' as any, name: 'Accent', position: { x: 8, y: 48, width: 20, height: 1.5 }, style: { backgroundColor: '#ef4444' } },
      createTextField('subtitle', 'Subtitle', { x: 8, y: 54, width: 84, height: 12 }, { placeholder: 'Conversations that matter', style: { fontSize: 22, color: 'rgba(255,255,255,0.6)' } }),
      createLogoField('logo', 'Logo', { x: 8, y: 75, width: 20, height: 15 }, { placeholder: 'Logo' })
    ],
    tags: ['podcast', 'cover', 'bold', 'minimal', 'social']
  },
  {
    id: 'podcast-editorial', name: 'Editorial Podcast', description: 'Magazine-style podcast cover',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(3000, 3000),
    background: { type: 'solid', value: '#f5f3ee' },
    defaultFonts: { heading: 'Playfair Display', body: 'Inter' },
    defaultColors: { primary: '#1a1a1a', secondary: '#f5f3ee', accent: '#c9a84c', text: '#1a1a1a', background: '#f5f3ee' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('label', 'Label', { x: 10, y: 10, width: 80, height: 5 }, { placeholder: 'A PODCAST BY', style: { fontSize: 12, textAlign: 'center', color: '#6b7280', letterSpacing: 4 } }),
      createLogoField('logo', 'Logo', { x: 30, y: 18, width: 40, height: 15 }, { placeholder: 'Logo' }),
      { id: 'line', type: 'divider' as any, name: 'Line', position: { x: 30, y: 36, width: 40, height: 0.3 }, style: { backgroundColor: '#c9a84c' } },
      createTextField('title', 'Title', { x: 8, y: 40, width: 84, height: 25 }, { placeholder: 'Behind the\nScenes', required: true, style: { fontSize: 56, fontWeight: 'bold', textAlign: 'center', color: '#1a1a1a', lineHeight: 1.2 } }),
      createTextField('subtitle', 'Subtitle', { x: 15, y: 68, width: 70, height: 10 }, { placeholder: 'Stories from the industry', style: { fontSize: 18, textAlign: 'center', color: '#6b7280' } }),
      createImageField('host', 'Host Photo', { x: 30, y: 80, width: 40, height: 15 }, { placeholder: 'Host photo', style: { borderRadius: 100 } })
    ],
    tags: ['podcast', 'cover', 'editorial', 'classy', 'social']
  },
  {
    id: 'podcast-neon-tech', name: 'Neon Tech Podcast', description: 'Tech-forward neon podcast cover',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(3000, 3000),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #0a0a1a 0%, #1e1e5a 100%)' },
    defaultFonts: { heading: 'Space Grotesk', body: 'Inter' },
    defaultColors: { primary: '#4ade80', secondary: '#0a0a1a', accent: '#a78bfa', text: '#4ade80', background: '#0a0a1a' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createTextField('title', 'Title', { x: 8, y: 20, width: 84, height: 25 }, { placeholder: 'TECH\nTALK', required: true, style: { fontSize: 68, fontWeight: '800', color: '#4ade80', lineHeight: 1 } }),
      createTextField('subtitle', 'Subtitle', { x: 8, y: 50, width: 60, height: 10 }, { placeholder: 'The Future of Everything', style: { fontSize: 20, color: '#a78bfa' } }),
      createTextField('host', 'Host', { x: 8, y: 65, width: 50, height: 6 }, { placeholder: 'with Alex Chen', style: { fontSize: 16, color: 'rgba(255,255,255,0.5)' } }),
      createLogoField('logo', 'Logo', { x: 8, y: 80, width: 18, height: 12 }, { placeholder: 'Logo' }),
      createTextField('ep', 'Episode', { x: 65, y: 82, width: 30, height: 8 }, { placeholder: 'NEW EPISODES\nWEEKLY', style: { fontSize: 11, textAlign: 'right', color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 } })
    ],
    tags: ['podcast', 'cover', 'neon', 'tech', 'social']
  }
];

// ============= ZOOM BACKGROUND TEMPLATES =============

export const ZOOM_BACKGROUND_TEMPLATES: EditableTemplate[] = [
  {
    id: 'zoom-branded-office', name: 'Branded Office', description: 'Professional branded Zoom background',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'solid', value: '#f8fafc' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#1e3a5f', secondary: '#f8fafc', accent: '#3b82f6', text: '#1e3a5f', background: '#f8fafc' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 70, y: 5, width: 25, height: 12 }, { placeholder: 'Logo', required: true }),
      createTextField('event', 'Event', { x: 70, y: 80, width: 25, height: 8 }, { placeholder: 'Conference 2024', style: { fontSize: 14, textAlign: 'right', color: '#1e3a5f' } }),
      createTextField('url', 'URL', { x: 70, y: 90, width: 25, height: 5 }, { placeholder: 'event.com', style: { fontSize: 11, textAlign: 'right', color: '#6b7280' } })
    ],
    tags: ['zoom', 'background', 'virtual', 'branded', 'office', 'social']
  },
  {
    id: 'zoom-abstract-minimal', name: 'Abstract Minimal', description: 'Clean abstract Zoom background',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#ffffff', secondary: '#667eea', accent: '#ffffff', text: '#ffffff', background: '#667eea' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 72, y: 5, width: 22, height: 10 }, { placeholder: 'Logo' }),
      createTextField('event', 'Event', { x: 72, y: 85, width: 22, height: 8 }, { placeholder: '#Conference2024', style: { fontSize: 13, textAlign: 'right', color: 'rgba(255,255,255,0.7)' } })
    ],
    tags: ['zoom', 'background', 'abstract', 'gradient', 'social']
  },
  {
    id: 'zoom-dark-premium', name: 'Dark Premium Zoom', description: 'Dark professional Zoom background',
    assetType: AssetType.SocialPost, category: 'universal',
    dimensions: createPixelDimensions(1920, 1080),
    background: { type: 'solid', value: '#0d0d0d' },
    defaultFonts: { heading: 'Inter', body: 'Inter' },
    defaultColors: { primary: '#c9a84c', secondary: '#0d0d0d', accent: '#f0d78c', text: '#c9a84c', background: '#0d0d0d' },
    colorMode: 'RGB', dpi: 72,
    fields: [
      createLogoField('logo', 'Logo', { x: 72, y: 5, width: 22, height: 10 }, { placeholder: 'Logo' }),
      createTextField('name', 'Name', { x: 5, y: 80, width: 40, height: 8 }, { placeholder: 'Speaker Name', style: { fontSize: 16, color: '#c9a84c' } }),
      createTextField('title', 'Title', { x: 5, y: 90, width: 40, height: 6 }, { placeholder: 'CEO, Company Name', style: { fontSize: 12, color: 'rgba(201,168,76,0.6)' } })
    ],
    tags: ['zoom', 'background', 'dark', 'premium', 'social']
  }
];

export const ALL_SOCIAL_TEMPLATES: EditableTemplate[] = [
  ...SOCIAL_POST_TEMPLATES,
  ...SOCIAL_STORY_TEMPLATES,
  ...LINKEDIN_BANNER_TEMPLATES,
  ...YOUTUBE_THUMBNAIL_TEMPLATES,
  ...TWITTER_HEADER_TEMPLATES,
  ...PODCAST_COVER_TEMPLATES,
  ...ZOOM_BACKGROUND_TEMPLATES
];
