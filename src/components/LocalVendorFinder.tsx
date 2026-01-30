import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Star, 
  Clock, 
  Phone, 
  ExternalLink,
  Search,
  Loader2,
  Map,
  Building2,
  ChevronDown,
  Check
} from 'lucide-react';
import { 
  LocalVendor, 
  searchLocalVendors, 
  getDirectionsUrl,
  getGoogleMapsSearchUrl,
  createLocalVendorTemplate
} from '../services/localVendorService';
import { VendorTemplate } from '../config/printVendorTemplates';
import { EventDetails } from '../types';

interface LocalVendorFinderProps {
  eventDetails: EventDetails | null;
  onSelectVendor: (vendor: VendorTemplate) => void;
  selectedVendorId?: string;
}

const LocalVendorFinder: React.FC<LocalVendorFinderProps> = ({
  eventDetails,
  onSelectVendor,
  selectedVendorId
}) => {
  const [localVendors, setLocalVendors] = useState<LocalVendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [hasSearched, setHasSearched] = useState(false);

  const eventLocation = eventDetails?.venueAddress || eventDetails?.location || '';
  const hasLocation = eventLocation.length > 0;

  const handleSearch = async () => {
    if (!hasLocation) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const vendors = await searchLocalVendors({
        location: eventDetails?.location || '',
        venueAddress: eventDetails?.venueAddress,
        venuePlaceId: eventDetails?.venuePlaceId,
        radius: searchRadius
      });
      setLocalVendors(vendors);
      setIsExpanded(true);
    } catch (error) {
      console.error('Failed to search local vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectVendor = (localVendor: LocalVendor) => {
    const template = createLocalVendorTemplate(localVendor);
    onSelectVendor(template as VendorTemplate);
  };

  if (!hasLocation) {
    return (
      <div className="p-3 bg-muted/30 border border-dashed border-border rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-xs">Add event location to find nearby print shops</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          Find Local Print Shops
        </label>
        {hasSearched && localVendors.length > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {localVendors.length} found nearby
          </span>
        )}
      </div>

      {/* Location Display */}
      <div className="p-2.5 bg-secondary/30 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {eventDetails?.venueName || 'Event Location'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {eventLocation}
            </p>
          </div>
        </div>
      </div>

      {/* Search Controls */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap">
            Search radius:
          </label>
          <select
            value={searchRadius}
            onChange={(e) => setSearchRadius(Number(e.target.value))}
            className="flex-1 text-xs bg-background border border-border rounded-lg px-2 py-1.5 text-foreground"
          >
            <option value={1}>1 mile</option>
            <option value={2}>2 miles</option>
            <option value={5}>5 miles</option>
            <option value={10}>10 miles</option>
            <option value={25}>25 miles</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          {hasSearched ? 'Refresh' : 'Find'}
        </button>
      </div>

      {/* Results */}
      {hasSearched && (
        <>
          {localVendors.length > 0 ? (
            <div className="space-y-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground py-1"
              >
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {localVendors.length} print shops within {searchRadius} miles
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {localVendors.map((vendor) => {
                    const isSelected = selectedVendorId === vendor.id;
                    
                    return (
                      <div
                        key={vendor.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-background/50 hover:border-muted-foreground'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-medium text-foreground truncate">
                                {vendor.name}
                              </h4>
                              {vendor.openNow && (
                                <span className="flex items-center gap-0.5 text-[9px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                  <Clock className="w-2.5 h-2.5" />
                                  Open
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <MapPin className="w-3 h-3" />
                                {vendor.distance}
                              </span>
                              {vendor.rating && (
                                <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-current" />
                                  {vendor.rating}
                                  {vendor.reviewCount && (
                                    <span className="text-muted-foreground">
                                      ({vendor.reviewCount})
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {vendor.website && (
                              <a
                                href={vendor.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                                title="Visit website"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <a
                              href={getDirectionsUrl(vendor.address, eventLocation)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                              title="Get directions"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        {/* Type badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {vendor.types.slice(0, 3).map((type) => (
                            <span
                              key={type}
                              className="text-[9px] bg-secondary/50 text-muted-foreground px-1.5 py-0.5 rounded"
                            >
                              {type.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>

                        {/* Select button */}
                        <button
                          onClick={() => handleSelectVendor(vendor)}
                          className={`w-full mt-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isSelected
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary/50 text-foreground hover:bg-secondary'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Selected
                            </>
                          ) : (
                            'Use this vendor'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Google Maps link */}
              <a
                href={getGoogleMapsSearchUrl(eventLocation)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground rounded-lg text-xs transition-colors"
              >
                <Map className="w-4 h-4" />
                View all on Google Maps
              </a>
            </div>
          ) : (
            <div className="p-4 bg-muted/30 rounded-xl text-center">
              <Building2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                No print shops found within {searchRadius} miles
              </p>
              <button
                onClick={() => setSearchRadius(prev => prev + 5)}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Expand search radius
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LocalVendorFinder;
