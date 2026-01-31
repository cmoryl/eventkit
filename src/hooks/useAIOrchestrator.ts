import { useState } from 'react';
import { AssetType } from '@/types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset, VenueVideoAnalysis } from '@/types';
import { generatePlaceholderContent } from '@/services/assetGenerator';
import { fileToBase64 } from '@/utils';

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

interface GenerationResult {
  id: string;
  success: boolean;
  content?: string | string[] | ColorInfo[];
  error?: string;
}

// Batch size for parallel generation
const PARALLEL_BATCH_SIZE = 3;

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
    masterPatternFile?: File | null,
    venueImageFile?: File | null,
    venueVideoAnalysisData?: VenueVideoAnalysis | null
  ) => {
    setIsLoading(true);
    
    // Prepare base64 images in parallel
    const [primaryLogoBase64, vibeImageBase64, masterPatternBase64, venueImageBase64] = await Promise.all([
      // Primary logo
      (async () => {
        if (logos.length > 0 && logos[0].file) {
          try {
            const b64 = await fileToBase64(logos[0].file);
            return `data:${b64.type};base64,${b64.data}`;
          } catch (e) {
            console.warn('Failed to convert logo to base64:', e);
            return logos[0].url;
          }
        }
        return undefined;
      })(),
      // Vibe image
      (async () => {
        const vibeFile = vibeImageFile || styleImage?.file;
        if (vibeFile) {
          try {
            const b64 = await fileToBase64(vibeFile);
            return `data:${b64.type};base64,${b64.data}`;
          } catch (e) {
            console.warn('Failed to convert vibe image to base64:', e);
          }
        }
        return undefined;
      })(),
      // Master pattern
      (async () => {
        const patternFile = masterPatternFile || masterPatternImage;
        if (patternFile) {
          try {
            const b64 = await fileToBase64(patternFile);
            return `data:${b64.type};base64,${b64.data}`;
          } catch (e) {
            console.warn('Failed to convert master pattern to base64:', e);
          }
        }
        return undefined;
      })(),
      // Venue image
      (async () => {
        if (venueImageFile) {
          try {
            const b64 = await fileToBase64(venueImageFile);
            return `data:${b64.type};base64,${b64.data}`;
          } catch (e) {
            console.warn('Failed to convert venue image to base64:', e);
          }
        }
        // Use best frame from video analysis if available
        if (venueVideoAnalysisData?.keyFrames?.length) {
          return venueVideoAnalysisData.keyFrames[0].imageData;
        }
        return undefined;
      })(),
    ]);

    // Log venue video analysis data for spatial awareness
    if (venueVideoAnalysisData?.success) {
      console.log('Venue video analysis available:', {
        areas: venueVideoAnalysisData.areas.length,
        keyFrames: venueVideoAnalysisData.keyFrames.length,
        recommendations: venueVideoAnalysisData.assetRecommendations.length,
        venueType: venueVideoAnalysisData.overallAssessment.venueType,
        estimatedArea: venueVideoAnalysisData.overallAssessment.totalEstimatedArea,
      });
    }

    try {
      const loadingAssets = assetsToGenerate.filter(a => a.isLoading);
      const total = loadingAssets.length;
      setGenerationProgress({ current: 0, total });

      // Get or generate color palette first
      let currentPalette = paletteOverride || colorPalette;

      // Generate Palette first if included (must be sequential)
      const paletteAsset = loadingAssets.find(a => a.type === AssetType.Palette);
      if (paletteAsset) {
        const paletteContent = await generatePlaceholderContent(
          AssetType.Palette, 
          eventDetails, 
          [], 
          primaryLogoBase64,
          currentStyleDesc,
          vibeImageBase64,
          masterPatternBase64,
          venueImageBase64
        ) as ColorInfo[];
        setColorPalette(paletteContent);
        currentPalette = paletteContent;
        setGeneratedAssets(prev => prev.map(a =>
          a.id === paletteAsset.id ? { ...a, content: paletteContent, isLoading: false } : a
        ));
        setGenerationProgress({ current: 1, total });
      }

      // Generate other assets in parallel batches
      const otherAssets = loadingAssets.filter(a => a.type !== AssetType.Palette);
      let completedCount = paletteAsset ? 1 : 0;

      // Process in batches for better resource management
      for (let i = 0; i < otherAssets.length; i += PARALLEL_BATCH_SIZE) {
        const batch = otherAssets.slice(i, i + PARALLEL_BATCH_SIZE);
        
        // Generate batch in parallel using Promise.allSettled
        const results = await Promise.allSettled(
          batch.map(async (asset): Promise<GenerationResult> => {
            try {
              const content = await generatePlaceholderContent(
                asset.type,
                eventDetails,
                currentPalette,
                primaryLogoBase64,
                currentStyleDesc,
                vibeImageBase64,
                masterPatternBase64,
                venueImageBase64
              );
              return { id: asset.id, success: true, content };
            } catch (error) {
              console.error(`Failed to generate ${asset.type}:`, error);
              return { 
                id: asset.id, 
                success: false, 
                error: error instanceof Error ? error.message : 'Generation failed' 
              };
            }
          })
        );

        // Update assets with results
        results.forEach((result, index) => {
          const asset = batch[index];
          if (result.status === 'fulfilled') {
            const data = result.value;
            setGeneratedAssets(prev => prev.map(a =>
              a.id === data.id 
                ? { ...a, content: data.success ? data.content! : 'Generation failed', isLoading: false } 
                : a
            ));
          } else {
            // Promise rejected
            setGeneratedAssets(prev => prev.map(a =>
              a.id === asset.id ? { ...a, content: 'Generation failed', isLoading: false } : a
            ));
          }
          completedCount++;
        });

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
