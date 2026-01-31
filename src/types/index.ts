// Central type exports - modular type system
// This file re-exports all types for backward compatibility

// Asset types
export {
  AssetType,
  type LogoAsset,
  type ColorInfo,
  type QRCodeGenerationParams,
  type FloorPlanGenerationParams,
  type GeneratedAsset,
  type AssetFolder,
  type LogoGenerationOptions,
  type GeneratedLogoVariation,
} from './asset.types';

// Event types  
export {
  type EventType,
  type EventDetails,
  type BudgetItem,
  type VendorInfo,
  type GuestInfo,
  type TimelineItem,
  type VenueSearchResult,
} from './event.types';

// Venue types
export {
  type VenueVideoAnalysis,
  type VenueArea,
  type VenueAssessment,
  type VenueKeyFrame,
  type AssetRecommendation,
} from './venue.types';

// Presentation types
export {
  type ElementType,
  type BaseElement,
  type TextElement,
  type ImageElement,
  type IconElement,
  type ChartElement,
  type ShapeElement,
  type SlideElement,
  type PresentationTheme,
  type BackgroundConfig,
  type Slide,
  type PresentationData,
  type PdfExportOptions,
} from './presentation.types';
