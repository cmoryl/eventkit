// Local Vendor Discovery Service
// Uses event location to find nearby print shops

export interface LocalVendor {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  openNow?: boolean;
  types: string[];
  placeId?: string;
}

export interface LocalVendorSearchParams {
  location: string;
  venueAddress?: string;
  venuePlaceId?: string;
  radius?: number; // in miles
  types?: string[];
}

// Common print-related business types
export const PRINT_BUSINESS_TYPES = [
  'print_shop',
  'copy_center', 
  'printing',
  'graphic_design',
  'sign_company',
  'banner_printing',
  'screen_printing',
  'promotional_products'
];

// Generate search queries for finding print vendors
export const generateSearchQueries = (baseLocation: string): string[] => {
  return [
    `print shop near ${baseLocation}`,
    `printing services near ${baseLocation}`,
    `FedEx Office near ${baseLocation}`,
    `Staples print near ${baseLocation}`,
    `sign shop near ${baseLocation}`,
    `banner printing near ${baseLocation}`,
    `custom printing near ${baseLocation}`
  ];
};

// Simulate local vendor discovery (would connect to Google Places API in production)
export const searchLocalVendors = async (
  params: LocalVendorSearchParams
): Promise<LocalVendor[]> => {
  const { location, venueAddress, radius = 10 } = params;
  
  const searchLocation = venueAddress || location;
  
  if (!searchLocation) {
    return [];
  }

  // In production, this would call Google Places API or similar
  // For now, generate contextual suggestions based on location
  const vendors = generateLocalVendorSuggestions(searchLocation, radius);
  
  return vendors;
};

// Generate location-aware vendor suggestions
const generateLocalVendorSuggestions = (
  location: string,
  radiusMiles: number
): LocalVendor[] => {
  // Extract city/area from location for contextual naming
  const locationParts = location.split(',').map(p => p.trim());
  const cityArea = locationParts[0] || 'Local Area';
  
  const baseVendors: Omit<LocalVendor, 'id'>[] = [
    {
      name: `FedEx Office - ${cityArea}`,
      address: `Near ${location}`,
      distance: '0.5 mi',
      rating: 4.2,
      reviewCount: 127,
      openNow: true,
      website: 'https://www.fedex.com/printing/',
      types: ['print_shop', 'copy_center', 'shipping'],
    },
    {
      name: `Staples - ${cityArea}`,
      address: `Near ${location}`,
      distance: '0.8 mi', 
      rating: 4.0,
      reviewCount: 89,
      openNow: true,
      website: 'https://www.staples.com/services/printing/',
      types: ['print_shop', 'office_supplies'],
    },
    {
      name: `${cityArea} Print & Copy`,
      address: `Near ${location}`,
      distance: '1.2 mi',
      rating: 4.7,
      reviewCount: 45,
      types: ['print_shop', 'local_business'],
    },
    {
      name: `Quick Signs & Banners`,
      address: `Near ${location}`,
      distance: '1.5 mi',
      rating: 4.5,
      reviewCount: 62,
      types: ['sign_company', 'banner_printing'],
    },
    {
      name: `${cityArea} Screen Printing`,
      address: `Near ${location}`,
      distance: '2.1 mi',
      rating: 4.8,
      reviewCount: 38,
      types: ['screen_printing', 'apparel'],
    },
    {
      name: `UPS Store - ${cityArea}`,
      address: `Near ${location}`,
      distance: '0.6 mi',
      rating: 3.9,
      reviewCount: 156,
      openNow: true,
      website: 'https://www.theupsstore.com/',
      types: ['print_shop', 'shipping'],
    },
    {
      name: `Office Depot - ${cityArea}`,
      address: `Near ${location}`,
      distance: '1.8 mi',
      rating: 3.8,
      reviewCount: 72,
      website: 'https://www.officedepot.com/',
      types: ['print_shop', 'office_supplies'],
    },
    {
      name: `AlphaGraphics ${cityArea}`,
      address: `Near ${location}`,
      distance: '2.5 mi',
      rating: 4.6,
      reviewCount: 28,
      website: 'https://www.alphagraphics.com/',
      types: ['print_shop', 'graphic_design', 'marketing'],
    }
  ];

  // Filter by radius and add IDs
  return baseVendors
    .filter(v => {
      const dist = parseFloat(v.distance);
      return dist <= radiusMiles;
    })
    .map((vendor, index) => ({
      ...vendor,
      id: `local-${index}-${Date.now()}`,
    }));
};

// Convert local vendor to a compatible VendorTemplate format
export const createLocalVendorTemplate = (localVendor: LocalVendor) => {
  const isChainStore = ['FedEx', 'Staples', 'UPS Store', 'Office Depot', 'AlphaGraphics']
    .some(chain => localVendor.name.includes(chain));
  
  return {
    id: localVendor.id,
    name: localVendor.name,
    website: localVendor.website?.replace('https://', '').replace('http://', '').replace(/\/$/, '') || '',
    description: `${localVendor.distance} away • ${localVendor.rating ? `★ ${localVendor.rating}` : 'Local print shop'}`,
    category: 'local' as const,
    isLocalDiscovery: true,
    localVendorData: localVendor,
    specs: {
      dpi: 300,
      colorMode: 'CMYK' as const,
      bleed: 0.125,
      safeZone: 0.125,
      fileFormats: ['pdf'],
      colorProfile: 'US Web Coated (SWOP) v2',
      requiresTrimMarks: true,
      requiresBleedMarks: true,
      flattenLayers: true,
      embedFonts: true,
      notes: isChainStore 
        ? 'Chain store with standard professional specs. Same-day pickup often available.'
        : 'Local print shop. Confirm specific requirements before submitting files.',
    },
    supportedAssets: [], // All asset types supported by local shops
    tips: [
      localVendor.openNow ? '✓ Currently open' : 'Check business hours',
      localVendor.rating ? `${localVendor.reviewCount} reviews • ${localVendor.rating} stars` : 'Local business',
      'Call ahead to confirm turnaround time',
      'Request a proof before final print'
    ],
    uploadUrl: localVendor.website
  };
};

// Get Google Maps directions URL
export const getDirectionsUrl = (vendorAddress: string, userLocation?: string): string => {
  const destination = encodeURIComponent(vendorAddress);
  const origin = userLocation ? `&origin=${encodeURIComponent(userLocation)}` : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}${origin}`;
};

// Get Google Maps search URL for print shops
export const getGoogleMapsSearchUrl = (location: string): string => {
  const query = encodeURIComponent(`print shop near ${location}`);
  return `https://www.google.com/maps/search/${query}`;
};
