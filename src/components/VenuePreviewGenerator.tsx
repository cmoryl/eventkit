import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Video, Download, X, Sparkles, CheckCircle2, Plus, Trash2, Image as ImageIcon, Layers } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';
import type { VenueVideoAnalysis, ColorInfo, EventDetails, GeneratedAsset } from '@/types';
import { compileGenerationPrompt } from '@/services/aiBrain/promptCompiler';
import type { GenerationContext } from '@/services/aiBrain/types';

interface VenuePreviewGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  venueVideoAnalysis: VenueVideoAnalysis | null;
  eventDetails: EventDetails;
  colorPalette: ColorInfo[];
  styleDescription?: string;
  generatedAssets?: GeneratedAsset[];
}

type BrandElementType = 'signage' | 'banner' | 'counter' | 'environmental' | 'digital';

interface BrandElement {
  type: BrandElementType;
  label: string;
  description: string;
  icon: string;
  checked: boolean;
}

interface SelectedAsset {
  id: string;
  type: AssetType;
  title: string;
  imageUrl: string;
  placement: 'signage' | 'banner' | 'counter' | 'environmental' | 'digital' | 'auto';
}

interface GeneratedPreview {
  frameIndex: number;
  type: 'video' | 'image';
  url: string;
  thumbnailUrl?: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  error?: string;
}

type GenerationStage = 'selecting' | 'generating' | 'complete' | 'error';
type AssetSelectionMode = 'generic' | 'specific';

// Asset types that can be placed in venues (use string values to match asset.type)
const VENUE_PLACEABLE_TYPES: string[] = [
  AssetType.Banner, AssetType.EventSignage, AssetType.HangingSignage, AssetType.OutdoorSignage, 
  AssetType.DoorSignage, AssetType.EaselSignage, AssetType.LocationSignage, AssetType.RoomSignage, 
  AssetType.StandUpPillarBanner, AssetType.FeatherFlag, AssetType.TeardropFlag, AssetType.BackWall, 
  AssetType.RegistrationCounter, AssetType.WelcomeCounter, AssetType.RegistrationBackWall, 
  AssetType.TechnologyCounter, AssetType.Kiosk, AssetType.StepAndRepeat, AssetType.DigitalSignageLoop, 
  AssetType.AFrameSign, AssetType.WindowCling, AssetType.FloorDecal, AssetType.ElevatorWrap,
  AssetType.EscalatorGraphics, AssetType.ColumnWrap, AssetType.CeilingHanger, AssetType.VIPLoungeSignage,
  AssetType.MainStageBackdrop, AssetType.TableTent, AssetType.WifiSign, AssetType.GlassDoor, 
  AssetType.GlassDoubleDoor
];

export const VenuePreviewGenerator: React.FC<VenuePreviewGeneratorProps> = ({
  isOpen,
  onClose,
  venueVideoAnalysis,
  eventDetails,
  colorPalette,
  styleDescription,
  generatedAssets = [],
}) => {
  const [stage, setStage] = useState<GenerationStage>('selecting');
  const [selectedFrames, setSelectedFrames] = useState<number[]>([0]);
  const [previews, setPreviews] = useState<GeneratedPreview[]>([]);
  const [currentGenerating, setCurrentGenerating] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [assetMode, setAssetMode] = useState<AssetSelectionMode>('specific');
  const [selectedAssets, setSelectedAssets] = useState<SelectedAsset[]>([]);
  
  const [brandElements, setBrandElements] = useState<BrandElement[]>([
    { type: 'signage', label: 'Signage & Banners', description: 'Welcome signs, directional signage, and retractable banners', icon: '🪧', checked: true },
    { type: 'counter', label: 'Counters & Structures', description: 'Registration desk, welcome counter, info kiosks', icon: '🏛️', checked: true },
    { type: 'environmental', label: 'Environmental Branding', description: 'Wall graphics, floor decals, pillar wraps', icon: '🎨', checked: true },
    { type: 'digital', label: 'Digital Displays', description: 'Screens showing event content and schedules', icon: '📺', checked: true },
  ]);

  const keyFrames = venueVideoAnalysis?.keyFrames || [];
  const hasFrames = keyFrames.length > 0;

  // Filter assets that can be placed in venues and have image content
  const placeableAssets = useMemo(() => {
    return generatedAssets.filter(asset => 
      VENUE_PLACEABLE_TYPES.includes(asset.type as AssetType) &&
      typeof asset.content === 'string' &&
      (asset.content.startsWith('data:image') || asset.content.startsWith('http'))
    );
  }, [generatedAssets]);

  const toggleElement = (type: BrandElementType) => {
    setBrandElements(prev => prev.map(el => 
      el.type === type ? { ...el, checked: !el.checked } : el
    ));
  };

  const toggleFrame = (index: number) => {
    setSelectedFrames(prev => {
      if (prev.includes(index)) {
        return prev.length > 1 ? prev.filter(i => i !== index) : prev;
      }
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const getPlacementForAssetType = (type: AssetType): SelectedAsset['placement'] => {
    if (['BANNER', 'STAND_UP_PILLAR_BANNER', 'FEATHER_FLAG', 'TEARDROP_FLAG', 'BACK_WALL', 'STEP_AND_REPEAT', 'MAIN_STAGE_BACKDROP'].includes(type)) {
      return 'banner';
    }
    if (['REGISTRATION_COUNTER', 'WELCOME_COUNTER', 'TECHNOLOGY_COUNTER', 'KIOSK'].includes(type)) {
      return 'counter';
    }
    if (['FLOOR_DECAL', 'ELEVATOR_WRAP', 'ESCALATOR_GRAPHICS', 'COLUMN_WRAP', 'CEILING_HANGER', 'WINDOW_CLING'].includes(type)) {
      return 'environmental';
    }
    if (['DIGITAL_SIGNAGE_LOOP'].includes(type)) {
      return 'digital';
    }
    return 'signage';
  };

  const toggleAssetSelection = (asset: GeneratedAsset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      }
      return [...prev, {
        id: asset.id,
        type: asset.type as AssetType,
        title: asset.title,
        imageUrl: asset.content as string,
        placement: getPlacementForAssetType(asset.type as AssetType),
      }];
    });
  };

  const isAssetSelected = (assetId: string) => selectedAssets.some(a => a.id === assetId);

  const selectAllFrames = () => {
    setSelectedFrames(keyFrames.slice(0, 8).map((_, i) => i));
  };

  const clearSelection = () => {
    setSelectedFrames([0]);
  };

  const generatePreviewForFrame = async (frameIndex: number): Promise<GeneratedPreview> => {
    const frameData = keyFrames[frameIndex]?.imageData;
    
    if (!frameData) {
      return { frameIndex, type: 'image', url: '', status: 'error', error: 'No frame data' };
    }

    try {
      // Build request based on asset mode
      const requestBody: Record<string, unknown> = {
        venueFrameBase64: frameData,
        eventName: eventDetails.name,
        eventDescription: eventDetails.description,
        styleDescription,
        duration: 5,
      };

      // Build a full AI Brain compiled prompt with DNA, anchors, seed, and quality gate
      const generationContext: GenerationContext = {
        eventName: eventDetails.name,
        eventDescription: eventDetails.description,
        assetType: 'VENUE_PREVIEW',
        styleDescription,
        colorPalette: colorPalette.map(c => c.hex),
      };

      const basePrompt = [
        `Transform this venue into a professionally branded event space for "${eventDetails.name}".`,
        eventDetails.description ? `Event: ${eventDetails.description}.` : '',
        styleDescription ? `Style: ${styleDescription}.` : '',
        `Preserve venue architecture, match lighting, maintain perspective.`,
        `All inserted assets must be pixel-faithful reproductions—no redrawing or reinterpretation.`,
      ].filter(Boolean).join(' ');

      requestBody.customPrompt = compileGenerationPrompt({
        basePrompt,
        context: generationContext,
        variantName: styleDescription,
      });

      if (assetMode === 'specific' && selectedAssets.length > 0) {
        // Use specific generated assets
        requestBody.specificAssets = selectedAssets.map(asset => ({
          title: asset.title,
          type: asset.type,
          imageUrl: asset.imageUrl,
          placement: asset.placement,
        }));
      } else {
        // Use generic brand elements
        const selectedElements = brandElements.filter(el => el.checked);
        requestBody.brandElements = selectedElements.map(el => ({
          type: el.type,
          description: el.description,
          colorPalette: colorPalette.map(c => c.hex),
        }));
      }

      const { data, error: fnError } = await supabase.functions.invoke('generate-venue-preview', {
        body: requestBody,
      });

      if (fnError) throw fnError;

      if (data.success) {
        return {
          frameIndex,
          type: data.type,
          url: data.videoUrl || data.imageUrl,
          thumbnailUrl: data.thumbnailUrl,
          status: 'complete',
        };
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (err) {
      return {
        frameIndex,
        type: 'image',
        url: '',
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to generate',
      };
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!hasFrames || selectedFrames.length === 0) return;

    // Check if we have something to composite
    const hasGenericElements = brandElements.some(el => el.checked);
    const hasSpecificAssets = selectedAssets.length > 0;
    
    if (assetMode === 'generic' && !hasGenericElements) return;
    if (assetMode === 'specific' && !hasSpecificAssets) return;

    setStage('generating');
    setError(null);
    
    // Initialize previews with pending status
    const initialPreviews: GeneratedPreview[] = selectedFrames.map(frameIndex => ({
      frameIndex,
      type: 'image',
      url: '',
      status: 'pending',
    }));
    setPreviews(initialPreviews);

    // Generate each preview sequentially
    for (let i = 0; i < selectedFrames.length; i++) {
      setCurrentGenerating(i);
      
      // Update status to generating
      setPreviews(prev => prev.map((p, idx) => 
        idx === i ? { ...p, status: 'generating' } : p
      ));

      const result = await generatePreviewForFrame(selectedFrames[i]);
      
      // Update with result
      setPreviews(prev => prev.map((p, idx) => 
        idx === i ? result : p
      ));
    }

    setStage('complete');
  }, [hasFrames, selectedFrames, brandElements, selectedAssets, assetMode, keyFrames, eventDetails, colorPalette, styleDescription]);

  const handleDownload = useCallback((preview: GeneratedPreview) => {
    if (!preview.url) return;
    
    const link = document.createElement('a');
    link.href = preview.url;
    link.download = `${eventDetails.name.replace(/\s+/g, '-')}-venue-angle-${preview.frameIndex + 1}.${preview.type === 'video' ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [eventDetails.name]);

  const handleDownloadAll = useCallback(() => {
    const completedPreviews = previews.filter(p => p.status === 'complete' && p.url);
    completedPreviews.forEach((preview, idx) => {
      setTimeout(() => handleDownload(preview), idx * 500);
    });
  }, [previews, handleDownload]);

  const handleReset = () => {
    setStage('selecting');
    setPreviews([]);
    setCurrentGenerating(0);
    setError(null);
    setSelectedAssets([]);
  };

  const handleRemovePreview = (frameIndex: number) => {
    setPreviews(prev => prev.filter(p => p.frameIndex !== frameIndex));
  };

  const completedCount = previews.filter(p => p.status === 'complete').length;
  const totalCount = selectedFrames.length;
  const progress = stage === 'generating' 
    ? ((currentGenerating + 1) / totalCount) * 100 
    : completedCount === totalCount ? 100 : 0;

  const canGenerate = assetMode === 'specific' 
    ? selectedAssets.length > 0 && selectedFrames.length > 0
    : brandElements.some(el => el.checked) && selectedFrames.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-violet-500" />
            Generate Branded Venue Previews
            <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
              MULTI-ANGLE
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* No frames warning */}
          {!hasFrames && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
              <p className="text-sm text-amber-600">
                Upload a venue walkthrough video first to generate branded previews.
              </p>
            </div>
          )}

          {/* Frame Selection */}
          {hasFrames && stage === 'selecting' && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Select Venue Angles ({selectedFrames.length} selected)</label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllFrames}>
                      <Plus className="w-3 h-3 mr-1" />
                      Select All
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSelection}>
                      Clear
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Select multiple frames to generate previews from different angles of your venue
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {keyFrames.slice(0, 8).map((frame, index) => (
                    <button
                      key={index}
                      onClick={() => toggleFrame(index)}
                      className={cn(
                        "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                        selectedFrames.includes(index) 
                          ? "border-violet-500 ring-2 ring-violet-500/30" 
                          : "border-transparent hover:border-violet-500/50"
                      )}
                    >
                      <img 
                        src={frame.imageData} 
                        alt={`Angle ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {selectedFrames.includes(index) && (
                        <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                          <div className="absolute top-1 right-1 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {selectedFrames.indexOf(index) + 1}
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                        Angle {index + 1}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Selection Mode */}
              <Tabs value={assetMode} onValueChange={(v) => setAssetMode(v as AssetSelectionMode)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="specific" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Your Assets
                    {placeableAssets.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">{placeableAssets.length}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="generic" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Generic Elements
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="specific" className="mt-4">
                  {placeableAssets.length === 0 ? (
                    <div className="p-6 bg-muted/30 rounded-xl text-center">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        No generated assets available. Generate some banners, signage, or counters first!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Select Assets to Place ({selectedAssets.length} selected)
                        </label>
                        {selectedAssets.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAssets([])}>
                            Clear
                          </Button>
                        )}
                      </div>
                      <ScrollArea className="h-[200px] rounded-lg border p-2">
                        <div className="grid grid-cols-3 gap-2">
                          {placeableAssets.map((asset) => (
                            <button
                              key={asset.id}
                              onClick={() => toggleAssetSelection(asset)}
                              className={cn(
                                "relative aspect-square rounded-lg overflow-hidden border-2 transition-all",
                                isAssetSelected(asset.id)
                                  ? "border-violet-500 ring-2 ring-violet-500/30"
                                  : "border-transparent hover:border-violet-500/50"
                              )}
                            >
                              <img
                                src={asset.content as string}
                                alt={asset.title}
                                className="w-full h-full object-cover"
                              />
                              {isAssetSelected(asset.id) && (
                                <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
                                  <CheckCircle2 className="w-6 h-6 text-violet-500" />
                                </div>
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                                <p className="text-[9px] text-white truncate">{asset.title}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </ScrollArea>
                      {selectedAssets.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Selected: {selectedAssets.map(a => a.title).join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="generic" className="mt-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Generic Branding Elements</label>
                    <div className="grid grid-cols-2 gap-2">
                      {brandElements.map((element) => (
                        <label 
                          key={element.type}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                            element.checked 
                              ? "border-violet-500/50 bg-violet-500/5" 
                              : "border-border hover:border-violet-500/30"
                          )}
                        >
                          <Checkbox 
                            checked={element.checked}
                            onCheckedChange={() => toggleElement(element.type)}
                          />
                          <span className="text-lg">{element.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium block truncate">{element.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate {selectedFrames.length} Preview{selectedFrames.length > 1 ? 's' : ''} 
                {assetMode === 'specific' && selectedAssets.length > 0 && ` with ${selectedAssets.length} Asset${selectedAssets.length > 1 ? 's' : ''}`}
              </Button>
            </>
          )}

          {/* Generating State */}
          {stage === 'generating' && (
            <div className="space-y-4">
              <div className="text-center space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center"
                >
                  <Video className="w-6 h-6 text-violet-500" />
                </motion.div>
                <h3 className="font-semibold">Generating Previews ({currentGenerating + 1}/{totalCount})</h3>
                <Progress value={progress} className="h-2 max-w-xs mx-auto" />
              </div>

              {/* Preview Grid During Generation */}
              <div className="grid grid-cols-2 gap-3">
                {previews.map((preview, idx) => (
                  <div 
                    key={preview.frameIndex}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border-2 relative",
                      preview.status === 'generating' && "border-violet-500 animate-pulse",
                      preview.status === 'complete' && "border-green-500",
                      preview.status === 'error' && "border-destructive",
                      preview.status === 'pending' && "border-border opacity-50"
                    )}
                  >
                    {preview.status === 'complete' && preview.url ? (
                      preview.type === 'video' ? (
                        <video src={preview.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={preview.url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      )
                    ) : (
                      <img 
                        src={keyFrames[preview.frameIndex]?.imageData} 
                        alt={`Angle ${preview.frameIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                      Angle {preview.frameIndex + 1}
                    </div>
                    {preview.status === 'complete' && (
                      <div className="absolute top-1 right-1">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    {preview.status === 'error' && (
                      <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                        <X className="w-6 h-6 text-destructive" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete State */}
          {stage === 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-medium">{completedCount} Preview{completedCount > 1 ? 's' : ''} Generated</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Generate More
                  </Button>
                  {completedCount > 1 && (
                    <Button size="sm" onClick={handleDownloadAll}>
                      <Download className="w-4 h-4 mr-1" />
                      Download All
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-2 gap-3">
                {previews.map((preview) => (
                  <div 
                    key={preview.frameIndex}
                    className={cn(
                      "aspect-video rounded-lg overflow-hidden border relative group",
                      preview.status === 'complete' ? "border-border" : "border-destructive"
                    )}
                  >
                    {preview.status === 'complete' && preview.url ? (
                      <>
                        {preview.type === 'video' ? (
                          <video 
                            src={preview.url} 
                            controls 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img 
                            src={preview.url} 
                            alt={`Preview ${preview.frameIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="w-8 h-8"
                            onClick={() => handleDownload(preview)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="secondary" 
                            className="w-8 h-8"
                            onClick={() => handleRemovePreview(preview.frameIndex)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-destructive/10 flex items-center justify-center">
                        <div className="text-center p-2">
                          <X className="w-6 h-6 text-destructive mx-auto mb-1" />
                          <p className="text-xs text-destructive">{preview.error || 'Failed'}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black/60 px-1.5 py-0.5 rounded text-[10px] text-white">
                      Angle {preview.frameIndex + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {stage === 'error' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-destructive">Generation Failed</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" onClick={handleReset}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VenuePreviewGenerator;
