// Venue video analysis types

export interface VenueVideoAnalysis {
  success: boolean;
  areas: VenueArea[];
  overallAssessment: VenueAssessment;
  keyFrames: VenueKeyFrame[];
  assetRecommendations: AssetRecommendation[];
  extractedFrames: string[];
}

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

export interface VenueAssessment {
  venueType: string;
  totalEstimatedArea: string;
  primarySurfaces: string[];
  brandingOpportunities: string[];
  challengesAndConsiderations: string[];
}

export interface VenueKeyFrame {
  frameIndex: number;
  description: string;
  bestFor: string[];
  imageData: string;
}

export interface AssetRecommendation {
  assetType: string;
  priority: 'high' | 'medium' | 'low';
  recommendedQuantity: number;
  suggestedSizes: string[];
  placementAreas: string[];
}
