// Venue Video Analysis Service
// Handles video frame extraction and AI-powered spatial analysis

import { supabase } from '@/integrations/supabase/client';

export interface VenueArea {
  name: string;
  description: string;
  dimensions: {
    estimated_width: string;
    estimated_height: string;
    estimated_depth: string;
  };
  surfaces: string[];
  suggestedAssets: {
    assetType: string;
    placement: string;
    recommendedSize: string;
  }[];
  lightingConditions: string;
  frameIndex: number;
}

export interface KeyFrame {
  frameIndex: number;
  description: string;
  bestFor: string[];
  imageData: string; // base64
}

export interface AssetRecommendation {
  assetType: string;
  priority: 'high' | 'medium' | 'low';
  recommendedQuantity: number;
  suggestedSizes: string[];
  placementAreas: string[];
}

export interface VenueAnalysis {
  success: boolean;
  areas: VenueArea[];
  overallAssessment: {
    venueType: string;
    totalEstimatedArea: string;
    primarySurfaces: string[];
    brandingOpportunities: string[];
    challengesAndConsiderations: string[];
  };
  keyFrames: KeyFrame[];
  assetRecommendations: AssetRecommendation[];
  extractedFrames: string[]; // All extracted frame base64 data
}

/**
 * Extract frames from a video file
 * @param videoFile The video file to extract frames from
 * @param numFrames Number of frames to extract (evenly distributed)
 * @returns Array of base64 encoded frame images
 */
export async function extractVideoFrames(
  videoFile: File,
  numFrames: number = 8
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to create canvas context'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const frames: string[] = [];
    let currentFrameIndex = 0;
    let frameTimestamps: number[] = [];

    video.onloadedmetadata = () => {
      const duration = video.duration;
      
      // Calculate evenly distributed timestamps
      for (let i = 0; i < numFrames; i++) {
        // Skip first and last 5% to avoid intro/outro frames
        const startOffset = duration * 0.05;
        const endOffset = duration * 0.95;
        const usableDuration = endOffset - startOffset;
        const timestamp = startOffset + (usableDuration * i) / (numFrames - 1);
        frameTimestamps.push(timestamp);
      }

      // Set canvas size to a reasonable resolution
      const maxWidth = 1280;
      const maxHeight = 720;
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      if (video.videoWidth > maxWidth) {
        canvas.width = maxWidth;
        canvas.height = maxWidth / aspectRatio;
      } else if (video.videoHeight > maxHeight) {
        canvas.height = maxHeight;
        canvas.width = maxHeight * aspectRatio;
      } else {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }

      // Seek to first frame
      video.currentTime = frameTimestamps[0];
    };

    video.onseeked = () => {
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64
      const frameData = canvas.toDataURL('image/jpeg', 0.85);
      frames.push(frameData);
      
      currentFrameIndex++;
      
      if (currentFrameIndex < frameTimestamps.length) {
        // Seek to next frame
        video.currentTime = frameTimestamps[currentFrameIndex];
      } else {
        // All frames extracted
        URL.revokeObjectURL(video.src);
        resolve(frames);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };

    // Load video
    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
}

/**
 * Analyze venue video frames using AI
 * @param frames Array of base64 encoded frame images
 * @param eventName Name of the event
 * @param eventDescription Description of the event
 * @returns Comprehensive venue analysis
 */
export async function analyzeVenueVideo(
  frames: string[],
  eventName: string,
  eventDescription?: string
): Promise<VenueAnalysis> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-venue-video', {
      body: {
        videoFrames: frames,
        eventName,
        eventDescription,
      },
    });

    if (error) throw error;

    // Add extracted frames to the analysis result
    const keyFramesWithImages: KeyFrame[] = (data.keyFrames || []).map((kf: any) => ({
      ...kf,
      imageData: frames[kf.frameIndex] || frames[0],
    }));

    return {
      ...data,
      keyFrames: keyFramesWithImages,
      extractedFrames: frames,
    };
  } catch (error) {
    console.error('Failed to analyze venue video:', error);
    
    // Return a fallback analysis with extracted frames
    return {
      success: false,
      areas: [],
      overallAssessment: {
        venueType: 'Event Venue',
        totalEstimatedArea: 'Analysis pending',
        primarySurfaces: [],
        brandingOpportunities: [],
        challengesAndConsiderations: ['Video analysis failed - frames available for manual review'],
      },
      keyFrames: frames.map((frameData, index) => ({
        frameIndex: index,
        description: `Frame ${index + 1}`,
        bestFor: ['Manual review'],
        imageData: frameData,
      })),
      assetRecommendations: [],
      extractedFrames: frames,
    };
  }
}

/**
 * Get the best frame for a specific asset type based on analysis
 * @param analysis The venue analysis result
 * @param assetType The asset type to find the best frame for
 * @returns The best matching frame base64 data, or the first frame as fallback
 */
export function getBestFrameForAsset(
  analysis: VenueAnalysis,
  assetType: string
): string | null {
  // Check if any key frame is marked as good for this asset type
  const matchingFrame = analysis.keyFrames.find(kf => 
    kf.bestFor.some(bf => bf.toLowerCase().includes(assetType.toLowerCase()))
  );

  if (matchingFrame) {
    return matchingFrame.imageData;
  }

  // Check area suggestions
  const matchingArea = analysis.areas.find(area =>
    area.suggestedAssets.some(sa => 
      sa.assetType.toLowerCase().includes(assetType.toLowerCase())
    )
  );

  if (matchingArea && analysis.extractedFrames[matchingArea.frameIndex]) {
    return analysis.extractedFrames[matchingArea.frameIndex];
  }

  // Return first frame as fallback
  return analysis.extractedFrames[0] || null;
}

/**
 * Get recommended sizes for an asset type based on venue analysis
 * @param analysis The venue analysis result
 * @param assetType The asset type
 * @returns Array of recommended sizes
 */
export function getRecommendedSizes(
  analysis: VenueAnalysis,
  assetType: string
): string[] {
  const recommendation = analysis.assetRecommendations.find(
    r => r.assetType.toLowerCase() === assetType.toLowerCase()
  );

  if (recommendation) {
    return recommendation.suggestedSizes;
  }

  // Check areas for size suggestions
  for (const area of analysis.areas) {
    const assetSuggestion = area.suggestedAssets.find(
      sa => sa.assetType.toLowerCase().includes(assetType.toLowerCase())
    );
    if (assetSuggestion) {
      return [assetSuggestion.recommendedSize];
    }
  }

  return [];
}
