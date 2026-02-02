// Location cultural contexts for enhanced locality awareness

export const LOCATION_CULTURAL_CONTEXTS: Record<string, string> = {
  // US Cities
  'new york': 'NYC urban sophistication, Broadway energy, art deco influences, metropolitan elegance, Times Square vibrancy',
  'los angeles': 'Hollywood glamour, beach lifestyle, entertainment industry aesthetics, palm tree motifs, California sunshine',
  'las vegas': 'Neon lights, entertainment spectacle, desert luxury, casino glamour, bold show-stopping designs',
  'miami': 'Art deco pastels, tropical vibes, Cuban influences, ocean blues and sunset oranges, South Beach energy',
  'san francisco': 'Tech-forward innovation, Victorian charm, fog and bridge imagery, progressive culture, startup energy',
  'chicago': 'Industrial strength, architectural excellence, deep dish culture, blues heritage, lakefront beauty',
  'austin': 'Live music capital, tech meets BBQ, Keep Austin Weird spirit, creative independence, food truck culture',
  'seattle': 'Pacific Northwest nature, coffee culture, tech innovation, rain-forest greens, grunge heritage',
  'nashville': 'Country music heritage, honky-tonk energy, southern hospitality, music row aesthetics',
  'new orleans': 'Jazz heritage, French Quarter charm, Mardi Gras colors, Creole culture, wrought iron details',
  
  // International
  'london': 'British elegance, royal heritage, modern meets traditional, underground culture, cosmopolitan sophistication',
  'paris': 'French haute couture, romantic aesthetics, art nouveau details, café culture, Parisian chic',
  'tokyo': 'Japanese minimalism, kawaii culture, neon-lit streets, zen tranquility balanced with Harajuku boldness',
  'dubai': 'Ultra-luxury, futuristic architecture, Arabian opulence, desert gold, modern innovation',
  'singapore': 'Garden city aesthetics, multicultural fusion, modern efficiency, tropical sophistication',
  'sydney': 'Harbour vibes, beach lifestyle, outdoor culture, Opera House inspired curves, Australian warmth',
  'berlin': 'Industrial chic, underground culture, creative freedom, street art influences, techno heritage',
  'barcelona': 'Gaudí-inspired organic forms, Mediterranean colors, Catalan modernism, beach meets city',
  'amsterdam': 'Dutch design minimalism, canal charm, cycling culture, tulip colors, progressive creativity',
  'hong kong': 'Vertical city energy, East meets West, neon nights, harbor views, financial sophistication',
  'mumbai': 'Bollywood vibrancy, rich colors, traditional meets modern, monsoon moods, bustling energy',
  'mexico city': 'Frida Kahlo colors, ancient meets contemporary, Day of Dead aesthetics, street food culture',
  'rio': 'Carnival energy, beach culture, samba rhythms, tropical boldness, Christ the Redeemer majesty',
  'toronto': 'Multicultural mosaic, CN Tower modern, Canadian politeness, diverse neighborhood vibes',
  'vancouver': 'Mountain meets ocean, sustainable living, Asian-Pacific fusion, outdoor lifestyle',
};

// Regional fallbacks
const REGION_CONTEXTS: Record<string, string> = {
  'california': 'California sunshine, laid-back sophistication, tech-forward thinking, outdoor lifestyle',
  'texas': 'Texas pride, big and bold, hospitality warmth, western heritage with modern flair',
  'florida': 'Tropical vibes, beach lifestyle, retirement luxury meets spring break energy, sunshine state',
  'hawaii': 'Aloha spirit, tropical paradise, island time, lush greenery, ocean blues, lei and hibiscus motifs',
  'japan': 'Japanese attention to detail, wabi-sabi aesthetics, cherry blossom beauty, precision and harmony',
  'italy': 'Italian elegance, Renaissance artistry, fashion-forward, Mediterranean warmth, la dolce vita',
  'france': 'French sophistication, artistic heritage, culinary excellence, romantic aesthetics',
  'germany': 'German precision, Bauhaus design principles, efficiency meets creativity, industrial heritage',
  'spain': 'Spanish passion, flamenco energy, Moorish influences, vibrant colors, siesta lifestyle',
  'india': 'Indian richness, vibrant colors, intricate patterns, spiritual depth, festival energy',
  'china': 'Chinese heritage, red and gold prosperity, dragon motifs, ancient wisdom meets modern power',
  'australia': 'Australian outback ruggedness, beach culture, indigenous art influences, laid-back sophistication',
  'brazil': 'Brazilian vibrancy, carnival colors, tropical energy, football passion, Amazon lushness',
  'uk': 'British heritage, understated elegance, pub culture warmth, royal traditions',
};

/**
 * Get cultural context for a location
 */
export function getLocationCulturalContext(location: string): string {
  if (!location) return '';
  
  const locationLower = location.toLowerCase();
  
  // Check for exact city matches
  for (const [city, context] of Object.entries(LOCATION_CULTURAL_CONTEXTS)) {
    if (locationLower.includes(city)) {
      return context;
    }
  }
  
  // Check regional fallbacks
  for (const [region, context] of Object.entries(REGION_CONTEXTS)) {
    if (locationLower.includes(region)) {
      return context;
    }
  }
  
  // Special abbreviation handling
  if (locationLower.includes('ca') && !locationLower.includes('canada')) {
    return REGION_CONTEXTS['california'];
  }
  if (locationLower.includes('tx')) {
    return REGION_CONTEXTS['texas'];
  }
  if (locationLower.includes('fl')) {
    return REGION_CONTEXTS['florida'];
  }
  if (locationLower.includes('hi')) {
    return REGION_CONTEXTS['hawaii'];
  }
  
  // Additional city/region checks
  if (locationLower.includes('rome') || locationLower.includes('milan')) {
    return REGION_CONTEXTS['italy'];
  }
  if (locationLower.includes('beijing') || locationLower.includes('shanghai')) {
    return REGION_CONTEXTS['china'];
  }
  if (locationLower.includes('england') || locationLower.includes('britain')) {
    return REGION_CONTEXTS['uk'];
  }
  
  return '';
}
