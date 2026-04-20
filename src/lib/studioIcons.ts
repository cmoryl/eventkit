import {
  Sparkles,
  Palette,
  Printer,
  Shirt,
  Share2,
  Presentation,
  Building,
  Ticket,
  UtensilsCrossed,
  Video,
  FileText,
  Camera,
  Shield,
  type LucideIcon,
} from 'lucide-react';

/**
 * Maps icon name strings (from STUDIO_DEFINITIONS) to Lucide icon components.
 * Keep keys in sync with the `icon` field in src/types/studio.types.ts.
 */
export const STUDIO_ICON_MAP: Record<string, LucideIcon> = {
  Palette,
  Printer,
  Shirt,
  Share2,
  Presentation,
  Building,
  Ticket,
  UtensilsCrossed,
  Video,
  FileText,
  Camera,
  Shield,
};

export const getStudioIcon = (iconName?: string): LucideIcon =>
  (iconName && STUDIO_ICON_MAP[iconName]) || Sparkles;
