// Canvas-based asset renderer for generating realistic mockups
import { AssetType } from '../types';
import type { ColorInfo, EventDetails } from '../types';
import { getAssetConfig } from '../config/assetConfig';

interface RenderOptions {
  eventDetails: EventDetails;
  colorPalette: ColorInfo[];
  logoDataUrl?: string;
  customText?: Record<string, string>;
}

// Utility to load an image
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

// Draw rounded rectangle
const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

// Create gradient background
const createGradientBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
): CanvasGradient => {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((color, i) => {
    gradient.addColorStop(i / Math.max(1, colors.length - 1), color);
  });
  return gradient;
};

// Get contrasting text color
const getContrastColor = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
};

// Render name tag
const renderNameTag = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#3B82F6';
  const secondaryColor = colorPalette[1]?.hex || '#1E40AF';
  const accentColor = colorPalette[2]?.hex || '#60A5FA';

  // Background gradient
  const gradient = createGradientBackground(ctx, canvas.width, canvas.height, [primaryColor, secondaryColor]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative pattern
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      Math.random() * 100 + 20,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = accentColor;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // White content area
  const padding = canvas.width * 0.08;
  const contentWidth = canvas.width - padding * 2;
  const contentHeight = canvas.height * 0.55;
  const contentY = canvas.height * 0.35;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, padding, contentY, contentWidth, contentHeight, 16);
  ctx.fill();

  // Logo area
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoSize = canvas.width * 0.2;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = padding * 1.5;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Event name at top
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${canvas.width * 0.055}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(eventDetails.name.toUpperCase(), canvas.width / 2, padding * 2.5 + (logoDataUrl ? canvas.width * 0.22 : 0));

  // Name placeholder
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `bold ${canvas.width * 0.09}px Inter, system-ui, sans-serif`;
  ctx.fillText('ATTENDEE NAME', canvas.width / 2, contentY + contentHeight * 0.35);

  // Title placeholder
  ctx.fillStyle = '#666666';
  ctx.font = `${canvas.width * 0.045}px Inter, system-ui, sans-serif`;
  ctx.fillText('Job Title', canvas.width / 2, contentY + contentHeight * 0.55);

  // Company placeholder
  ctx.fillStyle = '#888888';
  ctx.font = `${canvas.width * 0.04}px Inter, system-ui, sans-serif`;
  ctx.fillText('Company Name', canvas.width / 2, contentY + contentHeight * 0.72);

  // Footer with date/location
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `${canvas.width * 0.032}px Inter, system-ui, sans-serif`;
  const footerText = [eventDetails.date, eventDetails.location].filter(Boolean).join(' • ');
  ctx.fillText(footerText, canvas.width / 2, canvas.height - padding);
};

// Render social post
const renderSocialPost = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#8B5CF6';
  const secondaryColor = colorPalette[1]?.hex || '#6D28D9';

  // Gradient background
  const gradient = createGradientBackground(ctx, canvas.width, canvas.height, [primaryColor, secondaryColor]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Abstract shapes
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(canvas.width * 0.85, canvas.height * 0.2, canvas.width * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(canvas.width * 0.1, canvas.height * 0.8, canvas.width * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Logo
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoSize = canvas.width * 0.12;
      ctx.drawImage(logo, canvas.width * 0.08, canvas.height * 0.08, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Event name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${canvas.width * 0.08}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap for long names
  const words = eventDetails.name.split(' ');
  let lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > canvas.width * 0.8) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  if (currentLine) lines.push(currentLine);

  const lineHeight = canvas.width * 0.1;
  const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

  lines.forEach((line, i) => {
    ctx.fillText(line.toUpperCase(), canvas.width / 2, startY + i * lineHeight);
  });

  // Date and location
  ctx.font = `${canvas.width * 0.04}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const infoY = startY + lines.length * lineHeight + canvas.width * 0.08;

  if (eventDetails.date) {
    const formattedDate = new Date(eventDetails.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    ctx.fillText(formattedDate, canvas.width / 2, infoY);
  }

  if (eventDetails.location) {
    ctx.fillText(eventDetails.location, canvas.width / 2, infoY + canvas.width * 0.05);
  }
};

// Render banner
const renderBanner = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#059669';
  const secondaryColor = colorPalette[1]?.hex || '#047857';
  const accentColor = colorPalette[2]?.hex || '#10B981';

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, primaryColor);
  gradient.addColorStop(0.5, secondaryColor);
  gradient.addColorStop(1, primaryColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Geometric patterns
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = accentColor;
  for (let i = 0; i < 15; i++) {
    const x = (canvas.width / 15) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + canvas.width * 0.1, canvas.height);
    ctx.lineTo(x + canvas.width * 0.05, canvas.height);
    ctx.lineTo(x - canvas.width * 0.05, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Logo on left
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoHeight = canvas.height * 0.5;
      const logoWidth = logoHeight;
      ctx.drawImage(logo, canvas.width * 0.05, (canvas.height - logoHeight) / 2, logoWidth, logoHeight);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Event name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${canvas.height * 0.25}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(eventDetails.name.toUpperCase(), canvas.width / 2, canvas.height * 0.45);

  // Date and location
  ctx.font = `${canvas.height * 0.1}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  const infoText = [eventDetails.date, eventDetails.location].filter(Boolean).join(' | ');
  ctx.fillText(infoText, canvas.width / 2, canvas.height * 0.75);
};

// Render email header
const renderEmailHeader = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#2563EB';
  const secondaryColor = colorPalette[1]?.hex || '#1D4ED8';

  // Gradient background
  const gradient = createGradientBackground(ctx, canvas.width, canvas.height, [primaryColor, secondaryColor]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Logo
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoHeight = canvas.height * 0.4;
      ctx.drawImage(logo, canvas.width * 0.04, (canvas.height - logoHeight) / 2, logoHeight, logoHeight);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Event name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${canvas.height * 0.22}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(eventDetails.name, canvas.width * 0.96, canvas.height / 2);
};

// Render T-shirt design
const renderTshirt = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#1F2937';

  // T-shirt background (dark)
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Design area (centered)
  const designSize = canvas.width * 0.6;
  const designX = (canvas.width - designSize) / 2;
  const designY = (canvas.height - designSize) / 2;

  // Logo
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoSize = designSize * 0.5;
      ctx.drawImage(logo, designX + (designSize - logoSize) / 2, designY, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Event name
  ctx.fillStyle = getContrastColor(primaryColor);
  ctx.font = `bold ${canvas.width * 0.06}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(eventDetails.name.toUpperCase(), canvas.width / 2, designY + designSize * 0.7);

  // Year
  if (eventDetails.date) {
    const year = new Date(eventDetails.date).getFullYear();
    ctx.font = `${canvas.width * 0.04}px Inter, system-ui, sans-serif`;
    ctx.fillText(year.toString(), canvas.width / 2, designY + designSize * 0.85);
  }
};

// Render signage (generic)
const renderSignage = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions,
  title: string = 'WELCOME'
): Promise<void> => {
  const { eventDetails, colorPalette, logoDataUrl } = options;
  const primaryColor = colorPalette[0]?.hex || '#7C3AED';
  const secondaryColor = colorPalette[1]?.hex || '#5B21B6';

  // Background
  const gradient = createGradientBackground(ctx, canvas.width, canvas.height, [primaryColor, secondaryColor]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Logo at top
  if (logoDataUrl) {
    try {
      const logo = await loadImage(logoDataUrl);
      const logoSize = Math.min(canvas.width, canvas.height) * 0.2;
      ctx.drawImage(logo, (canvas.width - logoSize) / 2, canvas.height * 0.1, logoSize, logoSize);
    } catch (e) {
      console.warn('Could not load logo', e);
    }
  }

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.12}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, canvas.width / 2, canvas.height * 0.45);

  // Event name
  ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.08}px Inter, system-ui, sans-serif`;
  ctx.fillText(eventDetails.name.toUpperCase(), canvas.width / 2, canvas.height * 0.6);

  // Date and location
  ctx.font = `${Math.min(canvas.width, canvas.height) * 0.04}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  if (eventDetails.date || eventDetails.location) {
    const info = [eventDetails.date, eventDetails.location].filter(Boolean).join(' • ');
    ctx.fillText(info, canvas.width / 2, canvas.height * 0.75);
  }
};

// Render WiFi sign
const renderWifiSign = async (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): Promise<void> => {
  const { colorPalette, eventDetails } = options;
  const primaryColor = colorPalette[0]?.hex || '#3B82F6';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header bar
  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.15);

  // WiFi icon (simplified)
  const centerX = canvas.width / 2;
  const centerY = canvas.height * 0.4;
  ctx.strokeStyle = primaryColor;
  ctx.lineWidth = canvas.width * 0.02;

  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvas.width * 0.08 * i, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(centerX, centerY, canvas.width * 0.025, 0, Math.PI * 2);
  ctx.fillStyle = primaryColor;
  ctx.fill();

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${canvas.height * 0.06}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('FREE WiFi', centerX, canvas.height * 0.1);

  // Network info
  ctx.fillStyle = '#1a1a1a';
  ctx.font = `${canvas.height * 0.04}px Inter, system-ui, sans-serif`;
  ctx.fillText('NETWORK', centerX, canvas.height * 0.6);

  ctx.font = `bold ${canvas.height * 0.05}px Inter, system-ui, sans-serif`;
  ctx.fillText(eventDetails.name.replace(/\s+/g, '_'), centerX, canvas.height * 0.68);

  ctx.font = `${canvas.height * 0.04}px Inter, system-ui, sans-serif`;
  ctx.fillText('PASSWORD', centerX, canvas.height * 0.8);

  ctx.font = `bold ${canvas.height * 0.05}px Inter, system-ui, sans-serif`;
  ctx.fillText('welcome2024', centerX, canvas.height * 0.88);
};

// Render seamless pattern
const renderSeamlessPattern = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  options: RenderOptions
): void => {
  const { colorPalette } = options;
  const colors = colorPalette.map(c => c.hex);
  if (colors.length === 0) colors.push('#3B82F6', '#8B5CF6', '#EC4899');

  // Background
  ctx.fillStyle = colors[0] || '#3B82F6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Pattern elements
  const gridSize = canvas.width / 8;
  ctx.globalAlpha = 0.3;

  for (let x = 0; x < canvas.width; x += gridSize) {
    for (let y = 0; y < canvas.height; y += gridSize) {
      const colorIndex = ((x / gridSize) + (y / gridSize)) % colors.length;
      ctx.fillStyle = colors[colorIndex] || colors[0];

      // Alternating shapes
      if ((x / gridSize + y / gridSize) % 2 === 0) {
        ctx.beginPath();
        ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(x + gridSize * 0.2, y + gridSize * 0.2, gridSize * 0.6, gridSize * 0.6);
      }
    }
  }

  ctx.globalAlpha = 1;
};

// Main render function
export const renderAsset = async (
  assetType: AssetType,
  options: RenderOptions
): Promise<string> => {
  const config = getAssetConfig(assetType);
  if (!config) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }

  // Calculate canvas dimensions
  let width = 1200;
  let height = 1200;

  if (config.printSpec) {
    const w = config.printSpec.widthInches * config.printSpec.dpi;
    const h = config.printSpec.heightInches * config.printSpec.dpi;
    const scale = Math.min(2400 / w, 2400 / h, 1);
    width = Math.round(w * scale);
    height = Math.round(h * scale);
  } else if (config.aspectRatio) {
    const [w, h] = config.aspectRatio.split(':').map(Number);
    width = 1200;
    height = Math.round(1200 * (h / w));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Render based on asset type
  switch (assetType) {
    case AssetType.NameTag:
    case AssetType.NameTagBack:
      await renderNameTag(canvas, ctx, options);
      break;
    case AssetType.SocialPost:
    case AssetType.SocialProfile:
      await renderSocialPost(canvas, ctx, options);
      break;
    case AssetType.Banner:
    case AssetType.HangingSignage:
    case AssetType.OutdoorSignage:
      await renderBanner(canvas, ctx, options);
      break;
    case AssetType.EmailHeader:
      await renderEmailHeader(canvas, ctx, options);
      break;
    case AssetType.Tshirt:
    case AssetType.TshirtBack:
      await renderTshirt(canvas, ctx, options);
      break;
    case AssetType.EventSignage:
    case AssetType.DoorSignage:
    case AssetType.EaselSignage:
    case AssetType.LocationSignage:
    case AssetType.RoomSignage:
      await renderSignage(canvas, ctx, options);
      break;
    case AssetType.WifiSign:
      await renderWifiSign(canvas, ctx, options);
      break;
    case AssetType.SeamlessPattern:
      renderSeamlessPattern(canvas, ctx, options);
      break;
    default:
      // Generic render for other types
      await renderSignage(canvas, ctx, options, config.title);
  }

  return canvas.toDataURL('image/png');
};
