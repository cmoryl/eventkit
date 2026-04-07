/**
 * Logo Compositor — pixel-perfect logo overlay on AI-generated images.
 * Uses an offscreen canvas to draw the generated image, then composites
 * the actual logo file on top at a position derived from asset-type rules.
 */

type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'center' |
  'bottom-left' | 'bottom-center' | 'bottom-right';

interface CompositeOptions {
  /** The AI-generated image (data-url or http url) */
  generatedImageUrl: string;
  /** The actual logo image (data-url or http url) */
  logoUrl: string;
  /** Where to place the logo (ignored if customPlacement is set) */
  position?: LogoPosition;
  /** Logo size as fraction of image width (0-1). Default 0.18 */
  scale?: number;
  /** Padding from edge as fraction of image width. Default 0.04 */
  padding?: number;
  /** Optional semi-transparent backing plate behind logo. Default true */
  backingPlate?: boolean;
  /** Custom placement overrides position/scale/padding (from drag UI) */
  customPlacement?: { x: number; y: number; scale: number };
}

/** Parse a placement description string into a LogoPosition */
export function positionFromAssetType(assetType: string): LogoPosition {
  const t = assetType.toUpperCase();

  // Centered types
  if (['APP_ICON', 'FAVICON', 'COASTER_DESIGN', 'EVENT_APP_SPLASH', 'WRISTBAND_DESIGN'].includes(t)) return 'center';

  // Bottom types
  if (['SOCIAL_POST', 'PHOTO_BOOTH_FRAME', 'THANK_YOU_NOTE', 'ZOOM_BACKGROUND'].includes(t)) return 'bottom-right';
  if (['TABLE_TENT', 'PLACE_CARD', 'TABLE_NUMBER', 'CATERING_LABEL', 'DIETARY_CARD', 'FLOOR_DECAL', 'NAME_TAG_BACK'].includes(t)) return 'bottom-center';

  // Right types
  if (['LINKEDIN_BANNER', 'TWITTER_HEADER'].includes(t)) return 'top-right';

  // Bottom-right corner (presentations, webinar)
  if (['PRESENTATION_SLIDE', 'WEBINAR_SLIDE', 'LIVE_STREAM_OVERLAY'].includes(t)) return 'bottom-right';

  // Default: top-center for most signage, banners, badges
  if (t.includes('BADGE') || t.includes('CREDENTIAL') || t.includes('PASS') || t.includes('TAG')) return 'top-center';
  if (t.includes('BANNER') || t.includes('SIGNAGE') || t.includes('FLAG')) return 'top-center';

  return 'top-left';
}

/** Scale fraction from asset type */
export function scaleFromAssetType(assetType: string): number {
  const t = assetType.toUpperCase();
  if (['APP_ICON', 'FAVICON'].includes(t)) return 0.7;
  if (['COASTER_DESIGN', 'NAPKIN_DESIGN', 'EVENT_APP_SPLASH'].includes(t)) return 0.35;
  if (t.includes('STEP_AND_REPEAT')) return 0.12;
  if (t.includes('BACKDROP') || t.includes('BACK_WALL')) return 0.3;
  if (t.includes('BANNER') || t.includes('COUNTER') || t.includes('KIOSK')) return 0.22;
  if (t.includes('BADGE') || t.includes('CREDENTIAL') || t.includes('PASS')) return 0.2;
  if (t.includes('SLIDE') || t.includes('OVERLAY')) return 0.1;
  return 0.18;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${src.substring(0, 80)}`));
    img.src = src;
  });
}

/**
 * Composite the real logo onto the AI-generated image and return a data URL.
 */
export async function compositeLogoOntoImage(opts: CompositeOptions): Promise<string> {
  const {
    generatedImageUrl,
    logoUrl,
    position = 'top-center',
    scale = 0.18,
    padding = 0.04,
    backingPlate = true,
    customPlacement,
  } = opts;

  // Load both images in parallel
  const [bgImg, logoImg] = await Promise.all([
    loadImage(generatedImageUrl),
    loadImage(logoUrl),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = bgImg.naturalWidth;
  canvas.height = bgImg.naturalHeight;
  const ctx = canvas.getContext('2d')!;

  // Draw background
  ctx.drawImage(bgImg, 0, 0);

  // Calculate logo dimensions and position
  const logoAspect = logoImg.naturalWidth / logoImg.naturalHeight;
  let x: number, y: number, logoW: number, logoH: number;

  if (customPlacement) {
    // User-defined placement from drag UI (fractions of image dimensions)
    logoW = canvas.width * customPlacement.scale;
    logoH = logoW / logoAspect;
    x = customPlacement.x * canvas.width;
    y = customPlacement.y * canvas.height;
  } else {
    // Auto placement from asset type rules
    const maxLogoWidth = canvas.width * scale;
    logoW = maxLogoWidth;
    logoH = logoW / logoAspect;
    const maxLogoHeight = canvas.height * scale;
    if (logoH > maxLogoHeight) {
      logoH = maxLogoHeight;
      logoW = logoH * logoAspect;
    }
    const pad = canvas.width * padding;
    switch (position) {
      case 'top-left': x = pad; y = pad; break;
      case 'top-center': x = (canvas.width - logoW) / 2; y = pad; break;
      case 'top-right': x = canvas.width - logoW - pad; y = pad; break;
      case 'center': x = (canvas.width - logoW) / 2; y = (canvas.height - logoH) / 2; break;
      case 'bottom-left': x = pad; y = canvas.height - logoH - pad; break;
      case 'bottom-center': x = (canvas.width - logoW) / 2; y = canvas.height - logoH - pad; break;
      case 'bottom-right': x = canvas.width - logoW - pad; y = canvas.height - logoH - pad; break;
      default: x = pad; y = pad;
    }
  }
  }

  // Optional backing plate for contrast
  if (backingPlate) {
    const platePad = Math.min(logoW, logoH) * 0.12;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#ffffff';
    const radius = Math.min(logoW, logoH) * 0.08;
    const px = x - platePad;
    const py = y - platePad;
    const pw = logoW + platePad * 2;
    const ph = logoH + platePad * 2;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, radius);
    ctx.fill();
    ctx.restore();
  }

  // Draw logo
  ctx.drawImage(logoImg, x, y, logoW, logoH);

  // Export as high-quality JPEG (or PNG if needed)
  return canvas.toDataURL('image/png');
}
