import { useState } from 'react';
import { AssetType } from '../types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset } from '../types';
import { generatePlaceholderContent } from '../services/assetGenerator';
import { fileToBase64 } from '../utils';

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

  const generateAssets = async (
    assetsToGenerate: GeneratedAsset[], 
    currentStyleDesc: string, 
    paletteOverride?: ColorInfo[],
    vibeImageFile?: File | null,
    masterPatternFile?: File | null
  ) => {
    setIsLoading(true);
    
    // Get primary logo as base64 for AI reference
    let primaryLogoBase64: string | undefined;
    if (logos.length > 0 && logos[0].file) {
      try {
        const b64 = await fileToBase64(logos[0].file);
        primaryLogoBase64 = `data:${b64.type};base64,${b64.data}`;
      } catch (e) {
        console.warn('Failed to convert logo to base64:', e);
        primaryLogoBase64 = logos[0].url;
      }
    }
    
    // Convert vibe image to base64 for AI reference
    let vibeImageBase64: string | undefined;
    const vibeFile = vibeImageFile || styleImage?.file;
    if (vibeFile) {
      try {
        const b64 = await fileToBase64(vibeFile);
        vibeImageBase64 = `data:${b64.type};base64,${b64.data}`;
      } catch (e) {
        console.warn('Failed to convert vibe image to base64:', e);
      }
    }
    
    // Convert master pattern to base64 for AI reference
    let masterPatternBase64: string | undefined;
    const patternFile = masterPatternFile || masterPatternImage;
    if (patternFile) {
      try {
        const b64 = await fileToBase64(patternFile);
        masterPatternBase64 = `data:${b64.type};base64,${b64.data}`;
      } catch (e) {
        console.warn('Failed to convert master pattern to base64:', e);
      }
    }

    try {
      let completedCount = 0;
      const total = assetsToGenerate.filter(a => a.isLoading).length;
      setGenerationProgress({ current: 0, total });

      // Get or generate color palette first
      let currentPalette = paletteOverride || colorPalette;

      // Generate Palette first if included
      const paletteAsset = assetsToGenerate.find(a => a.type === AssetType.Palette && a.isLoading);
      if (paletteAsset) {
        const paletteContent = await generatePlaceholderContent(
          AssetType.Palette, 
          eventDetails, 
          [], 
          primaryLogoBase64,
          currentStyleDesc,
          vibeImageBase64,
          masterPatternBase64
        ) as ColorInfo[];
        setColorPalette(paletteContent);
        currentPalette = paletteContent;
        setGeneratedAssets(prev => prev.map(a =>
          a.id === paletteAsset.id ? { ...a, content: paletteContent, isLoading: false } : a
        ));
        completedCount++;
        setGenerationProgress({ current: completedCount, total });
      }

      // Generate other assets with color palette, logo, and style references
      for (const asset of assetsToGenerate.filter(a => a.isLoading && a.type !== AssetType.Palette)) {
        try {
          const content = await generatePlaceholderContent(
            asset.type,
            eventDetails,
            currentPalette,
            primaryLogoBase64,
            currentStyleDesc,
            vibeImageBase64,
            masterPatternBase64
          );
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
