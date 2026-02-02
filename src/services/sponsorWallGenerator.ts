// Sponsor Wall Generator Service
// Automatically arranges sponsor logos by tier for sponsor wall/banner assets

import type { SponsorLogo, SponsorLogosLibrary } from '@/types/brand.types';

export interface SponsorTierConfig {
  tier: SponsorLogo['tier'];
  label: string;
  logoSizeMultiplier: number;
  maxPerRow: number;
  backgroundColor?: string;
  prominence: number; // 1-6, where 1 is highest
}

export const TIER_CONFIGS: SponsorTierConfig[] = [
  { tier: 'platinum', label: 'Platinum Sponsors', logoSizeMultiplier: 2.5, maxPerRow: 2, prominence: 1 },
  { tier: 'gold', label: 'Gold Sponsors', logoSizeMultiplier: 2.0, maxPerRow: 3, prominence: 2 },
  { tier: 'silver', label: 'Silver Sponsors', logoSizeMultiplier: 1.5, maxPerRow: 4, prominence: 3 },
  { tier: 'bronze', label: 'Bronze Sponsors', logoSizeMultiplier: 1.0, maxPerRow: 5, prominence: 4 },
  { tier: 'partner', label: 'Partners', logoSizeMultiplier: 0.8, maxPerRow: 6, prominence: 5 },
  { tier: 'media', label: 'Media Partners', logoSizeMultiplier: 0.8, maxPerRow: 6, prominence: 6 },
];

export interface SponsorWallLayout {
  sections: SponsorSection[];
  totalSponsors: number;
  estimatedHeight: number;
  estimatedWidth: number;
}

export interface SponsorSection {
  tier: SponsorLogo['tier'];
  label: string;
  sponsors: SponsorLogo[];
  rows: SponsorLogo[][];
  logoSize: { width: number; height: number };
  sectionHeight: number;
}

/**
 * Calculate optimal sponsor wall layout based on available sponsors
 */
export function calculateSponsorWallLayout(
  sponsorLogos: SponsorLogosLibrary | undefined,
  options: {
    containerWidth: number;
    containerHeight: number;
    baseLogoSize?: number;
    padding?: number;
    sectionGap?: number;
  }
): SponsorWallLayout {
  const {
    containerWidth,
    containerHeight,
    baseLogoSize = 100,
    padding = 20,
    sectionGap = 40,
  } = options;

  if (!sponsorLogos || sponsorLogos.all.length === 0) {
    return {
      sections: [],
      totalSponsors: 0,
      estimatedHeight: 0,
      estimatedWidth: containerWidth,
    };
  }

  const sections: SponsorSection[] = [];
  let currentY = padding;

  for (const tierConfig of TIER_CONFIGS) {
    const tierSponsors = sponsorLogos.byTier[tierConfig.tier] || [];
    
    if (tierSponsors.length === 0) continue;

    const logoWidth = baseLogoSize * tierConfig.logoSizeMultiplier;
    const logoHeight = logoWidth * 0.6; // Assume 5:3 aspect ratio for logos
    const sponsorsPerRow = Math.min(
      tierConfig.maxPerRow,
      Math.floor((containerWidth - padding * 2) / (logoWidth + padding))
    );

    // Organize into rows
    const rows: SponsorLogo[][] = [];
    for (let i = 0; i < tierSponsors.length; i += sponsorsPerRow) {
      rows.push(tierSponsors.slice(i, i + sponsorsPerRow));
    }

    const sectionHeight = 
      40 + // Label height
      rows.length * (logoHeight + padding) +
      sectionGap;

    sections.push({
      tier: tierConfig.tier,
      label: tierConfig.label,
      sponsors: tierSponsors,
      rows,
      logoSize: { width: logoWidth, height: logoHeight },
      sectionHeight,
    });

    currentY += sectionHeight;
  }

  return {
    sections,
    totalSponsors: sponsorLogos.all.length,
    estimatedHeight: currentY,
    estimatedWidth: containerWidth,
  };
}

/**
 * Build a prompt for AI generation that includes sponsor tier information
 */
export function buildSponsorWallPrompt(
  eventName: string,
  sponsorLogos: SponsorLogosLibrary | undefined,
  styleDescription: string,
  assetType: 'wall' | 'banner' | 'grid' = 'wall'
): string {
  const parts: string[] = [];

  // Base prompt
  if (assetType === 'wall') {
    parts.push(`Create a professional sponsor wall display for "${eventName}".`);
    parts.push('The wall should prominently showcase all event sponsors arranged by their sponsorship tier.');
  } else if (assetType === 'banner') {
    parts.push(`Create a horizontal sponsor banner for "${eventName}".`);
    parts.push('Arrange sponsor logos horizontally with tier-appropriate sizing.');
  } else {
    parts.push(`Create a digital sponsor grid showcase for "${eventName}".`);
    parts.push('Design a clean grid layout for screen display.');
  }

  // Style
  if (styleDescription) {
    parts.push(`Style: ${styleDescription}.`);
  }

  // Sponsor tier information
  if (sponsorLogos && sponsorLogos.all.length > 0) {
    const tierSummary: string[] = [];
    
    for (const tierConfig of TIER_CONFIGS) {
      const count = sponsorLogos.byTier[tierConfig.tier]?.length || 0;
      if (count > 0) {
        const names = sponsorLogos.byTier[tierConfig.tier]
          .slice(0, 3)
          .map(s => s.name)
          .join(', ');
        tierSummary.push(
          `${tierConfig.label}: ${count} sponsor${count > 1 ? 's' : ''} (${names}${count > 3 ? '...' : ''})`
        );
      }
    }

    if (tierSummary.length > 0) {
      parts.push('Sponsor hierarchy:');
      parts.push(tierSummary.join('; '));
    }

    // Size guidelines
    parts.push('Platinum sponsors should be largest and most prominent (top/center).');
    parts.push('Gold sponsors are slightly smaller but still prominent.');
    parts.push('Silver and bronze sponsors are progressively smaller.');
    parts.push('Partner and media logos are smallest, typically in a footer row.');
  } else {
    parts.push('Include placeholder areas for sponsor logos arranged by tier.');
    parts.push('Show tier labels: Platinum (largest), Gold, Silver, Bronze, Partners.');
  }

  // Quality markers
  parts.push('Professional corporate design, clean layout, high contrast for visibility.');
  parts.push('Include subtle section dividers or tier labels for organization.');

  return parts.join(' ');
}

/**
 * Get tier badge color for UI display
 */
export function getTierBadgeColor(tier: SponsorLogo['tier']): string {
  switch (tier) {
    case 'platinum': return 'bg-gradient-to-r from-slate-200 to-slate-400 text-slate-900';
    case 'gold': return 'bg-gradient-to-r from-amber-300 to-amber-500 text-amber-900';
    case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800';
    case 'bronze': return 'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900';
    case 'partner': return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    case 'media': return 'bg-gradient-to-r from-purple-400 to-purple-600 text-white';
    default: return 'bg-muted text-muted-foreground';
  }
}

/**
 * Get tier priority for sorting (lower = higher priority)
 */
export function getTierPriority(tier: SponsorLogo['tier']): number {
  const config = TIER_CONFIGS.find(c => c.tier === tier);
  return config?.prominence || 99;
}

/**
 * Sort sponsors by tier priority
 */
export function sortSponsorsByTier(sponsors: SponsorLogo[]): SponsorLogo[] {
  return [...sponsors].sort((a, b) => getTierPriority(a.tier) - getTierPriority(b.tier));
}
