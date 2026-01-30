import { useState } from 'react';
import { AssetType } from '../types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset } from '../types';
import { fileToBase64 } from '../utils';
import { v4 as uuidv4 } from 'uuid';

interface UseAIOrchestratorProps {
  eventDetails: EventDetails;
  logos: LogoAsset[];
  styleImage: { file: File } | null;
  masterPatternImage: File | null;
  colorPalette: ColorInfo[];
  setColorPalette: (c: ColorInfo[]) => void;
  generatedAssets: GeneratedAsset[];
  setGeneratedAssets: React.Dispatch<React.SetStateAction<GeneratedAsset[]>>;
  ensureProtocol: (url: string) => string;
}

// Placeholder AI generation - in full implementation, this would call Lovable AI Gateway
const generatePlaceholderContent = async (type: AssetType, eventDetails: EventDetails): Promise<string | string[] | ColorInfo[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  switch (type) {
    case AssetType.Palette:
      return [
        { hex: '#d946ef', rgb: 'rgb(217, 70, 239)', cmyk: 'C10 M71 Y0 K6', hsv: 'hsv(292, 71%, 94%)', pantone: 'Pantone 2385 C', name: 'Fuchsia' },
        { hex: '#a855f7', rgb: 'rgb(168, 85, 247)', cmyk: 'C32 M66 Y0 K3', hsv: 'hsv(271, 66%, 97%)', pantone: 'Pantone 265 C', name: 'Purple' },
        { hex: '#1f2937', rgb: 'rgb(31, 41, 55)', cmyk: 'C44 M25 Y0 K78', hsv: 'hsv(215, 44%, 22%)', pantone: 'Pantone 433 C', name: 'Dark Gray' },
        { hex: '#ffffff', rgb: 'rgb(255, 255, 255)', cmyk: 'C0 M0 Y0 K0', hsv: 'hsv(0, 0%, 100%)', pantone: 'White', name: 'White' },
      ];

    case AssetType.Slogans:
      return [
        `${eventDetails.name}: Where Innovation Meets Excellence`,
        `Join us at ${eventDetails.name} - Transform Your Future`,
        `${eventDetails.name}: Connect. Learn. Grow.`,
        `Experience the Future at ${eventDetails.name}`,
        `${eventDetails.name}: Your Journey Starts Here`
      ];

    case AssetType.MarketingCopy:
      return `# ${eventDetails.name}\n\n${eventDetails.description || 'An incredible event experience awaits you.'}\n\n## Event Details\n- **Date:** ${eventDetails.date || 'TBA'}\n- **Location:** ${eventDetails.location || 'TBA'}\n\n## Why Attend?\n- Network with industry leaders\n- Learn from expert speakers\n- Discover cutting-edge innovations\n\nDon't miss this opportunity to be part of something extraordinary!`;

    case AssetType.RunOfShow:
      return `# ${eventDetails.name} - Run of Show\n\n## Schedule\n\n### Morning\n- 08:00 - Registration & Coffee\n- 09:00 - Opening Keynote\n- 10:30 - Breakout Sessions\n\n### Afternoon\n- 12:00 - Networking Lunch\n- 14:00 - Panel Discussions\n- 16:00 - Workshops\n\n### Evening\n- 18:00 - Closing Remarks\n- 19:00 - Reception`;

    default:
      // For image-based assets, return a placeholder gradient
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#d946ef');
        gradient.addColorStop(1, '#a855f7');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(eventDetails.name || 'Your Event', canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = '18px Inter, sans-serif';
        ctx.fillText(type.replace(/_/g, ' '), canvas.width / 2, canvas.height / 2 + 20);
      }
      return canvas.toDataURL('image/png');
  }
};

export const useAIOrchestrator = ({
  eventDetails,
  logos,
  styleImage,
  masterPatternImage,
  colorPalette,
  setColorPalette,
  generatedAssets,
  setGeneratedAssets,
  ensureProtocol
}: UseAIOrchestratorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  const generateAssets = async (assetsToGenerate: GeneratedAsset[], currentStyleDesc: string, paletteOverride?: ColorInfo[]) => {
    setIsLoading(true);
    const primaryLogo = logos.length > 0 ? logos[0].file : null;

    try {
      let completedCount = 0;
      const total = assetsToGenerate.filter(a => a.isLoading).length;
      setGenerationProgress({ current: 0, total });

      // Generate Palette first if included
      const paletteAsset = assetsToGenerate.find(a => a.type === AssetType.Palette && a.isLoading);
      if (paletteAsset) {
        const paletteContent = await generatePlaceholderContent(AssetType.Palette, eventDetails) as ColorInfo[];
        setColorPalette(paletteContent);
        setGeneratedAssets(prev => prev.map(a =>
          a.id === paletteAsset.id ? { ...a, content: paletteContent, isLoading: false } : a
        ));
        completedCount++;
        setGenerationProgress({ current: completedCount, total });
      }

      // Generate other assets
      for (const asset of assetsToGenerate.filter(a => a.isLoading && a.type !== AssetType.Palette)) {
        try {
          const content = await generatePlaceholderContent(asset.type, eventDetails);
          setGeneratedAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, content, isLoading: false } : a
          ));
        } catch (error) {
          console.error(`Failed to generate ${asset.type}:`, error);
          setGeneratedAssets(prev => prev.map(a =>
            a.id === asset.id ? { ...a, content: 'Generation failed', isLoading: false } : a
          ));
        }
        completedCount++;
        setGenerationProgress({ current: completedCount, total });
      }

    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generateAssets,
    isLoading,
    setIsLoading,
    generationProgress,
    setGenerationProgress
  };
};
