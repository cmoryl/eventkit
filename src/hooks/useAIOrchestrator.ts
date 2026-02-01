import { useState, useCallback, useRef } from 'react';
import { AssetType } from '@/types';
import type { EventDetails, GeneratedAsset, ColorInfo, LogoAsset, VenueVideoAnalysis } from '@/types';
import type { RenderEngine } from '@/services/aiBrain/types';
import { generatePlaceholderContent, optimizeGenerationStrategy, prioritizeAssets } from '@/services/assetGenerator';
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

// Enhanced progress info with time estimates
export interface GenerationProgressInfo {
  current: number;
  total: number;
  estimatedAICalls: number;
  completedAICalls: number;
  startTime: number;
  averageTimePerAsset: number;
  estimatedSecondsRemaining: number;
  currentAssetName: string;
  phase: 'preparing' | 'analyzing' | 'generating' | 'complete';
}

// Batch size for parallel generation
const PARALLEL_BATCH_SIZE = 3;

// Average time per asset type (in ms) - used for initial estimates
const ASSET_TIME_ESTIMATES: Record<string, number> = {
  'PALETTE': 2000,
  'SLOGANS': 3000,
  'MARKETING_COPY': 4000,
  'RUN_OF_SHOW': 4000,
  'STYLE_GUIDE': 1000, // Local generation
  'AGENDA_HIGHLIGHTS': 1000, // Local generation
  // Image assets
  'DEFAULT': 8000, // AI image generation average
};

const getEstimatedTimeForAsset = (assetType: string): number => {
  return ASSET_TIME_ESTIMATES[assetType] || ASSET_TIME_ESTIMATES['DEFAULT'];
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
  const [generationProgress, setGenerationProgress] = useState<GenerationProgressInfo>({
    current: 0,
    total: 0,
    estimatedAICalls: 0,
    completedAICalls: 0,
    startTime: 0,
    averageTimePerAsset: 0,
    estimatedSecondsRemaining: 0,
    currentAssetName: '',
    phase: 'preparing'
  });
  
  // Track timing for dynamic estimates
  const timingHistory = useRef<number[]>([]);

  const generateAssets = async (
    assetsToGenerate: GeneratedAsset[], 
    currentStyleDesc: string, 
    paletteOverride?: ColorInfo[],
    vibeImageFile?: File | null,
    masterPatternFile?: File | null,
    venueImageFile?: File | null,
    venueVideoAnalysisData?: VenueVideoAnalysis | null,
    renderEngine?: RenderEngine
  ) => {
    setIsLoading(true);
    const startTime = Date.now();
    
    // Get asset types for strategy optimization
    const assetTypes = assetsToGenerate.filter(a => a.isLoading).map(a => String(a.type));
    const hasVibeImage = !!(vibeImageFile || styleImage?.file);
    const hasLogo = logos.length > 0;
    
    // Calculate optimized generation strategy
    const strategy = optimizeGenerationStrategy(assetTypes, hasVibeImage, hasLogo);
    
    // Prioritize assets for better UX (palette first, then visible assets)
    const prioritizedTypes = prioritizeAssets(assetTypes);
    
    // Calculate initial time estimate
    const initialEstimate = assetTypes.reduce((sum, type) => sum + getEstimatedTimeForAsset(type), 0);
    
    setGenerationProgress({
      current: 0,
      total: assetsToGenerate.filter(a => a.isLoading).length,
      estimatedAICalls: strategy.estimatedAICalls,
      completedAICalls: 0,
      startTime,
      averageTimePerAsset: initialEstimate / assetTypes.length,
      estimatedSecondsRemaining: Math.ceil(initialEstimate / 1000),
      currentAssetName: 'Preparing...',
      phase: 'preparing'
    });
    
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
    
    // Update phase to analyzing if we have reference images
    if (hasVibeImage && strategy.shouldPreAnalyze) {
      setGenerationProgress(prev => ({
        ...prev,
        phase: 'analyzing',
        currentAssetName: 'Analyzing reference image...'
      }));
    }

    try {
      const loadingAssets = assetsToGenerate.filter(a => a.isLoading);
      const total = loadingAssets.length;
      
      // Update to generating phase
      setGenerationProgress(prev => ({
        ...prev,
        current: 0,
        total,
        phase: 'generating',
        currentAssetName: 'Starting generation...'
      }));

      // Get or generate color palette first
      let currentPalette = paletteOverride || colorPalette;
      let completedAICalls = 0;

      // Generate Palette first if included (must be sequential)
      const paletteAsset = loadingAssets.find(a => a.type === AssetType.Palette);
      if (paletteAsset) {
        setGenerationProgress(prev => ({
          ...prev,
          currentAssetName: 'Color Palette'
        }));
        
        const assetStart = Date.now();
        const paletteContent = await generatePlaceholderContent(
          AssetType.Palette, 
          eventDetails, 
          [], 
          primaryLogoBase64,
          currentStyleDesc,
          vibeImageBase64,
          masterPatternBase64,
          venueImageBase64,
          renderEngine
        ) as ColorInfo[];
        
        const assetTime = Date.now() - assetStart;
        timingHistory.current.push(assetTime);
        completedAICalls++;
        
        setColorPalette(paletteContent);
        currentPalette = paletteContent;
        setGeneratedAssets(prev => prev.map(a =>
          a.id === paletteAsset.id ? { ...a, content: paletteContent, isLoading: false } : a
        ));
        
        // Update progress with timing info
        const avgTime = timingHistory.current.reduce((a, b) => a + b, 0) / timingHistory.current.length;
        const remaining = total - 1;
        setGenerationProgress(prev => ({
          ...prev,
          current: 1,
          completedAICalls,
          averageTimePerAsset: avgTime,
          estimatedSecondsRemaining: Math.ceil((remaining * avgTime) / 1000)
        }));
      }

      // Generate other assets in parallel batches
      const otherAssets = loadingAssets.filter(a => a.type !== AssetType.Palette);
      let completedCount = paletteAsset ? 1 : 0;

      // Process in batches for better resource management
      for (let i = 0; i < otherAssets.length; i += PARALLEL_BATCH_SIZE) {
        const batch = otherAssets.slice(i, i + PARALLEL_BATCH_SIZE);
        
        // Update current asset names
        const batchNames = batch.map(a => a.title).join(', ');
        setGenerationProgress(prev => ({
          ...prev,
          currentAssetName: batchNames
        }));
        
        const batchStart = Date.now();
        
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
                venueImageBase64,
                renderEngine
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
        
        const batchTime = Date.now() - batchStart;
        // Add average time per asset in batch
        timingHistory.current.push(batchTime / batch.length);
        completedAICalls += batch.length;

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

        // Update progress with improved time estimates
        const avgTime = timingHistory.current.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, timingHistory.current.length);
        const remaining = total - completedCount;
        setGenerationProgress(prev => ({
          ...prev,
          current: completedCount,
          completedAICalls,
          averageTimePerAsset: avgTime,
          estimatedSecondsRemaining: Math.max(0, Math.ceil((remaining * avgTime) / 1000))
        }));
      }
      
      // Mark complete
      setGenerationProgress(prev => ({
        ...prev,
        phase: 'complete',
        estimatedSecondsRemaining: 0,
        currentAssetName: 'Complete!'
      }));

    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsLoading(false);
      timingHistory.current = []; // Reset for next generation
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
