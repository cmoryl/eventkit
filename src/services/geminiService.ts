// AI Service for Event Design Kit Generator
// Provides text refinement, color analysis, and image editing capabilities
import type { ColorInfo, GeneratedAsset } from '../types';
import { AssetType } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Flag to determine if we should use AI or fallback to local generation
const USE_AI_GENERATION = true;
const COLOR_NAMES: Record<string, string> = {
  '#FF0000': 'Red',
  '#FF6B6B': 'Light Coral',
  '#DC143C': 'Crimson',
  '#8B0000': 'Dark Red',
  '#FF4500': 'Orange Red',
  '#FF8C00': 'Dark Orange',
  '#FFA500': 'Orange',
  '#FFD700': 'Gold',
  '#FFFF00': 'Yellow',
  '#ADFF2F': 'Green Yellow',
  '#7FFF00': 'Chartreuse',
  '#00FF00': 'Lime',
  '#32CD32': 'Lime Green',
  '#228B22': 'Forest Green',
  '#006400': 'Dark Green',
  '#008080': 'Teal',
  '#00CED1': 'Dark Turquoise',
  '#00FFFF': 'Cyan',
  '#4169E1': 'Royal Blue',
  '#0000FF': 'Blue',
  '#000080': 'Navy',
  '#4B0082': 'Indigo',
  '#8B008B': 'Dark Magenta',
  '#9932CC': 'Dark Orchid',
  '#800080': 'Purple',
  '#FF00FF': 'Magenta',
  '#FF69B4': 'Hot Pink',
  '#FFC0CB': 'Pink',
  '#FFFFFF': 'White',
  '#F5F5F5': 'White Smoke',
  '#D3D3D3': 'Light Gray',
  '#A9A9A9': 'Dark Gray',
  '#808080': 'Gray',
  '#696969': 'Dim Gray',
  '#404040': 'Charcoal',
  '#333333': 'Dark Charcoal',
  '#1A1A1A': 'Near Black',
  '#000000': 'Black',
  '#F5F5DC': 'Beige',
  '#D2B48C': 'Tan',
  '#8B4513': 'Saddle Brown',
  '#A0522D': 'Sienna',
  '#CD853F': 'Peru',
};

// Pantone approximation database
const PANTONE_APPROXIMATIONS: Record<string, string> = {
  '#FF0000': 'PANTONE 185 C',
  '#FF6B6B': 'PANTONE 178 C',
  '#DC143C': 'PANTONE 199 C',
  '#FF4500': 'PANTONE Orange 021 C',
  '#FFA500': 'PANTONE 1375 C',
  '#FFD700': 'PANTONE 116 C',
  '#FFFF00': 'PANTONE Yellow C',
  '#00FF00': 'PANTONE 802 C',
  '#228B22': 'PANTONE 349 C',
  '#006400': 'PANTONE 350 C',
  '#008080': 'PANTONE 3292 C',
  '#00CED1': 'PANTONE 319 C',
  '#00FFFF': 'PANTONE Process Cyan C',
  '#4169E1': 'PANTONE 286 C',
  '#0000FF': 'PANTONE Blue 072 C',
  '#000080': 'PANTONE 289 C',
  '#4B0082': 'PANTONE 2695 C',
  '#800080': 'PANTONE 2613 C',
  '#FF00FF': 'PANTONE Rhodamine Red C',
  '#FF69B4': 'PANTONE 2375 C',
  '#FFC0CB': 'PANTONE 196 C',
  '#FFFFFF': 'PANTONE White',
  '#000000': 'PANTONE Black C',
  '#808080': 'PANTONE Cool Gray 8 C',
};

// Find the closest color name
const findClosestColorName = (hex: string): string => {
  const targetRGB = hexToRgbValues(hex);
  let closestName = 'Custom Color';
  let closestDistance = Infinity;

  for (const [colorHex, name] of Object.entries(COLOR_NAMES)) {
    const rgb = hexToRgbValues(colorHex);
    const distance = Math.sqrt(
      Math.pow(targetRGB.r - rgb.r, 2) +
      Math.pow(targetRGB.g - rgb.g, 2) +
      Math.pow(targetRGB.b - rgb.b, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }

  return closestName;
};

// Find closest Pantone match
const findClosestPantone = (hex: string): string => {
  const targetRGB = hexToRgbValues(hex);
  let closestPantone = 'PANTONE Custom';
  let closestDistance = Infinity;

  for (const [colorHex, pantone] of Object.entries(PANTONE_APPROXIMATIONS)) {
    const rgb = hexToRgbValues(colorHex);
    const distance = Math.sqrt(
      Math.pow(targetRGB.r - rgb.r, 2) +
      Math.pow(targetRGB.g - rgb.g, 2) +
      Math.pow(targetRGB.b - rgb.b, 2)
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPantone = pantone;
    }
  }

  // Add approximate indicator if not exact match
  if (closestDistance > 30) {
    closestPantone = `${closestPantone} (approx.)`;
  }

  return closestPantone;
};

// Convert hex to RGB values
const hexToRgbValues = (hex: string): { r: number; g: number; b: number } => {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.slice(0, 2), 16),
    g: parseInt(cleanHex.slice(2, 4), 16),
    b: parseInt(cleanHex.slice(4, 6), 16),
  };
};

// Get comprehensive color details
export const getColorDetails = async (hex: string): Promise<ColorInfo> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  const { r, g, b } = hexToRgbValues(hex);
  const rgb = `rgb(${r}, ${g}, ${b})`;

  // RGB to CMYK conversion
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const k = 1 - Math.max(rNorm, gNorm, bNorm);
  let c = 0, m = 0, y = 0;

  if (k < 1) {
    c = (1 - rNorm - k) / (1 - k);
    m = (1 - gNorm - k) / (1 - k);
    y = (1 - bNorm - k) / (1 - k);
  }

  const cmyk = `C${Math.round(c * 100)} M${Math.round(m * 100)} Y${Math.round(y * 100)} K${Math.round(k * 100)}`;

  // RGB to HSV conversion
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = 60 * (((gNorm - bNorm) / delta) % 6);
    } else if (max === gNorm) {
      h = 60 * ((bNorm - rNorm) / delta + 2);
    } else {
      h = 60 * ((rNorm - gNorm) / delta + 4);
    }
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : (delta / max);
  const v = max;

  const hsv = `hsv(${Math.round(h)}°, ${Math.round(s * 100)}%, ${Math.round(v * 100)}%)`;

  return {
    hex: hex.toUpperCase(),
    rgb,
    cmyk,
    hsv,
    pantone: findClosestPantone(hex),
    name: findClosestColorName(hex),
  };
};

// Text refinement with smart transformations
export const refineText = async (text: string, instruction: string): Promise<string> => {
  if (USE_AI_GENERATION) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-asset', {
        body: {
          type: 'refine_text',
          eventName: '',
          text,
          instruction,
        },
      });

      if (error) throw error;
      if (data?.result && typeof data.result === 'string') {
        return data.result;
      }
    } catch (e) {
      console.warn('AI text refinement failed, using fallback:', e);
    }
  }

  // Fallback to local transformations
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerInstruction = instruction.toLowerCase();

  // Shorten text
  if (lowerInstruction.includes('short') || lowerInstruction.includes('concise')) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    const shortened = sentences.slice(0, Math.max(2, Math.ceil(sentences.length * 0.5)));
    return shortened.join(' ').trim();
  }

  // Expand text
  if (lowerInstruction.includes('expand') || lowerInstruction.includes('detail')) {
    const lines = text.split('\n').filter(l => l.trim());
    const expanded = lines.map(line => {
      if (line.endsWith('.') || line.endsWith('!') || line.endsWith('?')) {
        return line;
      }
      return line + '.';
    });
    return expanded.join('\n\n') + '\n\nThis creates an engaging experience for all attendees, fostering meaningful connections and memorable moments.';
  }

  // Professional tone
  if (lowerInstruction.includes('professional') || lowerInstruction.includes('corporate')) {
    return text
      .replace(/!/g, '.')
      .replace(/awesome/gi, 'excellent')
      .replace(/great/gi, 'outstanding')
      .replace(/cool/gi, 'impressive')
      .replace(/fun/gi, 'engaging')
      .replace(/amazing/gi, 'remarkable')
      .replace(/super/gi, 'highly')
      .replace(/gonna/gi, 'going to')
      .replace(/wanna/gi, 'want to');
  }

  // Exciting tone
  if (lowerInstruction.includes('excit') || lowerInstruction.includes('energetic')) {
    return text
      .replace(/\./g, '!')
      .replace(/good/gi, 'amazing')
      .replace(/nice/gi, 'incredible')
      .replace(/interesting/gi, 'fascinating')
      .replace(/will be/gi, 'is going to be')
      .replace(/attendees/gi, 'participants');
  }

  // Fix grammar (basic improvements)
  if (lowerInstruction.includes('grammar') || lowerInstruction.includes('spell')) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([.,!?])(\w)/g, '$1 $2')
      .replace(/\bi\b/g, 'I')
      .replace(/(\.\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase())
      .trim();
  }

  // Bullet points
  if (lowerInstruction.includes('bullet') || lowerInstruction.includes('list')) {
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map(s => `• ${s.trim()}`).join('\n');
  }

  return text;
};

// Generate slogans for an event
export const generateSlogans = async (
  eventName: string,
  eventDescription: string,
  count: number = 5
): Promise<string[]> => {
  if (USE_AI_GENERATION) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-asset', {
        body: {
          type: 'slogans',
          eventName,
          eventDescription,
          count,
        },
      });

      if (error) throw error;
      if (data?.result && Array.isArray(data.result)) {
        return data.result;
      }
    } catch (e) {
      console.warn('AI slogan generation failed, using fallback:', e);
    }
  }

  // Fallback to local generation
  await new Promise(resolve => setTimeout(resolve, 800));

  const words = eventName.split(/\s+/).filter(w => w.length > 2);
  const keyword = words[0] || 'Event';

  const templates = [
    `Where ${keyword} Meets Innovation`,
    `Experience the Future of ${keyword}`,
    `${keyword}: Connect, Learn, Grow`,
    `Elevate Your ${keyword} Journey`,
    `The Premier ${keyword} Experience`,
    `${keyword} Redefined`,
    `Where Ideas Become Reality`,
    `Join the ${keyword} Movement`,
    `Your ${keyword} Transformation Starts Here`,
    `The ${keyword} You've Been Waiting For`,
    `Inspire. Connect. Transform.`,
    `Beyond the Ordinary ${keyword}`,
    `Shaping Tomorrow's ${keyword}`,
    `Where ${keyword} Leaders Gather`,
    `Unlock Your ${keyword} Potential`,
  ];

  const shuffled = templates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Image editing (placeholder - requires AI gateway)
export const editImageContent = async (
  assetType: AssetType,
  sourceImage: string,
  colorPalette: string[],
  prompt: string,
  customContent?: Record<string, string>,
  overlayImage?: string,
  maskImage?: string
): Promise<string> => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log('Edit image called with:', { assetType, prompt, customContent, hasOverlay: !!overlayImage, hasMask: !!maskImage });

  // For now, return the original image
  // When Lovable Cloud is enabled, this will use the AI gateway
  return sourceImage;
};

// Regenerate photorealistic shot
export const regeneratePhotorealisticShot = async (
  sourceAsset: GeneratedAsset,
  prompt: string,
  environmentFile?: File | null
): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Regenerate photorealistic shot:', { prompt, hasEnv: !!environmentFile });

  // Return original for now
  return sourceAsset.content as string;
};

// Generate marketing copy
export const generateMarketingCopy = async (
  eventName: string,
  eventDescription: string,
  eventDate: string,
  eventLocation: string
): Promise<string> => {
  if (USE_AI_GENERATION) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-asset', {
        body: {
          type: 'marketing_copy',
          eventName,
          eventDescription,
          eventDate,
          eventLocation,
        },
      });

      if (error) throw error;
      if (data?.result && typeof data.result === 'string') {
        return data.result;
      }
    } catch (e) {
      console.warn('AI marketing copy generation failed, using fallback:', e);
    }
  }

  // Fallback to local generation
  await new Promise(resolve => setTimeout(resolve, 600));

  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Date TBA';

  return `🎉 ${eventName.toUpperCase()} 🎉

${eventDescription || 'Join us for an unforgettable experience!'}

📅 Date: ${formattedDate}
📍 Location: ${eventLocation || 'Location TBA'}

---

What to Expect:
• Industry-leading speakers and workshops
• Networking opportunities with peers
• Hands-on interactive sessions
• Exclusive insights and takeaways

---

Don't miss this opportunity to connect, learn, and grow with the best in the industry.

Register now and be part of something extraordinary!

#${eventName.replace(/\s+/g, '')} #Event #Networking #Growth`;
};

// Generate run of show
export const generateRunOfShow = async (
  eventName: string,
  eventDate: string,
  eventDescription: string
): Promise<string> => {
  if (USE_AI_GENERATION) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-asset', {
        body: {
          type: 'run_of_show',
          eventName,
          eventDate,
          eventDescription,
        },
      });

      if (error) throw error;
      if (data?.result && typeof data.result === 'string') {
        return data.result;
      }
    } catch (e) {
      console.warn('AI run of show generation failed, using fallback:', e);
    }
  }

  // Fallback to local generation
  await new Promise(resolve => setTimeout(resolve, 600));

  const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Event Date';

  return `${eventName.toUpperCase()} - RUN OF SHOW
${formattedDate}
${'='.repeat(50)}

PRE-EVENT SETUP
───────────────
06:00 AM    Venue opens, setup begins
07:00 AM    A/V check and sound test
07:30 AM    Registration desk setup
08:00 AM    Staff briefing

MORNING SESSION
───────────────
08:30 AM    Registration & Welcome Coffee
09:00 AM    Opening Keynote
09:45 AM    Session Break (15 min)
10:00 AM    Morning Session 1
10:45 AM    Networking Break
11:00 AM    Morning Session 2
11:45 AM    Panel Discussion

LUNCH
───────────────
12:00 PM    Lunch & Networking (90 min)

AFTERNOON SESSION
───────────────
01:30 PM    Afternoon Keynote
02:15 PM    Workshop Sessions
03:00 PM    Coffee Break (15 min)
03:15 PM    Interactive Sessions
04:00 PM    Closing Remarks
04:30 PM    Reception & Networking

POST-EVENT
───────────────
06:00 PM    Event concludes
06:30 PM    Venue breakdown begins
08:00 PM    Complete venue clearance

NOTES:
• All times are approximate
• Staff should arrive 30 min before their assigned time
• Emergency contact: [TBD]`;
};

// Generate AI image for an asset
export const generateAssetImage = async (
  assetType: AssetType | string,
  eventName: string,
  eventDescription: string,
  styleDescription: string,
  colorPalette: string[],
  logoBase64?: string,
  location?: string,
  incorporateLocationStyle?: boolean,
  vibeImageBase64?: string,
  masterPatternBase64?: string,
  venueImageBase64?: string
): Promise<string | null> => {
  if (!USE_AI_GENERATION) return null;

  try {
    const assetTypeStr = typeof assetType === 'string' ? assetType : String(assetType);
    
    const { data, error } = await supabase.functions.invoke('generate-image', {
      body: {
        assetType: assetTypeStr,
        eventName,
        eventDescription,
        styleDescription,
        colorPalette,
        logoBase64,
        location,
        incorporateLocationStyle,
        vibeImageBase64,
        masterPatternBase64,
        venueImageBase64,
      },
    });

    if (error) {
      // Handle rate limits gracefully
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        console.warn('AI image generation rate limited, falling back to canvas');
        return null;
      }
      throw error;
    }
    
    if (data?.imageUrl) {
      return data.imageUrl;
    }
    
    if (data?.error) {
      console.warn('AI image generation returned error:', data.error);
      return null;
    }
  } catch (e) {
    console.warn('AI image generation failed:', e);
  }

  return null;
};

// Regenerate an existing asset with AI
export const regenerateAssetWithAI = async (
  assetType: AssetType | string,
  eventName: string,
  eventDescription: string,
  colorPalette: string[],
  customPrompt?: string,
  logoBase64?: string,
  location?: string,
  incorporateLocationStyle?: boolean,
  vibeImageBase64?: string,
  masterPatternBase64?: string,
  venueImageBase64?: string
): Promise<string | null> => {
  const styleDescription = customPrompt || 'Modern, professional design with clean aesthetics';
  return generateAssetImage(assetType, eventName, eventDescription, styleDescription, colorPalette, logoBase64, location, incorporateLocationStyle, vibeImageBase64, masterPatternBase64, venueImageBase64);
};

// Check if an asset type supports AI image generation
export const supportsAIGeneration = (assetType: AssetType): boolean => {
  const supportedTypes: AssetType[] = [
    AssetType.SocialPost,
    AssetType.Banner,
    AssetType.NameTag,
    AssetType.EmailHeader,
    AssetType.SocialStory,
    AssetType.EventSignage,
    AssetType.Tshirt,
    AssetType.TshirtBack,
    AssetType.Lanyard,
    AssetType.SwagBag,
    AssetType.StickerSheet,
    AssetType.ThankYouNote,
    AssetType.WifiSign,
    AssetType.Hat,
    AssetType.WaterBottle,
    AssetType.Menu,
    AssetType.Folder,
  ];
  return supportedTypes.includes(assetType);
};

// Extract dominant colors from an image
export const extractColorsFromImage = async (imageDataUrl: string): Promise<ColorInfo[]> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve([]);
        return;
      }

      // Sample a smaller size for performance
      const sampleSize = 100;
      canvas.width = sampleSize;
      canvas.height = sampleSize;
      ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

      const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
      const pixels = imageData.data;

      // Simple color quantization
      const colorMap = new Map<string, number>();

      for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.round(pixels[i] / 32) * 32;
        const g = Math.round(pixels[i + 1] / 32) * 32;
        const b = Math.round(pixels[i + 2] / 32) * 32;
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency and take top 5
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const colorPromises = sortedColors.map(async ([key]) => {
        const [r, g, b] = key.split(',').map(Number);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        return getColorDetails(hex);
      });

      const colors = await Promise.all(colorPromises);
      resolve(colors);
    };

    img.onerror = () => resolve([]);
    img.src = imageDataUrl;
  });
};
