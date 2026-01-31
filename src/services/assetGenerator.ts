import { AssetType } from '../types';
import type { EventDetails, ColorInfo } from '../types';
import { getAssetConfig } from '../config/assetConfig';
import { renderAsset } from './canvasRenderer';
import { 
  generateSlogans as aiGenerateSlogans, 
  generateMarketingCopy as aiGenerateMarketingCopy,
  generateRunOfShow as aiGenerateRunOfShow,
  generateAssetImage
} from './geminiService';

// Design tokens for consistent generation
const BRAND_GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#4facfe', '#00f2fe'],
  ['#43e97b', '#38f9d7'],
  ['#fa709a', '#fee140'],
  ['#a8edea', '#fed6e3'],
  ['#ff0844', '#ffb199'],
  ['#30cfd0', '#330867'],
];

const getRandomGradient = (seed: number = 0) => {
  const index = seed % BRAND_GRADIENTS.length;
  return BRAND_GRADIENTS[index];
};

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
};

const rgbToCmyk = (r: number, g: number, b: number) => {
  const rPrime = r / 255;
  const gPrime = g / 255;
  const bPrime = b / 255;
  const k = 1 - Math.max(rPrime, gPrime, bPrime);
  const c = k === 1 ? 0 : Math.round(((1 - rPrime - k) / (1 - k)) * 100);
  const m = k === 1 ? 0 : Math.round(((1 - gPrime - k) / (1 - k)) * 100);
  const y = k === 1 ? 0 : Math.round(((1 - bPrime - k) / (1 - k)) * 100);
  return `C${c} M${m} Y${y} K${Math.round(k * 100)}`;
};

const rgbToHsv = (r: number, g: number, b: number) => {
  const rPrime = r / 255;
  const gPrime = g / 255;
  const bPrime = b / 255;
  const max = Math.max(rPrime, gPrime, bPrime);
  const min = Math.min(rPrime, gPrime, bPrime);
  const delta = max - min;
  let h = 0;
  const s = max === 0 ? 0 : (delta / max) * 100;
  const v = max * 100;
  if (delta !== 0) {
    if (max === rPrime) h = ((gPrime - bPrime) / delta) % 6;
    else if (max === gPrime) h = (bPrime - rPrime) / delta + 2;
    else h = (rPrime - gPrime) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return `hsv(${h}, ${Math.round(s)}%, ${Math.round(v)}%)`;
};

const COLOR_NAMES: Record<string, string> = {
  '#667eea': 'Indigo',
  '#764ba2': 'Purple',
  '#f093fb': 'Pink',
  '#f5576c': 'Coral',
  '#4facfe': 'Sky Blue',
  '#00f2fe': 'Cyan',
  '#43e97b': 'Mint',
  '#38f9d7': 'Turquoise',
  '#fa709a': 'Rose',
  '#fee140': 'Yellow',
  '#1f2937': 'Charcoal',
  '#ffffff': 'White',
  '#000000': 'Black',
};

const getColorName = (hex: string): string => {
  const cleanHex = hex.toLowerCase();
  return COLOR_NAMES[cleanHex] || 'Custom';
};

const generateColorPalette = (eventName: string, seed: number = 0): ColorInfo[] => {
  const [primary, secondary] = getRandomGradient(seed);
  const colors = [primary, secondary, '#1f2937', '#ffffff', '#f3f4f6'];
  
  return colors.map(hex => {
    const rgb = hexToRgb(hex);
    return {
      hex,
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b),
      hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
      pantone: `Pantone ${Math.floor(Math.random() * 9000 + 1000)} C`,
      name: getColorName(hex),
    };
  });
};

const generateSlogans = (eventDetails: EventDetails): string[] => {
  const name = eventDetails.name || 'Your Event';
  return [
    `${name}: Where Innovation Meets Excellence`,
    `Join Us at ${name} — Transform Your Future`,
    `${name}: Connect. Learn. Grow.`,
    `Experience the Future at ${name}`,
    `${name}: Your Journey Starts Here`,
    `Discover What's Next at ${name}`,
    `${name}: Where Great Ideas Take Flight`,
    `Be Part of Something Extraordinary at ${name}`,
  ];
};

const generateMarketingCopy = (eventDetails: EventDetails): string => {
  return `# ${eventDetails.name}

${eventDetails.description || 'Join us for an extraordinary event experience that will transform the way you think, connect, and grow.'}

## Event Details
- **Date:** ${eventDetails.date || 'To Be Announced'}
- **Location:** ${eventDetails.location || 'Venue TBA'}
- **Website:** ${eventDetails.website || 'Coming Soon'}
- **Contact:** ${eventDetails.email || 'info@event.com'}

## Why Attend?

### Connect
Network with industry leaders, innovators, and peers who share your passion.

### Learn
Gain insights from world-class speakers and hands-on workshops.

### Grow
Discover cutting-edge trends and strategies to accelerate your success.

## What to Expect
- **Keynote Sessions** from thought leaders
- **Interactive Workshops** for hands-on learning
- **Networking Events** to build lasting connections
- **Exhibition Hall** showcasing the latest innovations

---

*Don't miss this opportunity to be part of something extraordinary!*

Register now at ${eventDetails.website || 'our website'}`;
};

const generateRunOfShow = (eventDetails: EventDetails): string => {
  return `# ${eventDetails.name}
## Run of Show

**Date:** ${eventDetails.date || 'TBA'}
**Venue:** ${eventDetails.location || 'TBA'}

---

### Pre-Event Setup
| Time | Activity | Owner |
|------|----------|-------|
| 06:00 | Venue access / AV setup | Production |
| 07:00 | Registration desk setup | Operations |
| 07:30 | Signage installation | Facilities |

### Morning Session
| Time | Activity | Speaker/Owner |
|------|----------|---------------|
| 08:00 | Doors Open / Registration | Operations |
| 08:30 | Networking & Coffee | Catering |
| 09:00 | Welcome & Opening Keynote | Host |
| 09:45 | Panel Discussion | Moderator |
| 10:30 | Coffee Break | Catering |
| 11:00 | Breakout Sessions (3 tracks) | Various |

### Afternoon Session
| Time | Activity | Speaker/Owner |
|------|----------|---------------|
| 12:00 | Networking Lunch | Catering |
| 13:30 | Workshop Sessions | Facilitators |
| 15:00 | Afternoon Break | Catering |
| 15:30 | Innovation Showcase | Presenters |
| 16:30 | Closing Keynote | Host |
| 17:15 | Closing Remarks & Announcements | Host |

### Evening
| Time | Activity | Owner |
|------|----------|-------|
| 17:30 | Networking Reception | Catering |
| 19:00 | VIP Dinner (Invite Only) | Events |
| 21:00 | Event Close | All |

---

### Key Contacts
- **Event Director:** [Name] - [Phone]
- **Production Lead:** [Name] - [Phone]
- **Catering Manager:** [Name] - [Phone]

### Emergency Procedures
- First Aid station: Registration area
- Emergency exits: Clearly marked throughout venue
- Security: On-site 24/7`;
};

const generateAgendaHighlights = (eventDetails: EventDetails): string => {
  return `# ${eventDetails.name}
## Agenda Highlights

### 🎯 Keynote Sessions
Experience thought-provoking presentations from industry leaders.

**Opening Keynote — 9:00 AM**
"The Future of Innovation"

**Closing Keynote — 4:30 PM**
"Building Tomorrow, Today"

---

### 💡 Featured Sessions

**Track A: Technology & Innovation**
- AI in Practice: Real-World Applications
- Cloud Architecture for Scale
- Security in the Modern Era

**Track B: Leadership & Strategy**
- Leading Through Change
- Building High-Performance Teams
- Strategic Planning Workshop

**Track C: Hands-On Workshops**
- Design Thinking Lab
- Product Development Sprint
- Data Analytics Deep Dive

---

### 🤝 Networking Opportunities
- Morning Coffee Networking (8:30 AM)
- Lunch & Learn Tables (12:00 PM)
- Evening Reception (5:30 PM)

---

### 📍 Location
${eventDetails.location || 'Venue TBA'}

### 📅 Date
${eventDetails.date || 'Date TBA'}

### 🔗 More Info
${eventDetails.website || 'Website coming soon'}`;
};

const generateImageAsset = async (
  type: AssetType,
  eventDetails: EventDetails,
  colorPalette: ColorInfo[] = [],
  logoDataUrl?: string
): Promise<string> => {
  // Try AI image generation first for supported types
  try {
    const aiImage = await generateAssetImage(
      type,
      eventDetails.name,
      eventDetails.description || '',
      `Professional event design for ${eventDetails.name}. Modern, clean aesthetics with bold typography.`,
      colorPalette.map(c => c.hex),
      logoDataUrl,
      eventDetails.location,
      eventDetails.incorporateLocationStyle
    );
    
    if (aiImage) {
      console.log(`AI generated image for ${type}`);
      return aiImage;
    }
  } catch (e) {
    console.warn('AI image generation failed, using canvas renderer:', e);
  }
  
  // Fallback to advanced canvas renderer
  try {
    const result = await renderAsset(type, {
      eventDetails,
      colorPalette,
      logoDataUrl,
    });
    return result;
  } catch (e) {
    console.warn('Advanced renderer failed, falling back to basic:', e);
  }

  // Fallback to basic renderer
  const config = getAssetConfig(type);
  const width = config?.pixelWidth || (config?.printSpec ? Math.round(config.printSpec.widthInches * config.printSpec.dpi) : 800);
  const height = config?.pixelHeight || (config?.printSpec ? Math.round(config.printSpec.heightInches * config.printSpec.dpi) : 600);
  
  // Scale down for preview while maintaining aspect ratio
  const maxDimension = 1200;
  const scale = Math.min(maxDimension / width, maxDimension / height, 1);
  const canvasWidth = Math.round(width * scale);
  const canvasHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  // Get colors
  const primaryColor = colorPalette[0]?.hex || '#667eea';
  const secondaryColor = colorPalette[1]?.hex || '#764ba2';
  const textColor = '#ffffff';

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(1, secondaryColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Add subtle pattern overlay
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < canvasWidth; i += 40) {
    for (let j = 0; j < canvasHeight; j += 40) {
      ctx.beginPath();
      ctx.arc(i, j, 2, 0, Math.PI * 2);
      ctx.fillStyle = textColor;
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  // Type-specific rendering
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const name = eventDetails.name || 'Your Event';
  const title = config?.title || type.replace(/_/g, ' ');

  switch (type) {
    case AssetType.NameTag:
      // Name tag design
      ctx.font = `bold ${Math.round(canvasHeight * 0.08)}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, canvasWidth / 2, canvasHeight * 0.15);
      
      // Attendee placeholder
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(canvasWidth * 0.1, canvasHeight * 0.35, canvasWidth * 0.8, canvasHeight * 0.2);
      ctx.fillStyle = textColor;
      ctx.font = `${Math.round(canvasHeight * 0.06)}px Inter, system-ui, sans-serif`;
      ctx.fillText('ATTENDEE NAME', canvasWidth / 2, canvasHeight * 0.45);
      
      ctx.font = `${Math.round(canvasHeight * 0.04)}px Inter, system-ui, sans-serif`;
      ctx.globalAlpha = 0.8;
      ctx.fillText('COMPANY / TITLE', canvasWidth / 2, canvasHeight * 0.65);
      ctx.globalAlpha = 1;
      break;

    case AssetType.Banner:
      // Large banner design
      ctx.font = `bold ${Math.round(canvasHeight * 0.15)}px Inter, system-ui, sans-serif`;
      ctx.fillText(name.toUpperCase(), canvasWidth / 2, canvasHeight * 0.4);
      
      ctx.font = `${Math.round(canvasHeight * 0.06)}px Inter, system-ui, sans-serif`;
      ctx.globalAlpha = 0.9;
      ctx.fillText(eventDetails.date || '', canvasWidth / 2, canvasHeight * 0.6);
      ctx.fillText(eventDetails.location || '', canvasWidth / 2, canvasHeight * 0.72);
      ctx.globalAlpha = 1;
      break;

    case AssetType.SocialPost:
    case AssetType.SocialStory:
      // Social media design
      const isStory = type === AssetType.SocialStory;
      ctx.font = `bold ${Math.round(canvasHeight * (isStory ? 0.04 : 0.06))}px Inter, system-ui, sans-serif`;
      ctx.fillText(name.toUpperCase(), canvasWidth / 2, canvasHeight * 0.4);
      
      ctx.font = `${Math.round(canvasHeight * (isStory ? 0.025 : 0.035))}px Inter, system-ui, sans-serif`;
      ctx.fillText(eventDetails.date || 'SAVE THE DATE', canvasWidth / 2, canvasHeight * 0.52);
      
      if (eventDetails.location) {
        ctx.globalAlpha = 0.8;
        ctx.fillText(`📍 ${eventDetails.location}`, canvasWidth / 2, canvasHeight * 0.6);
        ctx.globalAlpha = 1;
      }
      break;

    case AssetType.WifiSign:
      ctx.font = `bold ${Math.round(canvasHeight * 0.06)}px Inter, system-ui, sans-serif`;
      ctx.fillText('📶 FREE WI-FI', canvasWidth / 2, canvasHeight * 0.2);
      
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(canvasWidth * 0.1, canvasHeight * 0.35, canvasWidth * 0.8, canvasHeight * 0.5);
      ctx.fillStyle = textColor;
      
      ctx.font = `${Math.round(canvasHeight * 0.035)}px Inter, system-ui, sans-serif`;
      ctx.fillText('Network:', canvasWidth / 2, canvasHeight * 0.45);
      ctx.font = `bold ${Math.round(canvasHeight * 0.05)}px monospace`;
      ctx.fillText(name.replace(/\s/g, '-') + '-Guest', canvasWidth / 2, canvasHeight * 0.55);
      
      ctx.font = `${Math.round(canvasHeight * 0.035)}px Inter, system-ui, sans-serif`;
      ctx.fillText('Password:', canvasWidth / 2, canvasHeight * 0.68);
      ctx.font = `bold ${Math.round(canvasHeight * 0.05)}px monospace`;
      ctx.fillText('Welcome2024!', canvasWidth / 2, canvasHeight * 0.78);
      break;

    case AssetType.Tshirt:
    case AssetType.TshirtBack:
      // T-shirt print area
      ctx.font = `bold ${Math.round(canvasHeight * 0.1)}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, canvasWidth / 2, canvasHeight * 0.4);
      
      if (type === AssetType.TshirtBack) {
        ctx.font = `${Math.round(canvasHeight * 0.04)}px Inter, system-ui, sans-serif`;
        ctx.fillText(eventDetails.date || '', canvasWidth / 2, canvasHeight * 0.55);
        ctx.fillText(eventDetails.location || '', canvasWidth / 2, canvasHeight * 0.62);
      }
      break;

    case AssetType.EmailHeader:
      ctx.font = `bold ${Math.round(canvasHeight * 0.2)}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, canvasWidth / 2, canvasHeight * 0.5);
      break;

    default:
      // Generic design
      ctx.font = `bold ${Math.round(Math.min(canvasHeight, canvasWidth) * 0.08)}px Inter, system-ui, sans-serif`;
      ctx.fillText(name, canvasWidth / 2, canvasHeight * 0.4);
      
      ctx.font = `${Math.round(Math.min(canvasHeight, canvasWidth) * 0.03)}px Inter, system-ui, sans-serif`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(title.toUpperCase(), canvasWidth / 2, canvasHeight * 0.55);
      ctx.globalAlpha = 1;
      
      // Show dimensions for print assets
      if (config?.printSpec) {
        ctx.font = `${Math.round(Math.min(canvasHeight, canvasWidth) * 0.025)}px Inter, system-ui, sans-serif`;
        ctx.globalAlpha = 0.5;
        ctx.fillText(
          `${config.printSpec.widthInches}" × ${config.printSpec.heightInches}" @ ${config.printSpec.dpi}dpi`,
          canvasWidth / 2,
          canvasHeight * 0.65
        );
        ctx.globalAlpha = 1;
      }
  }

  return canvas.toDataURL('image/png');
};

// Main generation function
export const generatePlaceholderContent = async (
  type: AssetType,
  eventDetails: EventDetails,
  colorPalette: ColorInfo[] = [],
  logoDataUrl?: string
): Promise<string | string[] | ColorInfo[]> => {
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));

  switch (type) {
    case AssetType.Palette:
      return generateColorPalette(eventDetails.name, Date.now());
      
    case AssetType.Slogans:
      // Use AI-powered slogan generation
      try {
        return await aiGenerateSlogans(eventDetails.name, eventDetails.description || '', 8);
      } catch {
        return generateSlogans(eventDetails);
      }
      
    case AssetType.MarketingCopy:
      // Use AI-powered marketing copy
      try {
        return await aiGenerateMarketingCopy(
          eventDetails.name,
          eventDetails.description || '',
          eventDetails.date || '',
          eventDetails.location || ''
        );
      } catch {
        return generateMarketingCopy(eventDetails);
      }
      
    case AssetType.RunOfShow:
      // Use AI-powered run of show
      try {
        return await aiGenerateRunOfShow(
          eventDetails.name,
          eventDetails.date || '',
          eventDetails.description || ''
        );
      } catch {
        return generateRunOfShow(eventDetails);
      }
      
    case AssetType.AgendaHighlights:
      return generateAgendaHighlights(eventDetails);
      
    case AssetType.StyleGuide:
      return `# ${eventDetails.name} Brand Style Guide

## Brand Overview
${eventDetails.description || 'A professional event experience designed to inspire and connect.'}

## Logo Usage
- Maintain minimum clear space equal to the height of the logo mark
- Do not stretch, rotate, or alter the logo proportions
- Use approved color variations only

## Color Palette
Use the Color Palette asset for complete color specifications including CMYK for print and RGB for digital.

## Typography
**Headlines:** Inter Bold or similar geometric sans-serif
**Body Text:** Inter Regular, 16px minimum for readability
**Accent:** Use sparingly for emphasis

## Voice & Tone
- Professional yet approachable
- Forward-thinking and innovative
- Inclusive and welcoming

## Image Style
- High-quality, well-lit photography
- Authentic moments over staged shots
- Consistent color grading aligned with brand palette`;

    default:
      return generateImageAsset(type, eventDetails, colorPalette, logoDataUrl);
  }
};

export { generateColorPalette, generateImageAsset };
