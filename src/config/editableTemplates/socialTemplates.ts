// Social Media Templates - Posts, stories, banners

import { EditableTemplate, TemplateField } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';

// Local helper functions
const createDimensions = (
  widthInches: number,
  heightInches: number,
  bleedInches: number = 0,
  safeZoneInches: number = 0,
  dpi: number = 72 // Digital uses 72 DPI
) => {
  let orientation: 'portrait' | 'landscape' | 'square';
  if (widthInches > heightInches) {
    orientation = 'landscape';
  } else if (heightInches > widthInches) {
    orientation = 'portrait';
  } else {
    orientation = 'square';
  }
  
  return {
    widthInches,
    heightInches,
    widthPx: Math.round(widthInches * dpi),
    heightPx: Math.round(heightInches * dpi),
    bleedInches,
    safeZoneInches,
    orientation
  };
};

// Pixel-based dimensions for social media
const createPixelDimensions = (
  widthPx: number,
  heightPx: number
) => {
  let orientation: 'portrait' | 'landscape' | 'square';
  if (widthPx > heightPx) {
    orientation = 'landscape';
  } else if (heightPx > widthPx) {
    orientation = 'portrait';
  } else {
    orientation = 'square';
  }
  
  return {
    widthInches: widthPx / 72,
    heightInches: heightPx / 72,
    widthPx,
    heightPx,
    bleedInches: 0,
    safeZoneInches: 0,
    orientation
  };
};

const createTextField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'text',
  position,
  style: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#1a1a1a',
    ...options.style
  },
  ...options
});

const createLogoField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'logo',
  position,
  style: {
    objectFit: 'contain',
    ...options.style
  },
  acceptedFormats: ['png', 'svg'],
  ...options
});

const createImageField = (
  id: string,
  name: string,
  position: TemplateField['position'],
  options: Partial<Omit<TemplateField, 'id' | 'name' | 'type' | 'position'>> = {}
): TemplateField => ({
  id,
  name,
  type: 'image',
  position,
  style: {
    objectFit: 'cover',
    borderRadius: 0,
    ...options.style
  },
  acceptedFormats: ['jpg', 'png', 'webp'],
  ...options
});

export const SOCIAL_POST_TEMPLATES: EditableTemplate[] = [
  {
    id: 'social-post-event-announcement',
    name: 'Event Announcement',
    description: 'Square post for event announcements',
    assetType: AssetType.SocialPost,
    category: 'universal',
    dimensions: createPixelDimensions(1080, 1080),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    defaultFonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#667eea'
    },
    colorMode: 'RGB',
    dpi: 72,
    fields: [
      createLogoField('logo', 'Event Logo',
        { x: 35, y: 5, width: 30, height: 15 },
        { placeholder: 'Event logo' }
      ),
      createTextField('event-type', 'Event Type',
        { x: 10, y: 22, width: 80, height: 5 },
        {
          placeholder: 'ANNUAL CONFERENCE',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: 'rgba(255,255,255,0.9)', letterSpacing: 4, textTransform: 'uppercase' }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 30, width: 90, height: 18 },
        {
          placeholder: 'INNOVATE 2024',
          required: true,
          style: { fontSize: 56, fontWeight: '800', textAlign: 'center', color: '#ffffff', lineHeight: 1.1 }
        }
      ),
      createImageField('featured-image', 'Featured Image',
        { x: 10, y: 52, width: 80, height: 25 },
        { 
          placeholder: 'Event photo or graphic',
          style: { borderRadius: 12 }
        }
      ),
      createTextField('date', 'Date',
        { x: 15, y: 80, width: 70, height: 6 },
        {
          placeholder: 'March 15-17, 2024',
          style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('cta', 'Call to Action',
        { x: 25, y: 88, width: 50, height: 6 },
        {
          placeholder: 'Register Now →',
          style: { fontSize: 16, fontWeight: '600', textAlign: 'center', color: '#ffffff' }
        }
      )
    ],
    tags: ['social', 'instagram', 'square', 'announcement']
  },
  {
    id: 'social-post-speaker-spotlight',
    name: 'Speaker Spotlight',
    description: 'Feature a speaker or guest',
    assetType: AssetType.SocialPost,
    category: 'universal',
    dimensions: createPixelDimensions(1080, 1080),
    background: {
      type: 'solid',
      value: '#0f172a'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#0f172a',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#0f172a'
    },
    colorMode: 'RGB',
    dpi: 72,
    fields: [
      createTextField('label', 'Label',
        { x: 10, y: 8, width: 40, height: 5 },
        {
          placeholder: 'FEATURED SPEAKER',
          style: { fontSize: 12, fontWeight: '600', color: '#f59e0b', letterSpacing: 2 }
        }
      ),
      createLogoField('logo', 'Event Logo',
        { x: 75, y: 5, width: 20, height: 10 },
        { placeholder: 'Event logo' }
      ),
      createImageField('speaker-photo', 'Speaker Photo',
        { x: 15, y: 18, width: 70, height: 45 },
        { 
          placeholder: 'Speaker headshot',
          required: true,
          style: { borderRadius: 12 }
        }
      ),
      createTextField('speaker-name', 'Speaker Name',
        { x: 10, y: 66, width: 80, height: 10 },
        {
          placeholder: 'Dr. Jane Smith',
          required: true,
          style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('title', 'Title & Company',
        { x: 10, y: 77, width: 80, height: 6 },
        {
          placeholder: 'CEO, TechCorp',
          style: { fontSize: 16, textAlign: 'center', color: '#94a3b8' }
        }
      ),
      createTextField('topic', 'Talk Topic',
        { x: 10, y: 86, width: 80, height: 8 },
        {
          placeholder: '"The Future of AI in Healthcare"',
          style: { fontSize: 14, textAlign: 'center', color: '#3b82f6', fontStyle: 'italic' }
        }
      )
    ],
    tags: ['social', 'speaker', 'spotlight', 'feature']
  }
];

export const SOCIAL_STORY_TEMPLATES: EditableTemplate[] = [
  {
    id: 'story-event-countdown',
    name: 'Event Countdown',
    description: 'Vertical story for event countdown',
    assetType: AssetType.SocialStory,
    category: 'universal',
    dimensions: createPixelDimensions(1080, 1920),
    background: {
      type: 'gradient',
      value: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)'
    },
    defaultFonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#1e3a5f',
      secondary: '#3b82f6',
      accent: '#f59e0b',
      text: '#ffffff',
      background: '#1e3a5f'
    },
    colorMode: 'RGB',
    dpi: 72,
    fields: [
      createLogoField('logo', 'Event Logo',
        { x: 30, y: 8, width: 40, height: 10 },
        { placeholder: 'Event logo' }
      ),
      createTextField('countdown-label', 'Countdown Label',
        { x: 10, y: 22, width: 80, height: 4 },
        {
          placeholder: 'STARTS IN',
          style: { fontSize: 14, fontWeight: '600', textAlign: 'center', color: '#f59e0b', letterSpacing: 4 }
        }
      ),
      createTextField('days', 'Days',
        { x: 20, y: 28, width: 60, height: 12 },
        {
          placeholder: '5 DAYS',
          style: { fontSize: 72, fontWeight: '800', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createImageField('event-image', 'Event Image',
        { x: 5, y: 42, width: 90, height: 25 },
        { 
          placeholder: 'Event teaser image',
          style: { borderRadius: 16 }
        }
      ),
      createTextField('event-name', 'Event Name',
        { x: 5, y: 70, width: 90, height: 8 },
        {
          placeholder: 'TECH SUMMIT 2024',
          style: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#ffffff' }
        }
      ),
      createTextField('date-location', 'Date & Location',
        { x: 10, y: 80, width: 80, height: 5 },
        {
          placeholder: 'March 15 • San Francisco',
          style: { fontSize: 16, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }
        }
      ),
      {
        id: 'swipe-up',
        type: 'text',
        name: 'Swipe Up CTA',
        position: { x: 30, y: 90, width: 40, height: 5 },
        placeholder: '↑ SWIPE UP TO REGISTER',
        style: { fontSize: 12, fontWeight: '600', textAlign: 'center', color: '#f59e0b' }
      }
    ],
    tags: ['story', 'countdown', 'instagram', 'vertical']
  }
];

export const LINKEDIN_BANNER_TEMPLATES: EditableTemplate[] = [
  {
    id: 'linkedin-banner-professional',
    name: 'Professional LinkedIn Banner',
    description: 'LinkedIn profile banner for professionals',
    assetType: AssetType.LinkedInBanner,
    category: 'universal',
    dimensions: createPixelDimensions(1584, 396),
    background: {
      type: 'gradient',
      value: 'linear-gradient(90deg, #0077b5 0%, #005582 100%)'
    },
    defaultFonts: {
      heading: 'Inter',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#0077b5',
      secondary: '#005582',
      accent: '#ffffff',
      text: '#ffffff',
      background: '#0077b5'
    },
    colorMode: 'RGB',
    dpi: 72,
    fields: [
      createLogoField('logo', 'Company Logo',
        { x: 5, y: 20, width: 15, height: 60 },
        { placeholder: 'Company logo' }
      ),
      createTextField('headline', 'Headline',
        { x: 25, y: 25, width: 50, height: 25 },
        {
          placeholder: 'Transforming Ideas into Reality',
          style: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' }
        }
      ),
      createTextField('tagline', 'Tagline',
        { x: 25, y: 55, width: 50, height: 15 },
        {
          placeholder: 'Innovation • Strategy • Growth',
          style: { fontSize: 14, color: 'rgba(255,255,255,0.9)' }
        }
      ),
      createTextField('website', 'Website',
        { x: 75, y: 70, width: 20, height: 10 },
        {
          placeholder: 'company.com',
          style: { fontSize: 12, textAlign: 'right', color: 'rgba(255,255,255,0.8)' }
        }
      )
    ],
    tags: ['linkedin', 'banner', 'professional', 'header']
  }
];

export const YOUTUBE_THUMBNAIL_TEMPLATES: EditableTemplate[] = [
  {
    id: 'youtube-thumbnail-event',
    name: 'Event YouTube Thumbnail',
    description: 'Eye-catching thumbnail for event videos',
    assetType: AssetType.YouTubeThumbnail,
    category: 'universal',
    dimensions: createPixelDimensions(1280, 720),
    background: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    },
    defaultFonts: {
      heading: 'Poppins',
      body: 'Inter'
    },
    defaultColors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      accent: '#fbbf24',
      text: '#ffffff',
      background: '#ef4444'
    },
    colorMode: 'RGB',
    dpi: 72,
    fields: [
      createImageField('background-image', 'Background Image',
        { x: 0, y: 0, width: 100, height: 100 },
        { 
          placeholder: 'Background photo',
          style: { opacity: 0.3 }
        }
      ),
      createTextField('title', 'Title',
        { x: 5, y: 20, width: 65, height: 35 },
        {
          placeholder: 'EVENT HIGHLIGHTS',
          required: true,
          style: { fontSize: 48, fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }
        }
      ),
      createTextField('subtitle', 'Subtitle',
        { x: 5, y: 60, width: 50, height: 15 },
        {
          placeholder: 'Conference 2024',
          style: { fontSize: 24, fontWeight: '600', color: '#fbbf24' }
        }
      ),
      createImageField('speaker-image', 'Featured Image',
        { x: 60, y: 10, width: 38, height: 80 },
        { 
          placeholder: 'Speaker or event image',
          style: { objectFit: 'contain' }
        }
      ),
      createLogoField('logo', 'Logo',
        { x: 5, y: 80, width: 15, height: 15 },
        { placeholder: 'Channel logo' }
      )
    ],
    tags: ['youtube', 'thumbnail', 'video', 'event']
  }
];

export const ALL_SOCIAL_TEMPLATES: EditableTemplate[] = [
  ...SOCIAL_POST_TEMPLATES,
  ...SOCIAL_STORY_TEMPLATES,
  ...LINKEDIN_BANNER_TEMPLATES,
  ...YOUTUBE_THUMBNAIL_TEMPLATES
];
