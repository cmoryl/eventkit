/**
 * Logo Compositor — pixel-perfect logo overlay on AI-generated images.
 * Uses an offscreen canvas to draw the generated image, then composites
 * the actual logo file on top at a position derived from asset-type rules.
 *
 * This is the only approved path for visible logo rendering. AI generation
 * may reserve a logo-safe zone, but the final logo pixels must come from the
 * source logo image supplied by the user/brand brain.
 */

export type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'center' |
  'bottom-left' | 'bottom-center' | 'bottom-right';

export interface CompositeOptions {
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
  /** Backing plate behind logo. Strongly recommended to cover AI placeholder marks. Default true */
  backingPlate?: boolean;
  /** Backing plate opacity. Default 0.92 */
  backingPlateOpacity?: number;
  /** Backing plate fill. Default white */
  backingPlateFill?: string;
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

const isDataOrBlobUrl = (src: string) => src.startsWith('data:') || src.startsWith('blob:');

const blobToDataUrl = (blob: Blob): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error('Failed to convert fetched image to data URL'));
  reader.readAsDataURL(blob);
});

async function normalizeImageSrc(src: string): Promise<string> {
  if (isDataOrBlobUrl(src)) return src;

  // Remote images can taint canvas. Fetching to a data URL first keeps the
  // compositor deterministic when the source permits CORS.
  try {
    const response = await fetch(src, { mode: 'cors' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const blob = await response.blob();
    return await blobToDataUrl(blob);
  } catch (error) {
    console.warn('Could not normalize image source before compositing; falling back to direct image load:', error);
    return src;
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!isDataOrBlobUrl(src)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 80)}`));
    img.src = src;
  });
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
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
    backingPlateOpacity = 0.92,
    backingPlateFill = '#ffffff',
    customPlacement,
  } = opts;

  const [safeGeneratedImageUrl, safeLogoUrl] = await Promise.all([
    normalizeImageSrc(generatedImageUrl),
    normalizeImageSrc(logoUrl),
  ]);

  // Load both images in parallel
  const [bgImg, logoImg] = await Promise.all([
    loadImage(safeGeneratedImageUrl),
    loadImage(safeLogoUrl),
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = bgImg.naturalWidth;
  canvas.height = bgImg.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable for exact logo compositing');

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

  // Keep logo and backing plate inside canvas bounds.
  x = Math.max(0, Math.min(x, canvas.width - logoW));
  y = Math.max(0, Math.min(y, canvas.height - logoH));

  // Backing plate intentionally covers any AI placeholder/logo-like marks in the reserved zone.
  if (backingPlate) {
    const platePad = Math.min(logoW, logoH) * 0.18;
    ctx.save();
    ctx.globalAlpha = backingPlateOpacity;
    ctx.fillStyle = backingPlateFill;
    const radius = Math.min(logoW, logoH) * 0.1;
    const px = Math.max(0, x - platePad);
    const py = Math.max(0, y - platePad);
    const pw = Math.min(canvas.width - px, logoW + platePad * 2);
    const ph = Math.min(canvas.height - py, logoH + platePad * 2);
    roundedRect(ctx, px, py, pw, ph, radius);
    ctx.fill();
    ctx.restore();
  }

  // Draw logo from the real source image only.
  ctx.drawImage(logoImg, x, y, logoW, logoH);

  // Export as high-quality PNG so the exact logo pixels are preserved.
  return canvas.toDataURL('image/png');
}
