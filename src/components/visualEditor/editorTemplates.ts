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

// ============= BANNER TEMPLATES =============

const bannerEventTemplate: EditorTemplate = {
  id: 'banner-event',
  name: 'Event Banner',
  category: 'Banners',
  description: 'Wide promotional banner for events',
  tags: ['banner', 'event', 'promotion'],
  state: {
    width: 1920,
    height: 600,
    background: { type: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    elements: [
      createElement({
        id: 'event-title',
        type: 'text',
        name: 'Event Title',
        content: 'TECH CONFERENCE 2025',
        position: { x: 100, y: 180 },
        size: { width: 1000, height: 120 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 80,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.1,
          letterSpacing: 4,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'subtitle',
        type: 'text',
        name: 'Subtitle',
        content: 'Innovation • Networking • Future',
        position: { x: 100, y: 320 },
        size: { width: 800, height: 50 },
        style: { fill: '#ffffff', opacity: 0.9 },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'date-badge',
        type: 'shape',
        name: 'Date Badge',
        position: { x: 100, y: 420 },
        size: { width: 300, height: 60 },
        style: { fill: '#ffffff', borderRadius: 30 },
        zIndex: 3
      }),
      createElement({
        id: 'date-text',
        type: 'text',
        name: 'Date',
        content: 'MARCH 15-17, 2025',
        position: { x: 120, y: 430 },
        size: { width: 260, height: 40 },
        style: { fill: '#667eea' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 1600, y: 240 },
        size: { width: 220, height: 120 },
        zIndex: 5
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const bannerSponsorTemplate: EditorTemplate = {
  id: 'banner-sponsor',
  name: 'Sponsor Banner',
  category: 'Banners',
  description: 'Banner highlighting event sponsors',
  tags: ['banner', 'sponsor', 'partners'],
  state: {
    width: 1920,
    height: 400,
    background: { type: 'solid', value: '#0f172a' },
    elements: [
      createElement({
        id: 'header-text',
        type: 'text',
        name: 'Header',
        content: 'PROUDLY SPONSORED BY',
        position: { x: 660, y: 50 },
        size: { width: 600, height: 40 },
        style: { fill: '#94a3b8' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 6,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'sponsor-1',
        type: 'shape',
        name: 'Sponsor 1 Placeholder',
        position: { x: 160, y: 140 },
        size: { width: 280, height: 120 },
        style: { fill: '#1e293b', borderRadius: 12 },
        zIndex: 2
      }),
      createElement({
        id: 'sponsor-2',
        type: 'shape',
        name: 'Sponsor 2 Placeholder',
        position: { x: 500, y: 140 },
        size: { width: 280, height: 120 },
        style: { fill: '#1e293b', borderRadius: 12 },
        zIndex: 3
      }),
      createElement({
        id: 'sponsor-3',
        type: 'shape',
        name: 'Sponsor 3 Placeholder',
        position: { x: 840, y: 140 },
        size: { width: 280, height: 120 },
        style: { fill: '#1e293b', borderRadius: 12 },
        zIndex: 4
      }),
      createElement({
        id: 'sponsor-4',
        type: 'shape',
        name: 'Sponsor 4 Placeholder',
        position: { x: 1180, y: 140 },
        size: { width: 280, height: 120 },
        style: { fill: '#1e293b', borderRadius: 12 },
        zIndex: 5
      }),
      createElement({
        id: 'sponsor-5',
        type: 'shape',
        name: 'Sponsor 5 Placeholder',
        position: { x: 1520, y: 140 },
        size: { width: 280, height: 120 },
        style: { fill: '#1e293b', borderRadius: 12 },
        zIndex: 6
      }),
      createElement({
        id: 'divider',
        type: 'shape',
        name: 'Bottom Accent',
        position: { x: 0, y: 380 },
        size: { width: 1920, height: 20 },
        style: { fill: '#3b82f6' },
        zIndex: 7
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= TICKET TEMPLATES =============

const ticketEventTemplate: EditorTemplate = {
  id: 'ticket-event',
  name: 'Event Ticket',
  category: 'Tickets',
  description: 'Professional event admission ticket',
  tags: ['ticket', 'event', 'admission'],
  state: {
    width: 1200,
    height: 500,
    background: { type: 'solid', value: '#ffffff' },
    elements: [
      createElement({
        id: 'left-section',
        type: 'shape',
        name: 'Main Section',
        position: { x: 0, y: 0 },
        size: { width: 900, height: 500 },
        style: { fill: '#1e40af' },
        zIndex: 0
      }),
      createElement({
        id: 'right-section',
        type: 'shape',
        name: 'Stub Section',
        position: { x: 920, y: 0 },
        size: { width: 280, height: 500 },
        style: { fill: '#1e3a8a' },
        zIndex: 1
      }),
      createElement({
        id: 'event-name',
        type: 'text',
        name: 'Event Name',
        content: 'SUMMER MUSIC\nFESTIVAL',
        position: { x: 50, y: 80 },
        size: { width: 600, height: 150 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 52,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.1,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'date',
        type: 'text',
        name: 'Date',
        content: 'SATURDAY, JULY 20, 2025',
        position: { x: 50, y: 280 },
        size: { width: 500, height: 40 },
        style: { fill: '#93c5fd' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'venue',
        type: 'text',
        name: 'Venue',
        content: 'Central Park Amphitheater\nNew York, NY',
        position: { x: 50, y: 340 },
        size: { width: 400, height: 80 },
        style: { fill: '#ffffff', opacity: 0.9 },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.6,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'ticket-type',
        type: 'text',
        name: 'Ticket Type',
        content: 'VIP ACCESS',
        position: { x: 600, y: 400 },
        size: { width: 250, height: 50 },
        style: { fill: '#fbbf24' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'stub-event',
        type: 'text',
        name: 'Stub Event',
        content: 'SUMMER\nFEST',
        position: { x: 950, y: 100 },
        size: { width: 220, height: 100 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.1,
          letterSpacing: 2,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'qr-placeholder',
        type: 'qrcode',
        name: 'QR Code',
        qrData: 'https://event.com/ticket/ABC123',
        position: { x: 985, y: 280 },
        size: { width: 150, height: 150 },
        zIndex: 7
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 700, y: 60 },
        size: { width: 150, height: 80 },
        zIndex: 8
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const ticketVIPTemplate: EditorTemplate = {
  id: 'ticket-vip',
  name: 'VIP Pass',
  category: 'Tickets',
  description: 'Exclusive VIP access pass',
  tags: ['ticket', 'vip', 'pass'],
  state: {
    width: 600,
    height: 900,
    background: { type: 'gradient', value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' },
    elements: [
      createElement({
        id: 'gold-accent',
        type: 'shape',
        name: 'Gold Accent Top',
        position: { x: 0, y: 0 },
        size: { width: 600, height: 8 },
        style: { fill: '#d4af37' },
        zIndex: 0
      }),
      createElement({
        id: 'vip-badge',
        type: 'text',
        name: 'VIP Badge',
        content: 'VIP',
        position: { x: 200, y: 100 },
        size: { width: 200, height: 100 },
        style: { fill: '#d4af37' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 72,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 20,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'access-text',
        type: 'text',
        name: 'Access Text',
        content: 'ALL ACCESS PASS',
        position: { x: 100, y: 220 },
        size: { width: 400, height: 40 },
        style: { fill: '#ffffff', opacity: 0.8 },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 6,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'divider-1',
        type: 'shape',
        name: 'Divider',
        position: { x: 200, y: 300 },
        size: { width: 200, height: 1 },
        style: { fill: '#d4af37', opacity: 0.5 },
        zIndex: 3
      }),
      createElement({
        id: 'event-name',
        type: 'text',
        name: 'Event Name',
        content: 'GALA NIGHT\n2025',
        position: { x: 50, y: 350 },
        size: { width: 500, height: 150 },
        style: { fill: '#ffffff' },
        textStyle: {
          fontFamily: 'Playfair Display',
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
        zIndex: 4
      }),
      createElement({
        id: 'guest-name',
        type: 'text',
        name: 'Guest Name',
        content: 'Guest Name',
        position: { x: 100, y: 550 },
        size: { width: 400, height: 50 },
        style: { fill: '#d4af37' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 32,
          fontWeight: '400',
          fontStyle: 'italic',
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
        id: 'qr-placeholder',
        type: 'qrcode',
        name: 'QR Code',
        qrData: 'https://event.com/vip/XYZ789',
        position: { x: 200, y: 650 },
        size: { width: 200, height: 200 },
        zIndex: 6
      }),
      createElement({
        id: 'gold-accent-bottom',
        type: 'shape',
        name: 'Gold Accent Bottom',
        position: { x: 0, y: 892 },
        size: { width: 600, height: 8 },
        style: { fill: '#d4af37' },
        zIndex: 7
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= MENU TEMPLATES =============

const menuRestaurantTemplate: EditorTemplate = {
  id: 'menu-restaurant',
  name: 'Restaurant Menu',
  category: 'Menus',
  description: 'Elegant restaurant menu layout',
  tags: ['menu', 'restaurant', 'dining'],
  state: {
    width: 1200,
    height: 1800,
    background: { type: 'solid', value: '#fef7ed' },
    elements: [
      createElement({
        id: 'header-bg',
        type: 'shape',
        name: 'Header Background',
        position: { x: 0, y: 0 },
        size: { width: 1200, height: 250 },
        style: { fill: '#1c1917' },
        zIndex: 0
      }),
      createElement({
        id: 'restaurant-name',
        type: 'text',
        name: 'Restaurant Name',
        content: 'LA MAISON',
        position: { x: 100, y: 80 },
        size: { width: 1000, height: 80 },
        style: { fill: '#fef7ed' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 64,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 12,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'tagline',
        type: 'text',
        name: 'Tagline',
        content: 'Fine French Cuisine',
        position: { x: 350, y: 170 },
        size: { width: 500, height: 40 },
        style: { fill: '#d4af37' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 22,
          fontWeight: '400',
          fontStyle: 'italic',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'section-starters',
        type: 'text',
        name: 'Starters Section',
        content: 'STARTERS',
        position: { x: 100, y: 320 },
        size: { width: 1000, height: 50 },
        style: { fill: '#1c1917' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 6,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'divider-1',
        type: 'shape',
        name: 'Divider 1',
        position: { x: 450, y: 380 },
        size: { width: 300, height: 2 },
        style: { fill: '#d4af37' },
        zIndex: 4
      }),
      createElement({
        id: 'starter-item-1',
        type: 'text',
        name: 'Starter Item 1',
        content: 'French Onion Soup\nCaramelized onions, gruyère crouton — $14',
        position: { x: 100, y: 420 },
        size: { width: 1000, height: 80 },
        style: { fill: '#44403c' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'starter-item-2',
        type: 'text',
        name: 'Starter Item 2',
        content: 'Escargots de Bourgogne\nGarlic herb butter, fresh baguette — $18',
        position: { x: 100, y: 520 },
        size: { width: 1000, height: 80 },
        style: { fill: '#44403c' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'section-mains',
        type: 'text',
        name: 'Mains Section',
        content: 'MAIN COURSES',
        position: { x: 100, y: 680 },
        size: { width: 1000, height: 50 },
        style: { fill: '#1c1917' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 6,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 7
      }),
      createElement({
        id: 'divider-2',
        type: 'shape',
        name: 'Divider 2',
        position: { x: 450, y: 740 },
        size: { width: 300, height: 2 },
        style: { fill: '#d4af37' },
        zIndex: 8
      }),
      createElement({
        id: 'main-item-1',
        type: 'text',
        name: 'Main Item 1',
        content: 'Coq au Vin\nBraised chicken, pearl onions, mushrooms — $32',
        position: { x: 100, y: 780 },
        size: { width: 1000, height: 80 },
        style: { fill: '#44403c' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 9
      }),
      createElement({
        id: 'main-item-2',
        type: 'text',
        name: 'Main Item 2',
        content: 'Filet Mignon\nPeppercorn sauce, pommes purée — $45',
        position: { x: 100, y: 880 },
        size: { width: 1000, height: 80 },
        style: { fill: '#44403c' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 10
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 500, y: 1650 },
        size: { width: 200, height: 100 },
        zIndex: 11
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const menuCocktailTemplate: EditorTemplate = {
  id: 'menu-cocktail',
  name: 'Cocktail Menu',
  category: 'Menus',
  description: 'Stylish bar cocktail menu',
  tags: ['menu', 'bar', 'cocktail', 'drinks'],
  state: {
    width: 900,
    height: 1400,
    background: { type: 'solid', value: '#0c0c0c' },
    elements: [
      createElement({
        id: 'title',
        type: 'text',
        name: 'Title',
        content: 'COCKTAILS',
        position: { x: 100, y: 80 },
        size: { width: 700, height: 80 },
        style: { fill: '#f5f5f5' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 56,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 12,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'subtitle',
        type: 'text',
        name: 'Subtitle',
        content: 'Handcrafted with care',
        position: { x: 250, y: 170 },
        size: { width: 400, height: 40 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 20,
          fontWeight: '400',
          fontStyle: 'italic',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 2,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'drink-1-name',
        type: 'text',
        name: 'Drink 1 Name',
        content: 'OLD FASHIONED',
        position: { x: 80, y: 300 },
        size: { width: 600, height: 40 },
        style: { fill: '#f5f5f5' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'drink-1-price',
        type: 'text',
        name: 'Drink 1 Price',
        content: '$16',
        position: { x: 720, y: 300 },
        size: { width: 100, height: 40 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'drink-1-desc',
        type: 'text',
        name: 'Drink 1 Description',
        content: 'Bourbon, bitters, sugar, orange peel',
        position: { x: 80, y: 350 },
        size: { width: 600, height: 30 },
        style: { fill: '#737373' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '400',
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
        id: 'drink-2-name',
        type: 'text',
        name: 'Drink 2 Name',
        content: 'MANHATTAN',
        position: { x: 80, y: 440 },
        size: { width: 600, height: 40 },
        style: { fill: '#f5f5f5' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'drink-2-price',
        type: 'text',
        name: 'Drink 2 Price',
        content: '$18',
        position: { x: 720, y: 440 },
        size: { width: 100, height: 40 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 7
      }),
      createElement({
        id: 'drink-2-desc',
        type: 'text',
        name: 'Drink 2 Description',
        content: 'Rye whiskey, sweet vermouth, bitters',
        position: { x: 80, y: 490 },
        size: { width: 600, height: 30 },
        style: { fill: '#737373' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 8
      }),
      createElement({
        id: 'drink-3-name',
        type: 'text',
        name: 'Drink 3 Name',
        content: 'NEGRONI',
        position: { x: 80, y: 580 },
        size: { width: 600, height: 40 },
        style: { fill: '#f5f5f5' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 9
      }),
      createElement({
        id: 'drink-3-price',
        type: 'text',
        name: 'Drink 3 Price',
        content: '$17',
        position: { x: 720, y: 580 },
        size: { width: 100, height: 40 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 22,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'right',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 10
      }),
      createElement({
        id: 'drink-3-desc',
        type: 'text',
        name: 'Drink 3 Description',
        content: 'Gin, Campari, sweet vermouth',
        position: { x: 80, y: 630 },
        size: { width: 600, height: 30 },
        style: { fill: '#737373' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 11
      }),
      createElement({
        id: 'bottom-accent',
        type: 'shape',
        name: 'Bottom Accent',
        position: { x: 350, y: 1300 },
        size: { width: 200, height: 3 },
        style: { fill: '#c9a96e' },
        zIndex: 12
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

// ============= CERTIFICATE TEMPLATES =============

const certificateAchievementTemplate: EditorTemplate = {
  id: 'certificate-achievement',
  name: 'Achievement Certificate',
  category: 'Certificates',
  description: 'Formal achievement recognition certificate',
  tags: ['certificate', 'achievement', 'award'],
  state: {
    width: 1600,
    height: 1200,
    background: { type: 'solid', value: '#fffdf7' },
    elements: [
      createElement({
        id: 'border-outer',
        type: 'shape',
        name: 'Outer Border',
        position: { x: 40, y: 40 },
        size: { width: 1520, height: 1120 },
        style: { fill: 'transparent', stroke: '#c9a96e', strokeWidth: 4 },
        zIndex: 0
      }),
      createElement({
        id: 'border-inner',
        type: 'shape',
        name: 'Inner Border',
        position: { x: 60, y: 60 },
        size: { width: 1480, height: 1080 },
        style: { fill: 'transparent', stroke: '#c9a96e', strokeWidth: 1 },
        zIndex: 1
      }),
      createElement({
        id: 'header',
        type: 'text',
        name: 'Header',
        content: 'CERTIFICATE',
        position: { x: 200, y: 120 },
        size: { width: 1200, height: 80 },
        style: { fill: '#1a1a1a' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 56,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 20,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'of-achievement',
        type: 'text',
        name: 'Of Achievement',
        content: 'of Achievement',
        position: { x: 400, y: 200 },
        size: { width: 800, height: 50 },
        style: { fill: '#c9a96e' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 32,
          fontWeight: '400',
          fontStyle: 'italic',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 4,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'presented-to',
        type: 'text',
        name: 'Presented To',
        content: 'This certificate is proudly presented to',
        position: { x: 300, y: 320 },
        size: { width: 1000, height: 40 },
        style: { fill: '#666666' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 2,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'recipient-name',
        type: 'text',
        name: 'Recipient Name',
        content: 'John Smith',
        position: { x: 200, y: 400 },
        size: { width: 1200, height: 100 },
        style: { fill: '#1a1a1a' },
        textStyle: {
          fontFamily: 'Playfair Display',
          fontSize: 64,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: 2,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'name-underline',
        type: 'shape',
        name: 'Name Underline',
        position: { x: 400, y: 510 },
        size: { width: 800, height: 2 },
        style: { fill: '#c9a96e' },
        zIndex: 6
      }),
      createElement({
        id: 'description',
        type: 'text',
        name: 'Description',
        content: 'For outstanding performance and dedication in completing\nthe Advanced Leadership Program',
        position: { x: 200, y: 560 },
        size: { width: 1200, height: 100 },
        style: { fill: '#444444' },
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
        zIndex: 7
      }),
      createElement({
        id: 'date',
        type: 'text',
        name: 'Date',
        content: 'March 15, 2025',
        position: { x: 600, y: 720 },
        size: { width: 400, height: 40 },
        style: { fill: '#666666' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 8
      }),
      createElement({
        id: 'signature-line-1',
        type: 'shape',
        name: 'Signature Line 1',
        position: { x: 200, y: 950 },
        size: { width: 400, height: 2 },
        style: { fill: '#1a1a1a' },
        zIndex: 9
      }),
      createElement({
        id: 'signature-1-title',
        type: 'text',
        name: 'Signature 1 Title',
        content: 'Program Director',
        position: { x: 200, y: 970 },
        size: { width: 400, height: 30 },
        style: { fill: '#666666' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 10
      }),
      createElement({
        id: 'signature-line-2',
        type: 'shape',
        name: 'Signature Line 2',
        position: { x: 1000, y: 950 },
        size: { width: 400, height: 2 },
        style: { fill: '#1a1a1a' },
        zIndex: 11
      }),
      createElement({
        id: 'signature-2-title',
        type: 'text',
        name: 'Signature 2 Title',
        content: 'Executive Director',
        position: { x: 1000, y: 970 },
        size: { width: 400, height: 30 },
        style: { fill: '#666666' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'center',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 12
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Organization Logo',
        position: { x: 700, y: 820 },
        size: { width: 200, height: 100 },
        zIndex: 13
      })
    ],
    selectedIds: [],
    hoveredId: null,
    zoom: 1,
    pan: { x: 0, y: 0 }
  }
};

const certificateModernTemplate: EditorTemplate = {
  id: 'certificate-modern',
  name: 'Modern Certificate',
  category: 'Certificates',
  description: 'Contemporary minimalist certificate design',
  tags: ['certificate', 'modern', 'minimal'],
  state: {
    width: 1600,
    height: 1200,
    background: { type: 'solid', value: '#ffffff' },
    elements: [
      createElement({
        id: 'accent-bar',
        type: 'shape',
        name: 'Accent Bar',
        position: { x: 0, y: 0 },
        size: { width: 80, height: 1200 },
        style: { fill: '#2563eb' },
        zIndex: 0
      }),
      createElement({
        id: 'header',
        type: 'text',
        name: 'Certificate Label',
        content: 'CERTIFICATE',
        position: { x: 150, y: 150 },
        size: { width: 600, height: 50 },
        style: { fill: '#2563eb' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 8,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 1
      }),
      createElement({
        id: 'title',
        type: 'text',
        name: 'Title',
        content: 'Course\nCompletion',
        position: { x: 150, y: 220 },
        size: { width: 800, height: 180 },
        style: { fill: '#0f172a' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 72,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.1,
          letterSpacing: -2,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 2
      }),
      createElement({
        id: 'awarded-to',
        type: 'text',
        name: 'Awarded To',
        content: 'This certificate is awarded to',
        position: { x: 150, y: 480 },
        size: { width: 600, height: 40 },
        style: { fill: '#64748b' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 16,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 3
      }),
      createElement({
        id: 'recipient-name',
        type: 'text',
        name: 'Recipient Name',
        content: 'Sarah Johnson',
        position: { x: 150, y: 530 },
        size: { width: 1000, height: 80 },
        style: { fill: '#0f172a' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 48,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.2,
          letterSpacing: -1,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 4
      }),
      createElement({
        id: 'description',
        type: 'text',
        name: 'Description',
        content: 'For successfully completing the Digital Marketing\nProfessional Certification Program',
        position: { x: 150, y: 640 },
        size: { width: 800, height: 80 },
        style: { fill: '#64748b' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: '400',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.8,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 5
      }),
      createElement({
        id: 'date-label',
        type: 'text',
        name: 'Date Label',
        content: 'DATE',
        position: { x: 150, y: 800 },
        size: { width: 200, height: 30 },
        style: { fill: '#94a3b8' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 6
      }),
      createElement({
        id: 'date',
        type: 'text',
        name: 'Date',
        content: 'March 15, 2025',
        position: { x: 150, y: 830 },
        size: { width: 300, height: 40 },
        style: { fill: '#0f172a' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: '500',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 7
      }),
      createElement({
        id: 'credential-label',
        type: 'text',
        name: 'Credential Label',
        content: 'CREDENTIAL ID',
        position: { x: 500, y: 800 },
        size: { width: 200, height: 30 },
        style: { fill: '#94a3b8' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: '600',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 3,
          textTransform: 'uppercase',
          verticalAlign: 'middle'
        },
        zIndex: 8
      }),
      createElement({
        id: 'credential-id',
        type: 'text',
        name: 'Credential ID',
        content: 'CERT-2025-0315',
        position: { x: 500, y: 830 },
        size: { width: 300, height: 40 },
        style: { fill: '#0f172a' },
        textStyle: {
          fontFamily: 'Inter',
          fontSize: 20,
          fontWeight: '500',
          fontStyle: 'normal',
          textAlign: 'left',
          textDecoration: 'none',
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: 'none',
          verticalAlign: 'middle'
        },
        zIndex: 9
      }),
      createElement({
        id: 'logo-placeholder',
        type: 'logo',
        name: 'Logo',
        position: { x: 1300, y: 150 },
        size: { width: 200, height: 100 },
        zIndex: 10
      }),
      createElement({
        id: 'qr-placeholder',
        type: 'qrcode',
        name: 'Verification QR',
        qrData: 'https://verify.cert/CERT-2025-0315',
        position: { x: 1300, y: 950 },
        size: { width: 150, height: 150 },
        zIndex: 11
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
  signageDirectionalTemplate,
  // Banners
  bannerEventTemplate,
  bannerSponsorTemplate,
  // Tickets
  ticketEventTemplate,
  ticketVIPTemplate,
  // Menus
  menuRestaurantTemplate,
  menuCocktailTemplate,
  // Certificates
  certificateAchievementTemplate,
  certificateModernTemplate
];

export const TEMPLATE_CATEGORIES = [
  'All',
  'Blank',
  'Social Media',
  'Invitations',
  'Name Badges',
  'Signage',
  'Banners',
  'Tickets',
  'Menus',
  'Certificates'
];

export const getTemplatesByCategory = (category: string): EditorTemplate[] => {
  if (category === 'All') return EDITOR_TEMPLATES;
  return EDITOR_TEMPLATES.filter(t => t.category === category);
};

export const getTemplateById = (id: string): EditorTemplate | undefined => {
  return EDITOR_TEMPLATES.find(t => t.id === id);
};
