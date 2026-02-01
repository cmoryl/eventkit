// Event-related type definitions

export type EventType = 
  | 'conference'
  | 'wedding'
  | 'corporate'
  | 'festival'
  | 'gala'
  | 'tradeshow'
  | 'workshop'
  | 'concert'
  | 'sports'
  | 'fundraiser'
  | 'graduation'
  | 'product_launch'
  | 'networking'
  | 'award_ceremony'
  | 'other';

export interface EventDetails {
  name: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  website: string;
  email: string;
  phone?: string;
  incorporateLocationStyle: boolean;
  qrCodeUrl?: string;
  qrCodeColor?: string;
  qrCodeBgColor?: string;
  venueQuery?: string;
  venueName?: string;
  venueAddress?: string;
  venuePlaceId?: string;
  venueIntelligence?: VenueIntelligence;
  // Extended fields for hyper-realistic events
  eventType?: EventType;
  expectedAttendees?: number;
  budget?: number;
  theme?: string;
  hashtag?: string;
  sponsors?: string[];
  hosts?: string[];
  timezone?: string;
  dresscode?: string;
  ticketPrice?: number;
  registrationUrl?: string;
  socialHandles?: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  vendor?: string;
  status: 'pending' | 'approved' | 'paid';
}

export interface VendorInfo {
  id: string;
  name: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  cost?: number;
  status: 'contacted' | 'quoted' | 'booked' | 'confirmed';
  notes?: string;
}

export interface GuestInfo {
  id: string;
  name: string;
  email?: string;
  company?: string;
  tableNumber?: number;
  mealPreference?: string;
  dietaryRestrictions?: string[];
  rsvpStatus: 'pending' | 'confirmed' | 'declined';
  vipStatus: boolean;
  plusOne?: boolean;
}

export interface TimelineItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  location?: string;
  responsible?: string;
  duration?: number;
}

export interface VenueSearchResult {
  name: string;
  address: string;
  placeId: string;
}

export interface VenueIntelligence {
  name: string;
  fullAddress?: string;
  city?: string;
  country?: string;
  capacity?: string;
  venueType?: string;
  description?: string;
  amenities?: string[];
  parkingInfo?: string;
  accessibilityInfo?: string;
  cateringOptions?: string;
  technicalSpecs?: string;
  website?: string;
  phone?: string;
  priceRange?: string;
  bestFor?: string[];
  nearbyHotels?: string[];
  localTips?: string;
  culturalContext?: string;
}
