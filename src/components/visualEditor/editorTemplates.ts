// Visual Editor Templates - Pre-made design templates
import type { CanvasState, CanvasElement } from '@/types/visualEditor.types';

export interface EditorTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  state: CanvasState;
}

// Helper to create elements with proper defaults
const createElement = (partial: Partial<CanvasElement> & { id: string; type: CanvasElement['type'] }): CanvasElement => ({
  name: partial.name || 'Element',
  position: partial.position || { x: 0, y: 0 },
  size: partial.size || { width: 100, height: 100 },
  transform: partial.transform || { rotation: 0, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0 },
  style: partial.style || { fill: '#3b82f6', opacity: 1 },
  locked: false,
  visible: true,
  zIndex: partial.zIndex || 0,
  ...partial
});

// ============= SOCIAL MEDIA TEMPLATES =============

const socialAnnouncementTemplate: EditorTemplate = {
  id: 'social-announcement',
  name: 'Event Announcement',
  category: 'Social Media',
  description: 'Bold event announcement with date highlight',
  tags: ['social', 'announcement', 'event'],
  state: {
    width: 1080,
    height: 1080,
    background: { type: 'solid', value: '#1a1a2e' },
    elements: [
      createElement({
        id: 'bg-shape',
        type: 'shape',
        name: 'Background Accent',
        position: { x: 0, y: 700 },
        size: { width: 1080, height: 380 },
        style: { fill: '#e94560', opacity: 0.9 },
        zIndex: 0
      }),
      createElement({
        id: 'date-circle',
        type: 'shape',
        name: 'Date Circle',
        shapeType: 'circle',
        position: { x: 390, y: 150 },
        size: { width: 300, height: 300 },
        style: { fill: '#e94560' },
        zIndex: 1
      }),
      createElement({
        id: 'date-text',
        type: 'text',
        name: 'Date',
        content: 'MAR 15',
        position: { x: 415, y: 250 },
        size: { width: 250, height: 80 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'event-title',
        type: 'text',
        name: 'Event Title',
        content: 'ANNUAL\nCONFERENCE',
        position: { x: 90, y: 500 },
        size: { width: 900, height: 180 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.1,
          letterSpacing: 4,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'tagline',
        type: 'text',
        name: 'Tagline',
        content: 'Innovation • Networking • Growth',
        position: { x: 140, y: 780 },
        size: { width: 800, height: 50 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'location',
        type: 'text',
        name: 'Location',
        content: 'San Francisco, CA',
        position: { x: 290, y: 880 },
        size: { width: 500, height: 40 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: '500',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 440, y: 950 },
        size: { width: 200, height: 80 },
        zIndex: 6
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const socialMinimalTemplate: EditorTemplate = {
  id: 'social-minimal',
  name: 'Minimal Quote',
  category: 'Social Media',
  description: 'Clean, minimal design for quotes or announcements',
  tags: ['social', 'minimal', 'quote'],
  state: {
    width: 1080,
    height: 1080,
    background: { type: 'solid', value: '#fafafa' },
    elements: [
      createElement({
        id: 'accent-line',
        type: 'shape',
        name: 'Accent Line',
        position: { x: 490, y: 300 },
        size: { width: 100, height: 4 },
        style: { fill: '#000000' },
        zIndex: 0
      }),
      createElement({
        id: 'quote-text',
        type: 'text',
        name: 'Quote',
        content: '"Design is not just what it looks like. Design is how it works."',
        position: { x: 140, y: 400 },
        size: { width: 800, height: 200 },
        style: { fill: '#1a1a1a' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 42,
          fontWeight: '400',
          fontStyle: 'italic',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.5,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'author',
        type: 'text',
        name: 'Author',
        content: '— Steve Jobs',
        position: { x: 340, y: 650 },
        size: { width: 400, height: 40 },
        style: { fill: '#666666' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '500',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 440, y: 900 },
        size: { width: 200, height: 60 },
        zIndex: 3
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= INVITATION TEMPLATES =============

const invitationElegantTemplate: EditorTemplate = {
  id: 'invitation-elegant',
  name: 'Elegant Invitation',
  category: 'Invitations',
  description: 'Sophisticated invitation with classic styling',
  tags: ['invitation', 'elegant', 'formal'],
  state: {
    width: 1500,
    height: 2100,
    background: { type: 'solid', value: '#fef9f3' },
    elements: [
      createElement({
        id: 'border',
        type: 'shape',
        name: 'Border',
        position: { x: 50, y: 50 },
        size: { width: 1400, height: 2000 },
        style: { fill: 'transparent', stroke: '#c9a96e', strokeWidth: 2 },
        zIndex: 0
      }),
      createElement({
        id: 'inner-border',
        type: 'shape',
        name: 'Inner Border',
        position: { x: 80, y: 80 },
        size: { width: 1340, height: 1940 },
        style: { fill: 'transparent', stroke: '#c9a96e', strokeWidth: 1 },
        zIndex: 1
      }),
      createElement({
        id: 'invited-text',
        type: 'text',
        name: 'You Are Invited',
        content: 'You Are Cordially Invited',
        position: { x: 200, y: 300 },
        size: { width: 1100, height: 60 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 28,
          fontWeight: '400',
          fontStyle: 'italic',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 4,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'event-title',
        type: 'text',
        name: 'Event Title',
        content: 'Annual Gala\nDinner',
        position: { x: 150, y: 450 },
        size: { width: 1200, height: 250 },
        style: { fill: '#2d3436' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 72,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'divider',
        type: 'shape',
        name: 'Divider',
        position: { x: 600, y: 750 },
        size: { width: 300, height: 2 },
        style: { fill: '#c9a96e' },
        zIndex: 4
      }),
      createElement({
        id: 'date-time',
        type: 'text',
        name: 'Date & Time',
        content: 'Saturday, March 15th, 2025\nat Seven O\'Clock in the Evening',
        position: { x: 200, y: 850 },
        size: { width: 1100, height: 120 },
        style: { fill: '#2d3436' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'venue',
        type: 'text',
        name: 'Venue',
        content: 'The Grand Ballroom\n123 Elegant Avenue, San Francisco',
        position: { x: 200, y: 1050 },
        size: { width: 1100, height: 120 },
        style: { fill: '#636e72' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'dress-code',
        type: 'text',
        name: 'Dress Code',
        content: 'Black Tie',
        position: { x: 500, y: 1300 },
        size: { width: 500, height: 50 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 4,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 7
      }),
      createElement({
        id: 'rsvp',
        type: 'text',
        name: 'RSVP',
        content: 'RSVP by March 1st\nrsvp@yourevent.com',
        position: { x: 300, y: 1500 },
        size: { width: 900, height: 100 },
        style: { fill: '#2d3436' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 8
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 600, y: 1750 },
        size: { width: 300, height: 120 },
        zIndex: 9
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= NAME BADGE TEMPLATES =============

const badgeModernTemplate: EditorTemplate = {
  id: 'badge-modern',
  name: 'Modern Badge',
  category: 'Name Badges',
  description: 'Clean modern conference badge',
  tags: ['badge', 'modern', 'conference'],
  state: {
    width: 1200,
    height: 900,
    background: { type: 'solid', value: '#ffffff' },
    elements: [
      createElement({
        id: 'header-bar',
        type: 'shape',
        name: 'Header Bar',
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 200 },
        style: { fill: '#2563eb' },
        zIndex: 0
      }),
      createElement({
        id: 'event-name',
        type: 'text',
        name: 'Event Name',
        content: 'TECH SUMMIT 2025',
        position: { x: 50, y: 70 },
        size: { width: 800, height: 60 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 32,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Event Logo',
        position: { x: 950, y: 50 },
        size: { width: 200, height: 100 },
        zIndex: 2
      }),
      createElement({
        id: 'attendee-name',
        type: 'text',
        name: 'Attendee Name',
        content: 'Jane Smith',
        position: { x: 50, y: 280 },
        size: { width: 1100, height: 120 },
        style: { fill: '#1a1a1a' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: -1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'title',
        type: 'text',
        name: 'Title',
        content: 'Senior Product Designer',
        position: { x: 50, y: 420 },
        size: { width: 800, height: 50 },
        style: { fill: '#6b7280' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: '500',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'company',
        type: 'text',
        name: 'Company',
        content: 'Acme Corporation',
        position: { x: 50, y: 480 },
        size: { width: 800, height: 50 },
        style: { fill: '#2563eb' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'badge-type',
        type: 'shape',
        name: 'Badge Type BG',
        position: { x: 50, y: 750 },
        size: { width: 200, height: 50 },
        style: { fill: '#10b981', borderRadius: 25 },
        zIndex: 6
      }),
      createElement({
        id: 'badge-type-text',
        type: 'text',
        name: 'Badge Type',
        content: 'SPEAKER',
        position: { x: 60, y: 758 },
        size: { width: 180, height: 35 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 7
      }),
      createElement({
        id: 'qr-placeholder',
        type: 'qrcode',
        name: 'QR Code',
        qrData: 'https://event.com/attendee/12345',
        position: { x: 1000, y: 650 },
        size: { width: 150, height: 150 },
        zIndex: 8
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= SIGNAGE TEMPLATES =============

const signageDirectionalTemplate: EditorTemplate = {
  id: 'signage-directional',
  name: 'Directional Sign',
  category: 'Signage',
  description: 'Clear wayfinding signage',
  tags: ['signage', 'directional', 'wayfinding'],
  state: {
    width: 2400,
    height: 1800,
    background: { type: 'solid', value: '#1e3a5f' },
    elements: [
      createElement({
        id: 'header',
        type: 'shape',
        name: 'Header Bar',
        position: { x: 0, y: 0 },
        size: { width: 2400, height: 300 },
        style: { fill: '#0f2744' },
        zIndex: 0
      }),
      createElement({
        id: 'event-name',
        type: 'text',
        name: 'Event Name',
        content: 'GLOBAL SUMMIT 2025',
        position: { x: 100, y: 100 },
        size: { width: 1500, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 64,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 4,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 2000, y: 75 },
        size: { width: 300, height: 150 },
        zIndex: 2
      }),
      createElement({
        id: 'arrow-1',
        type: 'text',
        name: 'Direction 1',
        content: '← Registration',
        position: { x: 100, y: 450 },
        size: { width: 1000, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'arrow-2',
        type: 'text',
        name: 'Direction 2',
        content: 'Main Stage →',
        position: { x: 1300, y: 450 },
        size: { width: 1000, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'divider',
        type: 'shape',
        name: 'Divider',
        position: { x: 100, y: 650 },
        size: { width: 2200, height: 2 },
        style: { fill: '#ffffff', opacity: 0.3 },
        zIndex: 5
      }),
      createElement({
        id: 'arrow-3',
        type: 'text',
        name: 'Direction 3',
        content: '← Breakout Rooms',
        position: { x: 100, y: 750 },
        size: { width: 1000, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'arrow-4',
        type: 'text',
        name: 'Direction 4',
        content: 'Networking Lounge →',
        position: { x: 1100, y: 750 },
        size: { width: 1200, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 7
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= BLANK TEMPLATES =============

const blankSquareTemplate: EditorTemplate = {
  id: 'blank-square',
  name: 'Blank Square',
  category: 'Blank',
  description: 'Start with a blank 1080×1080 canvas',
  tags: ['blank', 'square', 'social'],
  state: {
    width: 1080,
    height: 1080,
    background: { type: 'solid', value: '#ffffff' },
    elements: [],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const blankPortraitTemplate: EditorTemplate = {
  id: 'blank-portrait',
  name: 'Blank Portrait',
  category: 'Blank',
  description: 'Start with a blank portrait canvas',
  tags: ['blank', 'portrait', 'story'],
  state: {
    width: 1080,
    height: 1920,
    background: { type: 'solid', value: '#ffffff' },
    elements: [],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const blankLandscapeTemplate: EditorTemplate = {
  id: 'blank-landscape',
  name: 'Blank Landscape',
  category: 'Blank',
  description: 'Start with a blank landscape canvas',
  tags: ['blank', 'landscape', 'banner'],
  state: {
    width: 1920,
    height: 1080,
    background: { type: 'solid', value: '#ffffff' },
    elements: [],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= EXPORT ALL TEMPLATES =============

export const EDITOR_TEMPLATES: EditorTemplate[] = [
  // Blank templates first
  blankSquareTemplate,
  blankPortraitTemplate,
  blankLandscapeTemplate,
  // Social media
  socialAnnouncementTemplate,
  socialMinimalTemplate,
  // Invitations
  invitationElegantTemplate,
  // Badges
  badgeModernTemplate,
  // Signage
  signageDirectionalTemplate
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Blank',
  'Social Media',
  'Invitations',
  'Name Badges',
  'Signage'
];

export const getTemplatesByCategory = (category: string): EditorTemplate[] => {
  if (category === 'All') return EDITOR_TEMPLATES;
  return EDITOR_TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string): EditorTemplate | undefined => {
  return EDITOR_TEMPLATES.find(t => t.id === id);
};
