import React, { useState } from 'react';
import { AssetType } from '../types';
import { 
  PRINT_VENDORS, 
  getVendorsForAsset, 
  VendorTemplate 
} from '../config/printVendorTemplates';
import { 
  Printer, 
  Globe, 
  MapPin, 
  Sparkles, 
  Package,
  ExternalLink,
  Check,
  ChevronDown,
  Info,
  AlertCircle
} from 'lucide-react';

interface VendorSelectorProps {
  assetType: AssetType;
  selectedVendor: VendorTemplate | null;
  onSelectVendor: (vendor: VendorTemplate | null) => void;
}

const categoryIcons: Record<VendorTemplate['category'], React.ElementType> = {
  online: Globe,
  local: MapPin,
  premium: Sparkles,
  specialty: Package
};

const categoryLabels: Record<VendorTemplate['category'], string> = {
  online: 'Online Services',
  local: 'Local Print',
  premium: 'Premium Quality',
  specialty: 'Specialty Printing'
};

const VendorSelector: React.FC<VendorSelectorProps> = ({
  assetType,
  selectedVendor,
  onSelectVendor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);
  
  const compatibleVendors = getVendorsForAsset(assetType);
  
  // Group vendors by category
  const vendorsByCategory = compatibleVendors.reduce((acc, vendor) => {
    if (!acc[vendor.category]) acc[vendor.category] = [];
    acc[vendor.category].push(vendor);
    return acc;
  }, {} as Record<VendorTemplate['category'], VendorTemplate[]>);

  const categories: VendorTemplate['category'][] = ['online', 'local', 'premium', 'specialty'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Printer className="w-4 h-4 text-primary" />
          Print Vendor Template
        </label>
        {selectedVendor && (
          <button 
            onClick={() => onSelectVendor(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Selected Vendor Display */}
      {selectedVendor ? (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              {React.createElement(categoryIcons[selectedVendor.category], {
                className: 'w-4 h-4 text-primary'
              })}
              <span className="font-medium text-foreground">{selectedVendor.name}</span>
              <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                {categoryLabels[selectedVendor.category]}
              </span>
            </div>
            {selectedVendor.website && (
              <a 
                href={`https://${selectedVendor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">{selectedVendor.description}</p>
          
          {/* Quick Specs */}
          <div className="grid grid-cols-4 gap-2 text-[10px] mb-3">
            <div className="bg-background/50 rounded-lg p-2 text-center">
              <span className="block font-bold text-foreground">{selectedVendor.specs.dpi}</span>
              <span className="text-muted-foreground">DPI</span>
            </div>
            <div className="bg-background/50 rounded-lg p-2 text-center">
              <span className="block font-bold text-foreground">{selectedVendor.specs.colorMode}</span>
              <span className="text-muted-foreground">Color</span>
            </div>
            <div className="bg-background/50 rounded-lg p-2 text-center">
              <span className="block font-bold text-foreground">{selectedVendor.specs.bleed}"</span>
              <span className="text-muted-foreground">Bleed</span>
            </div>
            <div className="bg-background/50 rounded-lg p-2 text-center">
              <span className="block font-bold text-foreground">{selectedVendor.specs.fileFormats[0].toUpperCase()}</span>
              <span className="text-muted-foreground">Format</span>
            </div>
          </div>

          {/* Detailed Specs Toggle */}
          <button
            onClick={() => setShowSpecs(!showSpecs)}
            className="w-full text-xs text-muted-foreground hover:text-foreground flex items-center justify-between py-1"
          >
            <span>Full specifications</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSpecs ? 'rotate-180' : ''}`} />
          </button>

          {showSpecs && (
            <div className="mt-2 p-2 bg-background/50 rounded-lg space-y-2 text-[10px]">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Resolution:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.dpi} DPI</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Color Mode:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.colorMode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bleed:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.bleed}"</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Safe Zone:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.safeZone}"</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Formats:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.fileFormats.join(', ').toUpperCase()}</span>
                </div>
                {selectedVendor.specs.maxFileSize && (
                  <div>
                    <span className="text-muted-foreground">Max Size:</span>
                    <span className="ml-1 text-foreground">{selectedVendor.specs.maxFileSize}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Trim Marks:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.requiresTrimMarks ? 'Required' : 'Not needed'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Flatten:</span>
                  <span className="ml-1 text-foreground">{selectedVendor.specs.flattenLayers ? 'Yes' : 'No'}</span>
                </div>
              </div>
              {selectedVendor.specs.notes && (
                <div className="pt-2 border-t border-border flex items-start gap-1.5">
                  <Info className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{selectedVendor.specs.notes}</span>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {selectedVendor.tips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/20">
              <span className="text-[10px] font-medium text-foreground flex items-center gap-1 mb-1.5">
                <Sparkles className="w-3 h-3 text-primary" />
                Pro Tips
              </span>
              <ul className="space-y-1">
                {selectedVendor.tips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upload Link */}
          {selectedVendor.uploadUrl && (
            <a
              href={selectedVendor.uploadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Upload to {selectedVendor.name}
            </a>
          )}

          {/* Change Vendor Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full text-xs text-muted-foreground hover:text-foreground py-1"
          >
            Change vendor
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Select a print vendor for optimized export settings
        </button>
      )}

      {/* Vendor List */}
      {isExpanded && (
        <div className="space-y-3 p-3 bg-secondary/20 rounded-xl border border-border max-h-80 overflow-y-auto">
          {compatibleVendors.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No vendors available for this asset type
            </div>
          ) : (
            categories.map(category => {
              const vendors = vendorsByCategory[category];
              if (!vendors || vendors.length === 0) return null;
              
              const CategoryIcon = categoryIcons[category];
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <CategoryIcon className="w-3.5 h-3.5" />
                    {categoryLabels[category]}
                  </div>
                  <div className="grid gap-2">
                    {vendors.map(vendor => (
                      <button
                        key={vendor.id}
                        onClick={() => {
                          onSelectVendor(vendor);
                          setIsExpanded(false);
                        }}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          selectedVendor?.id === vendor.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground bg-background/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">{vendor.name}</span>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{vendor.specs.dpi}DPI</span>
                            <span>{vendor.specs.colorMode}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {vendor.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VendorSelector;
