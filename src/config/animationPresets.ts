// Animation Presets for Animated Banner System
// Each preset defines Framer Motion variants for banner elements

export interface AnimationKeyframe {
  opacity?: number;
  x?: number | string;
  y?: number | string;
  scale?: number;
  rotate?: number;
  filter?: string;
  clipPath?: string;
}

export interface AnimationPreset {
  id: string;
  name: string;
  description: string;
  category: 'text-reveal' | 'zoom' | 'slide' | 'fade' | 'dynamic' | 'cinematic';
  icon: string;
  duration: number; // seconds
  /** Framer Motion initial state */
  initial: AnimationKeyframe;
  /** Framer Motion animate state */
  animate: AnimationKeyframe;
  /** Framer Motion transition config */
  transition: {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    type?: string;
    stiffness?: number;
    damping?: number;
    repeat?: number;
    repeatType?: 'loop' | 'reverse' | 'mirror';
  };
  /** Stagger delay for child elements */
  staggerChildren?: number;
  /** Whether this works best with text, images, or both */
  bestFor: ('text' | 'image' | 'logo' | 'background')[];
}

export interface AnimationLayer {
  id: string;
  type: 'text' | 'image' | 'logo' | 'shape' | 'overlay';
  content: string;
  preset: string; // preset id
  delay: number; // seconds
  style: {
    fontSize?: number;
    fontWeight?: string;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    x: number; // % from left
    y: number; // % from top
    width: number; // % of canvas
    height: number; // % of canvas
    textAlign?: 'left' | 'center' | 'right';
    objectFit?: 'cover' | 'contain' | 'fill';
    borderRadius?: number;
    opacity?: number;
    zIndex?: number;
  };
}

export interface AnimatedBannerConfig {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  backgroundImage?: string;
  backgroundGradient?: string;
  layers: AnimationLayer[];
  totalDuration: number; // seconds
  loop: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════

export const ANIMATION_PRESETS: AnimationPreset[] = [
  // TEXT REVEALS
  {
    id: 'fade-up',
    name: 'Fade Up',
    description: 'Text fades in while sliding upward',
    category: 'text-reveal',
    icon: 'ArrowUp',
    duration: 0.8,
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    staggerChildren: 0.1,
    bestFor: ['text'],
  },
  {
    id: 'fade-down',
    name: 'Fade Down',
    description: 'Text fades in while sliding downward',
    category: 'text-reveal',
    icon: 'ArrowDown',
    duration: 0.8,
    initial: { opacity: 0, y: -30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    staggerChildren: 0.1,
    bestFor: ['text'],
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Characters appear one by one from left',
    category: 'text-reveal',
    icon: 'Type',
    duration: 1.5,
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.05 },
    staggerChildren: 0.05,
    bestFor: ['text'],
  },
  {
    id: 'text-clip',
    name: 'Text Clip Reveal',
    description: 'Text revealed with a clipping mask from left to right',
    category: 'text-reveal',
    icon: 'Scissors',
    duration: 1,
    initial: { clipPath: 'inset(0 100% 0 0)' },
    animate: { clipPath: 'inset(0 0% 0 0)' },
    transition: { duration: 1, ease: [0.77, 0, 0.175, 1] },
    bestFor: ['text', 'image'],
  },
  {
    id: 'pop-in',
    name: 'Pop In',
    description: 'Element pops in with a bouncy spring effect',
    category: 'text-reveal',
    icon: 'Zap',
    duration: 0.6,
    initial: { opacity: 0, scale: 0.3 },
    animate: { opacity: 1, scale: 1 },
    transition: { type: 'spring', stiffness: 300, damping: 15 },
    bestFor: ['text', 'logo', 'image'],
  },

  // ZOOM EFFECTS
  {
    id: 'zoom-in',
    name: 'Zoom In',
    description: 'Smooth zoom in from scaled down',
    category: 'zoom',
    icon: 'ZoomIn',
    duration: 1.2,
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
    bestFor: ['image', 'logo', 'text'],
  },
  {
    id: 'zoom-out',
    name: 'Zoom Out',
    description: 'Starts large and zooms to normal size',
    category: 'zoom',
    icon: 'ZoomOut',
    duration: 1.2,
    initial: { scale: 1.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] },
    bestFor: ['image', 'background'],
  },
  {
    id: 'ken-burns',
    name: 'Ken Burns',
    description: 'Slow dramatic zoom with slight pan',
    category: 'zoom',
    icon: 'Film',
    duration: 5,
    initial: { scale: 1 },
    animate: { scale: 1.15 },
    transition: { duration: 5, ease: 'linear' },
    bestFor: ['background', 'image'],
  },
  {
    id: 'pulse-zoom',
    name: 'Pulse Zoom',
    description: 'Rhythmic zoom pulsing effect',
    category: 'zoom',
    icon: 'Activity',
    duration: 2,
    initial: { scale: 1 },
    animate: { scale: 1.05 },
    transition: { duration: 1, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
    bestFor: ['logo', 'text'],
  },

  // SLIDE TRANSITIONS
  {
    id: 'slide-left',
    name: 'Slide Left',
    description: 'Slides in from the right side',
    category: 'slide',
    icon: 'ArrowLeft',
    duration: 0.8,
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    bestFor: ['text', 'image'],
  },
  {
    id: 'slide-right',
    name: 'Slide Right',
    description: 'Slides in from the left side',
    category: 'slide',
    icon: 'ArrowRight',
    duration: 0.8,
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    bestFor: ['text', 'image'],
  },
  {
    id: 'slide-bounce',
    name: 'Slide Bounce',
    description: 'Slides in with a bouncy overshoot',
    category: 'slide',
    icon: 'ArrowLeftRight',
    duration: 1,
    initial: { x: '-100%' },
    animate: { x: 0 },
    transition: { type: 'spring', stiffness: 100, damping: 12 },
    bestFor: ['text', 'logo'],
  },

  // FADE EFFECTS
  {
    id: 'fade-in',
    name: 'Fade In',
    description: 'Simple elegant fade in',
    category: 'fade',
    icon: 'Sun',
    duration: 1,
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 1, ease: 'easeOut' },
    bestFor: ['text', 'image', 'logo', 'background'],
  },
  {
    id: 'fade-blur',
    name: 'Fade & Blur',
    description: 'Fades in while removing blur',
    category: 'fade',
    icon: 'Eye',
    duration: 1.2,
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    transition: { duration: 1.2, ease: 'easeOut' },
    bestFor: ['text', 'image'],
  },
  {
    id: 'flash',
    name: 'Flash In',
    description: 'Quick flash of white before reveal',
    category: 'fade',
    icon: 'Zap',
    duration: 0.6,
    initial: { opacity: 0, scale: 1.1 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
    bestFor: ['text', 'logo'],
  },

  // DYNAMIC EFFECTS
  {
    id: 'rotate-in',
    name: 'Rotate In',
    description: 'Spins into view with rotation',
    category: 'dynamic',
    icon: 'RotateCw',
    duration: 1,
    initial: { rotate: -180, opacity: 0, scale: 0.5 },
    animate: { rotate: 0, opacity: 1, scale: 1 },
    transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
    bestFor: ['logo', 'image'],
  },
  {
    id: 'swing',
    name: 'Swing',
    description: 'Pendulum swing animation',
    category: 'dynamic',
    icon: 'ArrowLeftRight',
    duration: 1.5,
    initial: { rotate: 15, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    transition: { type: 'spring', stiffness: 200, damping: 10 },
    bestFor: ['text', 'logo'],
  },
  {
    id: 'float',
    name: 'Float',
    description: 'Gentle floating up and down loop',
    category: 'dynamic',
    icon: 'CloudRain',
    duration: 3,
    initial: { y: 0 },
    animate: { y: -10 },
    transition: { duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
    bestFor: ['logo', 'image'],
  },

  // CINEMATIC
  {
    id: 'cinematic-reveal',
    name: 'Cinematic Reveal',
    description: 'Letterbox bars retract to reveal content',
    category: 'cinematic',
    icon: 'Film',
    duration: 1.5,
    initial: { clipPath: 'inset(40% 0 40% 0)', opacity: 0 },
    animate: { clipPath: 'inset(0% 0 0% 0)', opacity: 1 },
    transition: { duration: 1.5, ease: [0.77, 0, 0.175, 1] },
    bestFor: ['background', 'image'],
  },
  {
    id: 'glitch',
    name: 'Glitch',
    description: 'Digital glitch effect entrance',
    category: 'cinematic',
    icon: 'MonitorX',
    duration: 0.5,
    initial: { opacity: 0, x: -5, scale: 1.02 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: { duration: 0.15, repeat: 3, repeatType: 'reverse' },
    bestFor: ['text', 'logo'],
  },
  {
    id: 'split-reveal',
    name: 'Split Reveal',
    description: 'Content splits apart to reveal from center',
    category: 'cinematic',
    icon: 'Columns',
    duration: 1.2,
    initial: { clipPath: 'inset(0 50% 0 50%)' },
    animate: { clipPath: 'inset(0 0% 0 0%)' },
    transition: { duration: 1.2, ease: [0.77, 0, 0.175, 1] },
    bestFor: ['image', 'background', 'text'],
  },
];

// ═══════════════════════════════════════════════════════════════
// PRESET BANNER TEMPLATES (pre-configured animation combos)
// ═══════════════════════════════════════════════════════════════

export interface BannerTemplate {
  id: string;
  name: string;
  description: string;
  category: 'social-post' | 'social-story' | 'banner-ad' | 'email-header' | 'linkedin' | 'youtube';
  aspectRatio: string;
  width: number;
  height: number;
  layers: AnimationLayer[];
  totalDuration: number;
}

export const BANNER_TEMPLATES: BannerTemplate[] = [
  {
    id: 'social-promo-1',
    name: 'Bold Event Promo',
    description: 'Eye-catching social post with staggered text reveals',
    category: 'social-post',
    aspectRatio: '1:1',
    width: 1080,
    height: 1080,
    totalDuration: 4,
    layers: [
      {
        id: 'bg',
        type: 'overlay',
        content: '',
        preset: 'ken-burns',
        delay: 0,
        style: { x: 0, y: 0, width: 100, height: 100, backgroundColor: 'hsl(var(--primary))', zIndex: 0 },
      },
      {
        id: 'headline',
        type: 'text',
        content: 'YOUR EVENT NAME',
        preset: 'fade-up',
        delay: 0.3,
        style: { x: 10, y: 30, width: 80, height: 20, fontSize: 48, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', zIndex: 2 },
      },
      {
        id: 'subline',
        type: 'text',
        content: 'Date • Location • Time',
        preset: 'fade-up',
        delay: 0.7,
        style: { x: 15, y: 55, width: 70, height: 10, fontSize: 20, fontWeight: '400', color: '#FFFFFF', textAlign: 'center', opacity: 0.8, zIndex: 2 },
      },
      {
        id: 'cta',
        type: 'text',
        content: 'Register Now →',
        preset: 'pop-in',
        delay: 1.2,
        style: { x: 25, y: 72, width: 50, height: 10, fontSize: 18, fontWeight: '600', color: '#000000', backgroundColor: '#FFFFFF', textAlign: 'center', borderRadius: 50, zIndex: 3 },
      },
    ],
  },
  {
    id: 'story-countdown',
    name: 'Story Countdown',
    description: 'Vertical countdown-style story animation',
    category: 'social-story',
    aspectRatio: '9:16',
    width: 1080,
    height: 1920,
    totalDuration: 5,
    layers: [
      {
        id: 'bg',
        type: 'overlay',
        content: '',
        preset: 'fade-in',
        delay: 0,
        style: { x: 0, y: 0, width: 100, height: 100, backgroundColor: '#0a0a0a', zIndex: 0 },
      },
      {
        id: 'days-label',
        type: 'text',
        content: '3 DAYS LEFT',
        preset: 'zoom-in',
        delay: 0.5,
        style: { x: 10, y: 35, width: 80, height: 15, fontSize: 56, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', zIndex: 2 },
      },
      {
        id: 'event-name',
        type: 'text',
        content: 'Event Name 2026',
        preset: 'slide-left',
        delay: 1.2,
        style: { x: 10, y: 52, width: 80, height: 8, fontSize: 24, fontWeight: '500', color: '#FFFFFF', textAlign: 'center', opacity: 0.7, zIndex: 2 },
      },
      {
        id: 'swipe-cta',
        type: 'text',
        content: 'Swipe Up to Register ↑',
        preset: 'float',
        delay: 2,
        style: { x: 20, y: 85, width: 60, height: 5, fontSize: 16, fontWeight: '500', color: '#FFFFFF', textAlign: 'center', opacity: 0.6, zIndex: 3 },
      },
    ],
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Event Banner',
    description: 'Professional banner with sliding elements',
    category: 'linkedin',
    aspectRatio: '4:1',
    width: 1584,
    height: 396,
    totalDuration: 3.5,
    layers: [
      {
        id: 'bg',
        type: 'overlay',
        content: '',
        preset: 'cinematic-reveal',
        delay: 0,
        style: { x: 0, y: 0, width: 100, height: 100, backgroundColor: '#1a1a2e', zIndex: 0 },
      },
      {
        id: 'title',
        type: 'text',
        content: 'Annual Tech Summit 2026',
        preset: 'text-clip',
        delay: 0.5,
        style: { x: 5, y: 25, width: 55, height: 30, fontSize: 36, fontWeight: '700', color: '#FFFFFF', textAlign: 'left', zIndex: 2 },
      },
      {
        id: 'details',
        type: 'text',
        content: 'March 15-17 • San Francisco, CA',
        preset: 'fade-up',
        delay: 1,
        style: { x: 5, y: 60, width: 50, height: 15, fontSize: 16, fontWeight: '400', color: '#a0a0b0', textAlign: 'left', zIndex: 2 },
      },
      {
        id: 'logo-area',
        type: 'logo',
        content: 'LOGO',
        preset: 'zoom-in',
        delay: 0.8,
        style: { x: 75, y: 20, width: 20, height: 60, fontSize: 14, color: '#FFFFFF', textAlign: 'center', zIndex: 3 },
      },
    ],
  },
  {
    id: 'youtube-thumb',
    name: 'YouTube Thumbnail',
    description: 'Bold thumbnail with dynamic text and zoom',
    category: 'youtube',
    aspectRatio: '16:9',
    width: 1280,
    height: 720,
    totalDuration: 3,
    layers: [
      {
        id: 'bg',
        type: 'overlay',
        content: '',
        preset: 'zoom-out',
        delay: 0,
        style: { x: 0, y: 0, width: 100, height: 100, backgroundColor: '#e63946', zIndex: 0 },
      },
      {
        id: 'big-text',
        type: 'text',
        content: 'DON\'T MISS THIS',
        preset: 'glitch',
        delay: 0.3,
        style: { x: 5, y: 15, width: 90, height: 35, fontSize: 72, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', zIndex: 2 },
      },
      {
        id: 'event-detail',
        type: 'text',
        content: 'Event Highlights 2026',
        preset: 'slide-bounce',
        delay: 0.8,
        style: { x: 15, y: 60, width: 70, height: 15, fontSize: 28, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', zIndex: 2 },
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const getPresetById = (id: string): AnimationPreset | undefined =>
  ANIMATION_PRESETS.find(p => p.id === id);

export const getPresetsByCategory = (category: AnimationPreset['category']): AnimationPreset[] =>
  ANIMATION_PRESETS.filter(p => p.category === category);

export const getPresetsForElementType = (type: AnimationLayer['type']): AnimationPreset[] => {
  const typeMap: Record<string, AnimationPreset['bestFor'][number]> = {
    text: 'text',
    image: 'image',
    logo: 'logo',
    shape: 'image',
    overlay: 'background',
  };
  const mapped = typeMap[type] || 'text';
  return ANIMATION_PRESETS.filter(p => p.bestFor.includes(mapped));
};

export const PRESET_CATEGORIES = [
  { id: 'text-reveal', name: 'Text Reveals', icon: 'Type' },
  { id: 'zoom', name: 'Zoom Effects', icon: 'ZoomIn' },
  { id: 'slide', name: 'Slide Transitions', icon: 'ArrowRight' },
  { id: 'fade', name: 'Fade Effects', icon: 'Sun' },
  { id: 'dynamic', name: 'Dynamic', icon: 'Sparkles' },
  { id: 'cinematic', name: 'Cinematic', icon: 'Film' },
] as const;

// Animatable asset types - banners and social assets that support animation
export const ANIMATABLE_ASSET_TYPES = [
  'BANNER', 'SOCIAL_POST', 'SOCIAL_STORY', 'EMAIL_HEADER',
  'LINKEDIN_BANNER', 'TWITTER_HEADER', 'YOUTUBE_THUMBNAIL',
  'PODCAST_COVER', 'ZOOM_BACKGROUND', 'EVENT_APP_SPLASH',
  'DIGITAL_SIGNAGE_LOOP', 'LIVE_STREAM_OVERLAY', 'WEBINAR_SLIDE',
  'SPONSOR_BANNER', 'STEP_AND_REPEAT',
];

export const isAnimatableAsset = (assetType: string): boolean =>
  ANIMATABLE_ASSET_TYPES.includes(assetType);
