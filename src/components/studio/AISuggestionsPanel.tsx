// AI Creative Suggestions Panel
// Displays asset recommendations and design variations from the AI brain

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Lightbulb, Palette, ChevronRight, 
  Loader2, RefreshCw, Plus, Wand2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { AssetRecommendation, DesignVariation } from '@/services/aiBrain/suggestionService';
import { getPriorityBadgeStyles, formatAssetTypeName } from '@/services/aiBrain/suggestionService';

interface AISuggestionsPanelProps {
  // Asset recommendations
  assetRecommendations: AssetRecommendation[];
  overallStrategy: string | null;
  isLoadingRecommendations: boolean;
  onFetchRecommendations: () => void;
  onSelectAsset?: (assetType: string, designHint?: string) => void;
  
  // Design variations
  designVariations: DesignVariation[];
  isLoadingVariations: boolean;
  onFetchVariations?: () => void;
  onSelectVariation?: (variation: DesignVariation) => void;
  currentAssetType?: string;
  
  // State
  hasEventDetails: boolean;
  lastError?: string | null;
}

export const AISuggestionsPanel: React.FC<AISuggestionsPanelProps> = ({
  assetRecommendations,
  overallStrategy,
  isLoadingRecommendations,
  onFetchRecommendations,
  onSelectAsset,
  designVariations,
  isLoadingVariations,
  onFetchVariations,
  onSelectVariation,
  currentAssetType,
  hasEventDetails,
  lastError
}) => {
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(true);
  const [isVariationsOpen, setIsVariationsOpen] = useState(true);

  // Group recommendations by priority
  const groupedRecommendations = React.useMemo(() => {
    const groups: Record<string, AssetRecommendation[]> = {
      essential: [],
      recommended: [],
      nice_to_have: []
    };
    
    assetRecommendations.forEach(rec => {
      if (groups[rec.priority]) {
        groups[rec.priority].push(rec);
      }
    });
    
    return groups;
  }, [assetRecommendations]);

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Error Display */}
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{lastError}</span>
          </motion.div>
        )}

        {/* Asset Recommendations Section */}
        <Collapsible open={isRecommendationsOpen} onOpenChange={setIsRecommendationsOpen}>
          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-sm">Asset Recommendations</span>
                  {assetRecommendations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {assetRecommendations.length}
                    </Badge>
                  )}
                </div>
                <ChevronRight 
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isRecommendationsOpen && "rotate-90"
                  )} 
                />
              </button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-3">
                {/* Generate Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={onFetchRecommendations}
                  disabled={isLoadingRecommendations || !hasEventDetails}
                >
                  {isLoadingRecommendations ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : assetRecommendations.length > 0 ? (
                    <>
                      <RefreshCw className="w-3 h-3 mr-2" />
                      Refresh Suggestions
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>

                {/* Strategy Summary */}
                <AnimatePresence>
                  {overallStrategy && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-2.5 rounded-md bg-primary/5 border border-primary/10"
                    >
                      <p className="text-xs text-muted-foreground italic">
                        "{overallStrategy}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Recommendations List */}
                {assetRecommendations.length > 0 && (
                  <ScrollArea className="max-h-64">
                    <div className="space-y-2">
                      {Object.entries(groupedRecommendations).map(([priority, items]) => (
                        items.length > 0 && (
                          <div key={priority} className="space-y-1.5">
                            {items.map((rec, idx) => {
                              const badgeStyle = getPriorityBadgeStyles(rec.priority);
                              return (
                                <motion.div
                                  key={`${rec.assetType}-${idx}`}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="group flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => onSelectAsset?.(rec.assetType, rec.designHint)}
                                >
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium truncate">
                                        {formatAssetTypeName(rec.assetType)}
                                      </span>
                                      <Badge 
                                        variant="outline" 
                                        className={cn("text-[10px] px-1.5 py-0", badgeStyle.className)}
                                      >
                                        {badgeStyle.label}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                      {rec.reason}
                                    </p>
                                    {rec.designHint && (
                                      <p className="text-[10px] text-primary/80 mt-1 italic">
                                        💡 {rec.designHint}
                                      </p>
                                    )}
                                  </div>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button 
                                        size="icon" 
                                        variant="ghost" 
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onSelectAsset?.(rec.assetType, rec.designHint);
                                        }}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Create this asset</TooltipContent>
                                  </Tooltip>
                                </motion.div>
                              );
                            })}
                          </div>
                        )
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {!hasEventDetails && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Enter event details to get AI recommendations
                  </p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Design Variations Section */}
        {(onFetchVariations || designVariations.length > 0) && (
          <Collapsible open={isVariationsOpen} onOpenChange={setIsVariationsOpen}>
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <Palette className="w-4 h-4 text-accent-foreground" />
                    </div>
                    <span className="font-medium text-sm">Design Variations</span>
                    {designVariations.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {designVariations.length}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight 
                    className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isVariationsOpen && "rotate-90"
                    )} 
                  />
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <div className="px-3 pb-3 space-y-3">
                  {/* Generate Button */}
                  {onFetchVariations && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={onFetchVariations}
                      disabled={isLoadingVariations || !hasEventDetails || !currentAssetType}
                    >
                      {isLoadingVariations ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3 mr-2" />
                          Generate Variations
                        </>
                      )}
                    </Button>
                  )}

                  {/* Variations Grid */}
                  <AnimatePresence>
                    {designVariations.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {designVariations.map((variation, idx) => (
                          <motion.div
                            key={`${variation.name}-${idx}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                            onClick={() => onSelectVariation?.(variation)}
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <h4 className="text-xs font-semibold truncate">{variation.name}</h4>
                            </div>
                            <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">
                              {variation.styleDifference}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {variation.moodKeywords.slice(0, 3).map((keyword, kidx) => (
                                <span 
                                  key={kidx}
                                  className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground"
                                >
                                  {keyword}
                                </span>
                              ))}
                            </div>
                            {variation.colorSuggestion && (
                              <p className="text-[9px] text-primary/70 mt-1.5 truncate">
                                🎨 {variation.colorSuggestion}
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!currentAssetType && onFetchVariations && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      Select an asset to get design variations
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}
      </div>
    </TooltipProvider>
  );
};
