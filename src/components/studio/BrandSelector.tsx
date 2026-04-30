import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, Check, Palette, RefreshCw, Link2 } from 'lucide-react';
import { Brand } from '@/types/studio.types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BrandSelectorProps {
  brands: Brand[];
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
  onCreateBrand: () => void;
  onResyncBrand?: (brandId: string) => void;
  onImportFromBrandHub?: () => void;
  isSyncing?: boolean;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  brands,
  selectedBrand,
  onSelectBrand,
  onCreateBrand,
  onResyncBrand,
  onImportFromBrandHub,
  isSyncing,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted border border-border transition-all"
      >
        {selectedBrand?.logo_url ? (
          <img 
            src={selectedBrand.logo_url} 
            alt={selectedBrand.name}
            className="w-6 h-6 rounded object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Palette className="w-3 h-3 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-foreground hidden sm:inline max-w-[100px] truncate">
          {selectedBrand?.name || 'Select Brand'}
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-card border border-border shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                  Your Brands
                </p>
              </div>

              <div className="max-h-64 overflow-y-auto p-2">
                {brands.length === 0 ? (
                  <div className="text-center py-6 px-4">
                    <Palette className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">No brands created yet</p>
                    <Button size="sm" onClick={() => { onCreateBrand(); setIsOpen(false); }}>
                      <Plus className="w-4 h-4 mr-1" />
                      Create Brand
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => {
                          onSelectBrand(brand);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                          selectedBrand?.id === brand.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        {brand.logo_url ? (
                          <img 
                            src={brand.logo_url} 
                            alt={brand.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {brand.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">{brand.name}</p>
                          {brand.is_default && (
                            <span className="text-[10px] text-muted-foreground">Default</span>
                          )}
                        </div>
                        
                        {selectedBrand?.id === brand.id && (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-2 border-t border-border space-y-1">
                {selectedBrand && onResyncBrand && (
                  <button
                    onClick={() => { onResyncBrand(selectedBrand.id); }}
                    disabled={isSyncing}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                    {isSyncing ? 'Syncing...' : 'Re-sync from BrandHub'}
                  </button>
                )}
                {onImportFromBrandHub && (
                  <button
                    onClick={() => { onImportFromBrandHub(); setIsOpen(false); }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-violet-500 hover:bg-violet-500/10 transition-all"
                  >
                    <Link2 className="w-4 h-4" />
                    Import from BrandHub
                  </button>
                )}
                <button
                  onClick={() => { onCreateBrand(); setIsOpen(false); }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create New Brand
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
