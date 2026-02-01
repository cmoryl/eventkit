import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Search, 
  Loader2, 
  Building2, 
  Users, 
  Car, 
  Wifi, 
  Phone, 
  Globe, 
  DollarSign,
  Sparkles,
  X,
  ChevronDown,
  ExternalLink,
  Hotel,
  Lightbulb,
  Accessibility,
  MapPinned,
  Clock,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecentVenues, type RecentVenue } from '@/hooks/useRecentVenues';
import ApiSettingsModal from '@/components/settings/ApiSettingsModal';

interface VenueIntelligence {
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

interface VenueSuggestion {
  name: string;
  city: string;
  country: string;
  type: string;
}

interface VenueLocationFinderProps {
  value: string;
  onChange: (value: string, venueData?: VenueIntelligence) => void;
  eventType?: string;
  className?: string;
}

export const VenueLocationFinder: React.FC<VenueLocationFinderProps> = ({
  value,
  onChange,
  eventType,
  className,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [venueData, setVenueData] = useState<VenueIntelligence | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [suggestions, setSuggestions] = useState<VenueSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  
  const { recentVenues, addRecentVenue, clearRecentVenues } = useRecentVenues();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-venues', {
        body: { query, eventType },
      });

      if (error) throw error;
      
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.warn('Venue suggestions error:', error);
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  }, [eventType]);

  const handleSearch = async (searchValue: string) => {
    if (searchValue.trim().length < 3) {
      setVenueData(null);
      return;
    }

    setIsSearching(true);
    setVenueData(null);
    setShowSuggestions(false);

    try {
      const { data, error } = await supabase.functions.invoke('research-venue', {
        body: {
          venueName: searchValue,
          eventType,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.venue) {
        setVenueData(data.venue);
        // Update the location with full address if available
        if (data.venue.fullAddress) {
          onChange(data.venue.fullAddress, data.venue);
        } else {
          onChange(searchValue, data.venue);
        }
        toast.success('Venue intelligence loaded!');
      }
    } catch (error) {
      console.error('Venue research error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to research venue');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Debounce the suggestions
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 300);
  };

  const handleSuggestionClick = (suggestion: VenueSuggestion | RecentVenue) => {
    const fullValue = `${suggestion.name}, ${suggestion.city}`;
    setInputValue(fullValue);
    onChange(fullValue);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsFocused(false);
    
    // Add to recent venues
    addRecentVenue({
      name: suggestion.name,
      city: suggestion.city,
      country: suggestion.country,
      type: suggestion.type,
    });
    
    // Auto-research the selected venue
    handleSearch(fullValue);
  };

  const handleSearchClick = () => {
    if (inputValue.trim().length >= 3) {
      handleSearch(inputValue);
    } else {
      toast.error('Please enter at least 3 characters');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        return;
      }
    }
    
    if (e.key === 'Enter' && selectedIndex < 0) {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Show suggestions if we have any, or show recent venues
    if (suggestions.length > 0 || (recentVenues.length > 0 && inputValue.trim().length < 2)) {
      setShowSuggestions(true);
    }
  };

  // Determine what to show in dropdown
  const showRecentVenues = isFocused && inputValue.trim().length < 2 && recentVenues.length > 0;
  const showAISuggestions = suggestions.length > 0 && !showRecentVenues;
  const hasDropdownContent = showRecentVenues || showAISuggestions;

  const clearVenueData = () => {
    setVenueData(null);
    setShowDetails(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Settings Modal */}
      <ApiSettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
      
      {/* Search Input with Autocomplete */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search venue name or city..."
          className={cn(
            "w-full pl-10 pr-32 py-3 rounded-xl border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all",
            venueData ? "border-primary/50" : "border-border",
            showSuggestions && hasDropdownContent && "rounded-b-none border-b-0"
          )}
          autoComplete="off"
        />
        
        {/* Loading indicator for suggestions */}
        {isSuggesting && (
          <div className="absolute right-28 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {/* Settings button */}
        <button
          type="button"
          onClick={() => setShowSettingsModal(true)}
          className="absolute right-[4.5rem] top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-secondary transition-colors z-10"
          title="API Settings"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <Button
          type="button"
          size="sm"
          onClick={handleSearchClick}
          disabled={isSearching || inputValue.trim().length < 3}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 gap-1.5 z-10"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Find</span>
        </Button>

        {/* Autocomplete Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && hasDropdownContent && (
            <motion.div
              ref={suggestionsRef}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-50 bg-background border border-t-0 border-border rounded-b-xl shadow-lg overflow-hidden"
            >
              {/* Recent Venues Section */}
              {showRecentVenues && (
                <>
                  <div className="px-3 py-2 flex items-center justify-between border-b border-border/50 bg-secondary/20">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearRecentVenues();
                        setShowSuggestions(false);
                      }}
                      className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentVenues.map((venue, index) => (
                    <button
                      key={`recent-${venue.name}-${venue.city}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(venue)}
                      className={cn(
                        "w-full px-3 py-2.5 flex items-start gap-3 text-left hover:bg-secondary/50 transition-colors",
                        selectedIndex === index && "bg-secondary/70"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {venue.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{venue.city}, {venue.country}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {venue.type}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              
              {/* AI Suggestions Section */}
              {showAISuggestions && (
                <>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.name}-${suggestion.city}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={cn(
                        "w-full px-3 py-2.5 flex items-start gap-3 text-left hover:bg-secondary/50 transition-colors",
                        selectedIndex === index && "bg-secondary/70"
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {suggestion.type === 'Convention Center' ? (
                          <Building2 className="w-4 h-4 text-primary" />
                        ) : suggestion.type === 'Hotel' ? (
                          <Hotel className="w-4 h-4 text-primary" />
                        ) : (
                          <MapPinned className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">
                          {suggestion.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span>{suggestion.city}, {suggestion.country}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {suggestion.type}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-secondary/30 border-t border-border/50 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI-suggested venues • Select to research
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Venue Intelligence Card */}
      <AnimatePresence>
        {venueData && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground truncate">
                      {venueData.name}
                    </h4>
                    {venueData.venueType && (
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {venueData.venueType}
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={clearVenueData}
                    className="p-1 rounded hover:bg-secondary transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
                {venueData.fullAddress && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {venueData.fullAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {venueData.capacity && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  <Users className="w-3 h-3" />
                  {venueData.capacity}
                </div>
              )}
              {venueData.priceRange && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  <DollarSign className="w-3 h-3" />
                  {venueData.priceRange}
                </div>
              )}
              {venueData.parkingInfo && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                  <Car className="w-3 h-3" />
                  Parking
                </div>
              )}
            </div>

            {/* Expand/Collapse Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-3 py-2 flex items-center justify-center gap-1 text-xs text-primary hover:bg-primary/5 transition-colors border-t border-border/50"
            >
              <Sparkles className="w-3 h-3" />
              {showDetails ? 'Hide' : 'View'} venue intelligence
              <ChevronDown className={cn("w-3 h-3 transition-transform", showDetails && "rotate-180")} />
            </button>

            {/* Expanded Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border/50"
                >
                  <div className="p-3 space-y-3 text-xs">
                    {/* Description */}
                    {venueData.description && (
                      <div>
                        <p className="text-muted-foreground leading-relaxed">
                          {venueData.description}
                        </p>
                      </div>
                    )}

                    {/* Amenities */}
                    {venueData.amenities && venueData.amenities.length > 0 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          Amenities
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {venueData.amenities.slice(0, 6).map((amenity, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Best For */}
                    {venueData.bestFor && venueData.bestFor.length > 0 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-1.5">Best For</h5>
                        <div className="flex flex-wrap gap-1">
                          {venueData.bestFor.map((eventType, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {eventType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical & Accessibility */}
                    <div className="grid grid-cols-2 gap-3">
                      {venueData.technicalSpecs && (
                        <div>
                          <h5 className="font-medium text-foreground mb-1 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            Tech
                          </h5>
                          <p className="text-muted-foreground text-[10px] leading-relaxed">
                            {venueData.technicalSpecs}
                          </p>
                        </div>
                      )}
                      {venueData.accessibilityInfo && (
                        <div>
                          <h5 className="font-medium text-foreground mb-1 flex items-center gap-1">
                            <Accessibility className="w-3 h-3" />
                            Accessibility
                          </h5>
                          <p className="text-muted-foreground text-[10px] leading-relaxed">
                            {venueData.accessibilityInfo}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nearby Hotels */}
                    {venueData.nearbyHotels && venueData.nearbyHotels.length > 0 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-1.5 flex items-center gap-1">
                          <Hotel className="w-3 h-3" />
                          Nearby Hotels
                        </h5>
                        <p className="text-muted-foreground text-[10px]">
                          {venueData.nearbyHotels.join(' • ')}
                        </p>
                      </div>
                    )}

                    {/* Cultural Context - Important for design */}
                    {venueData.culturalContext && (
                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/20">
                        <h5 className="font-medium text-primary mb-1 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Design Context
                        </h5>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">
                          {venueData.culturalContext}
                        </p>
                      </div>
                    )}

                    {/* Local Tips */}
                    {venueData.localTips && (
                      <div className="p-2 rounded-lg bg-secondary/50">
                        <h5 className="font-medium text-foreground mb-1">💡 Local Tip</h5>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">
                          {venueData.localTips}
                        </p>
                      </div>
                    )}

                    {/* Contact Links */}
                    <div className="flex items-center gap-2 pt-1">
                      {venueData.website && (
                        <a
                          href={venueData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          Website
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {venueData.phone && (
                        <a
                          href={`tel:${venueData.phone}`}
                          className="flex items-center gap-1 text-[10px] text-primary hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {venueData.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Searching indicator */}
      {isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="w-3 h-3 animate-spin" />
          Researching venue intelligence...
        </motion.div>
      )}
    </div>
  );
};

export default VenueLocationFinder;
