import React, { useState, useRef, useEffect } from 'react';
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
  Accessibility
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [venueData, setVenueData] = useState<VenueIntelligence | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSearch = async (searchValue: string) => {
    if (searchValue.trim().length < 3) {
      setVenueData(null);
      return;
    }

    setIsSearching(true);
    setVenueData(null);

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

    // Debounce the search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };

  const handleSearchClick = () => {
    if (inputValue.trim().length >= 3) {
      handleSearch(inputValue);
    } else {
      toast.error('Please enter at least 3 characters');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchClick();
    }
  };

  const clearVenueData = () => {
    setVenueData(null);
    setShowDetails(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Search Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Search venue name or city..."
          className={cn(
            "w-full pl-10 pr-24 py-3 rounded-xl border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all",
            venueData ? "border-primary/50" : "border-border"
          )}
        />
        <Button
          type="button"
          size="sm"
          onClick={handleSearchClick}
          disabled={isSearching || inputValue.trim().length < 3}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 gap-1.5"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Find</span>
        </Button>
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
