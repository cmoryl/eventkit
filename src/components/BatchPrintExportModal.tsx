import React, { useState, useMemo } from 'react';
import { AssetType, GeneratedAsset, EventDetails } from '../types';
import { 
  requiresDesignExtraction, 
  getPrintReadySpec, 
  getPrintMethodLabel,
  getExtractionTypeLabel,
  getIsolatedDesignPrompt,
  isEnvironmentalAsset,
  isLargeFormatAsset,
  hasPrintWorkflow,
  ENVIRONMENTAL_MOCKUP_ASSETS,
  LARGE_FORMAT_ASSETS,
  MOCKUP_ASSETS,
  DIRECT_PRINT_ASSETS
} from '../config/printReadyConfig';
import { supabase } from '../integrations/supabase/client';
import JSZip from 'jszip';
import {
  Package,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  X,
  Printer,
  Building2,
  Maximize2,
  Shirt,
  FileText,
  Play,
  Pause,
  SkipForward,
  FolderArchive,
  Check,
  Circle,
  XCircle,
  Layers
} from 'lucide-react';

interface BatchPrintExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: GeneratedAsset[];
  eventDetails: EventDetails;
  colorPalette?: string[];
}

type ExportStatus = 'pending' | 'extracting' | 'complete' | 'error' | 'skipped';

interface AssetExportState {
  asset: GeneratedAsset;
  status: ExportStatus;
  extractedUrl?: string;
  error?: string;
  category: 'environmental' | 'merchandise' | 'signage' | 'direct';
}

type BatchStep = 'select' | 'exporting' | 'complete';

const BatchPrintExportModal: React.FC<BatchPrintExportModalProps> = ({
  isOpen,
  onClose,
  assets,
  eventDetails,
  colorPalette
}) => {
  const [step, setStep] = useState<BatchStep>('select');
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [exportStates, setExportStates] = useState<Map<string, AssetExportState>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [overallError, setOverallError] = useState<string | null>(null);

  // Categorize printable assets
  const printableAssets = useMemo(() => {
    return assets.filter(asset => {
      const hasContent = typeof asset.content === 'string' && asset.content.length > 0;
      const isPrintable = hasPrintWorkflow(asset.type);
      return hasContent && isPrintable && !asset.isLoading;
    });
  }, [assets]);

  // Group assets by category
  const assetsByCategory = useMemo(() => {
    const categories = {
      environmental: [] as GeneratedAsset[],
      merchandise: [] as GeneratedAsset[],
      signage: [] as GeneratedAsset[],
      direct: [] as GeneratedAsset[],
    };

    printableAssets.forEach(asset => {
      if (ENVIRONMENTAL_MOCKUP_ASSETS.includes(asset.type)) {
        categories.environmental.push(asset);
      } else if (MOCKUP_ASSETS.includes(asset.type)) {
        categories.merchandise.push(asset);
      } else if (LARGE_FORMAT_ASSETS.includes(asset.type)) {
        categories.signage.push(asset);
      } else {
        categories.direct.push(asset);
      }
    });

    return categories;
  }, [printableAssets]);

  const getCategoryForAsset = (asset: GeneratedAsset): AssetExportState['category'] => {
    if (ENVIRONMENTAL_MOCKUP_ASSETS.includes(asset.type)) return 'environmental';
    if (MOCKUP_ASSETS.includes(asset.type)) return 'merchandise';
    if (LARGE_FORMAT_ASSETS.includes(asset.type)) return 'signage';
    return 'direct';
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const next = new Set(prev);
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
  };

  const selectAllInCategory = (category: keyof typeof assetsByCategory) => {
    const categoryAssets = assetsByCategory[category];
    setSelectedAssets(prev => {
      const next = new Set(prev);
      categoryAssets.forEach(asset => next.add(asset.id));
      return next;
    });
  };

  const deselectAllInCategory = (category: keyof typeof assetsByCategory) => {
    const categoryAssets = assetsByCategory[category];
    setSelectedAssets(prev => {
      const next = new Set(prev);
      categoryAssets.forEach(asset => next.delete(asset.id));
      return next;
    });
  };

  const selectAll = () => {
    setSelectedAssets(new Set(printableAssets.map(a => a.id)));
  };

  const deselectAll = () => {
    setSelectedAssets(new Set());
  };

  const getSelectedAssets = () => {
    return printableAssets.filter(a => selectedAssets.has(a.id));
  };

  const startBatchExport = async () => {
    const selected = getSelectedAssets();
    if (selected.length === 0) return;

    // Initialize export states
    const initialStates = new Map<string, AssetExportState>();
    selected.forEach(asset => {
      const needsExtraction = requiresDesignExtraction(asset.type);
      initialStates.set(asset.id, {
        asset,
        status: needsExtraction ? 'pending' : 'complete',
        extractedUrl: needsExtraction ? undefined : (asset.content as string),
        category: getCategoryForAsset(asset),
      });
    });
    setExportStates(initialStates);
    setCurrentIndex(0);
    setStep('exporting');
    setIsPaused(false);
    setOverallError(null);

    // Start processing
    await processNextAsset(selected, initialStates, 0);
  };

  const processNextAsset = async (
    selected: GeneratedAsset[],
    states: Map<string, AssetExportState>,
    index: number
  ) => {
    if (index >= selected.length) {
      // All done, generate ZIP
      await generateZipFile(states);
      return;
    }

    const asset = selected[index];
    const state = states.get(asset.id);
    
    if (!state || state.status === 'complete') {
      // Skip already complete (direct print assets)
      setCurrentIndex(index + 1);
      await processNextAsset(selected, states, index + 1);
      return;
    }

    // Update status to extracting
    const updatedStates = new Map(states);
    updatedStates.set(asset.id, { ...state, status: 'extracting' });
    setExportStates(updatedStates);
    setCurrentIndex(index);

    try {
      const extractionPrompt = getIsolatedDesignPrompt(asset.type);
      
      const response = await supabase.functions.invoke('generate-image', {
        body: {
          assetType: `${asset.type}_ISOLATED`,
          eventName: eventDetails.name,
          eventDescription: eventDetails.description,
          styleDescription: extractionPrompt,
          colorPalette: colorPalette,
        }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data?.imageUrl) throw new Error('Failed to generate isolated design');

      // Update state with success
      updatedStates.set(asset.id, {
        ...state,
        status: 'complete',
        extractedUrl: response.data.imageUrl,
      });
      setExportStates(new Map(updatedStates));

    } catch (err) {
      console.error(`Error extracting ${asset.title}:`, err);
      updatedStates.set(asset.id, {
        ...state,
        status: 'error',
        error: err instanceof Error ? err.message : 'Extraction failed',
      });
      setExportStates(new Map(updatedStates));
    }

    // Check if paused
    if (!isPaused) {
      await processNextAsset(selected, updatedStates, index + 1);
    }
  };

  const resumeExport = async () => {
    setIsPaused(false);
    const selected = getSelectedAssets();
    await processNextAsset(selected, exportStates, currentIndex + 1);
  };

  const skipCurrent = async () => {
    const selected = getSelectedAssets();
    const asset = selected[currentIndex];
    if (asset) {
      const state = exportStates.get(asset.id);
      if (state) {
        const updatedStates = new Map(exportStates);
        updatedStates.set(asset.id, { ...state, status: 'skipped' });
        setExportStates(updatedStates);
        await processNextAsset(selected, updatedStates, currentIndex + 1);
      }
    }
  };

  const generateZipFile = async (states: Map<string, AssetExportState>) => {
    setIsGeneratingZip(true);
    
    try {
      const zip = new JSZip();
      
      // Create folders for each category
      const folders = {
        environmental: zip.folder('01-Booth-Environment'),
        merchandise: zip.folder('02-Merchandise'),
        signage: zip.folder('03-Signage'),
        direct: zip.folder('04-Print-Ready'),
      };

      // Add README
      const readme = generateReadme(states);
      zip.file('README.txt', readme);

      // Add print specifications document
      const specsDoc = generateSpecsDocument(states);
      zip.file('PRINT-SPECIFICATIONS.txt', specsDoc);

      // Process each asset
      for (const [, state] of states) {
        if (state.status === 'complete' && state.extractedUrl) {
          const folder = folders[state.category];
          if (folder) {
            const fileName = `${state.asset.title.replace(/[^a-zA-Z0-9]/g, '-')}-print-ready.png`;
            
            // Fetch and add the image
            try {
              const imageData = await fetchImageAsBase64(state.extractedUrl);
              folder.file(fileName, imageData, { base64: true });
            } catch (err) {
              console.error(`Failed to add ${fileName} to ZIP:`, err);
            }
          }
        }
      }

      // Generate the ZIP
      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      setZipBlob(blob);
      setStep('complete');
    } catch (err) {
      console.error('Error generating ZIP:', err);
      setOverallError(err instanceof Error ? err.message : 'Failed to create ZIP file');
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const fetchImageAsBase64 = async (url: string): Promise<string> => {
    // If it's already a base64 URL, extract the data
    if (url.startsWith('data:')) {
      return url.split(',')[1];
    }
    
    // Fetch the image
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const generateReadme = (states: Map<string, AssetExportState>): string => {
    const successCount = Array.from(states.values()).filter(s => s.status === 'complete').length;
    const errorCount = Array.from(states.values()).filter(s => s.status === 'error').length;
    
    return `EVENT PRINT PACKAGE
==================

Event: ${eventDetails.name}
Generated: ${new Date().toLocaleDateString()}

CONTENTS
--------
- 01-Booth-Environment/  - Booth panels, kiosks, registration counters
- 02-Merchandise/        - T-shirts, hats, bags, promotional items
- 03-Signage/            - Banners, flags, outdoor signs
- 04-Print-Ready/        - Direct print assets (badges, cards, etc.)

SUMMARY
-------
Total Assets: ${states.size}
Successfully Exported: ${successCount}
${errorCount > 0 ? `Failed: ${errorCount}` : ''}

PRINT NOTES
-----------
- All files are high-resolution PNG format
- Environmental and merchandise files are isolated graphics
  (no product mockup visible - just the printable artwork)
- Check PRINT-SPECIFICATIONS.txt for detailed specs per asset

For vendor submission, refer to individual asset specs.
`;
  };

  const generateSpecsDocument = (states: Map<string, AssetExportState>): string => {
    let doc = `PRINT SPECIFICATIONS
====================

Event: ${eventDetails.name}
Generated: ${new Date().toLocaleDateString()}

`;

    const categories = ['environmental', 'merchandise', 'signage', 'direct'] as const;
    const categoryNames = {
      environmental: 'BOOTH & ENVIRONMENT',
      merchandise: 'MERCHANDISE',
      signage: 'SIGNAGE',
      direct: 'DIRECT PRINT',
    };

    categories.forEach(category => {
      const categoryStates = Array.from(states.values()).filter(s => s.category === category);
      if (categoryStates.length === 0) return;

      doc += `\n${categoryNames[category]}\n${'='.repeat(categoryNames[category].length)}\n\n`;

      categoryStates.forEach(state => {
        const spec = getPrintReadySpec(state.asset.type);
        doc += `${state.asset.title}\n`;
        doc += `${'─'.repeat(state.asset.title.length)}\n`;
        
        if (spec) {
          doc += `  Print Method: ${getPrintMethodLabel(spec.printMethod)}\n`;
          if (spec.isolatedDimensions) {
            const unit = spec.isolatedDimensions.unit === 'ft' ? 'feet' : 'inches';
            doc += `  Dimensions: ${spec.isolatedDimensions.width} × ${spec.isolatedDimensions.height} ${unit}\n`;
          }
          doc += `  Resolution: 300 DPI\n`;
          doc += `  Color Mode: ${spec.requiresTransparency ? 'RGB with transparency' : 'CMYK'}\n`;
          if (spec.colorLimit) {
            doc += `  Color Limit: ${spec.colorLimit} colors\n`;
          }
          if (spec.requiresTransparency) {
            doc += `  Background: Transparent\n`;
          }
          if (spec.notes) {
            doc += `  Notes: ${spec.notes}\n`;
          }
        }
        doc += `  Status: ${state.status === 'complete' ? 'Exported' : state.status}\n`;
        doc += '\n';
      });
    });

    return doc;
  };

  const downloadZip = () => {
    if (!zipBlob) return;
    
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventDetails.name.replace(/[^a-zA-Z0-9]/g, '-')}-print-package.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getProgressStats = () => {
    const states = Array.from(exportStates.values());
    return {
      total: states.length,
      complete: states.filter(s => s.status === 'complete').length,
      error: states.filter(s => s.status === 'error').length,
      pending: states.filter(s => s.status === 'pending' || s.status === 'extracting').length,
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'environmental': return <Building2 className="w-4 h-4" />;
      case 'merchandise': return <Shirt className="w-4 h-4" />;
      case 'signage': return <Maximize2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: ExportStatus) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-destructive" />;
      case 'extracting': return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'skipped': return <SkipForward className="w-4 h-4 text-muted-foreground" />;
      default: return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Batch Print Export</h2>
                <p className="text-xs text-muted-foreground">Generate print-ready files for all assets</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step: Select Assets */}
          {step === 'select' && (
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedAssets.size} of {printableAssets.length} assets selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Select All
                  </button>
                  <button
                    onClick={deselectAll}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Category Sections */}
              {Object.entries(assetsByCategory).map(([category, categoryAssets]) => {
                if (categoryAssets.length === 0) return null;
                
                const categoryNames: Record<string, string> = {
                  environmental: 'Booth & Environment',
                  merchandise: 'Merchandise',
                  signage: 'Large Format Signage',
                  direct: 'Direct Print Assets',
                };

                const allSelected = categoryAssets.every(a => selectedAssets.has(a.id));
                const someSelected = categoryAssets.some(a => selectedAssets.has(a.id));

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                        {getCategoryIcon(category)}
                        {categoryNames[category]}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({categoryAssets.length})
                        </span>
                      </h3>
                      <button
                        onClick={() => allSelected 
                          ? deselectAllInCategory(category as keyof typeof assetsByCategory)
                          : selectAllInCategory(category as keyof typeof assetsByCategory)
                        }
                        className="text-xs text-primary hover:underline"
                      >
                        {allSelected ? 'Deselect all' : 'Select all'}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {categoryAssets.map(asset => {
                        const isSelected = selectedAssets.has(asset.id);
                        const needsExtraction = requiresDesignExtraction(asset.type);
                        
                        return (
                          <button
                            key={asset.id}
                            onClick={() => toggleAssetSelection(asset.id)}
                            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 ${
                              isSelected 
                                ? 'bg-primary/10 border-primary' 
                                : 'bg-secondary/30 border-border hover:bg-secondary/50'
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{asset.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {needsExtraction ? 'Will extract isolated design' : 'Direct export'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {printableAssets.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No printable assets found</p>
                  <p className="text-xs mt-1">Generate some assets first to batch export</p>
                </div>
              )}

              {/* Start Export Button */}
              {selectedAssets.size > 0 && (
                <button
                  onClick={startBatchExport}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Batch Export ({selectedAssets.size} assets)
                </button>
              )}
            </div>
          )}

          {/* Step: Exporting */}
          {step === 'exporting' && (
            <div className="space-y-6">
              {/* Progress Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm mb-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isGeneratingZip ? 'Creating ZIP package...' : 'Generating print-ready files...'}
                </div>
                
                {!isGeneratingZip && (
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(getProgressStats().complete / getProgressStats().total) * 100}%` }}
                    />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mt-2">
                  {getProgressStats().complete} of {getProgressStats().total} complete
                  {getProgressStats().error > 0 && ` • ${getProgressStats().error} errors`}
                </p>
              </div>

              {/* Controls */}
              {!isGeneratingZip && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsPaused(!isPaused)}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm flex items-center gap-2"
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </button>
                  <button
                    onClick={skipCurrent}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm flex items-center gap-2"
                  >
                    <SkipForward className="w-4 h-4" />
                    Skip Current
                  </button>
                </div>
              )}

              {isPaused && (
                <button
                  onClick={resumeExport}
                  className="w-full py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm"
                >
                  Resume Export
                </button>
              )}

              {/* Asset List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from(exportStates.values()).map((state, index) => (
                  <div 
                    key={state.asset.id}
                    className={`p-3 rounded-lg border flex items-center gap-3 ${
                      index === currentIndex && state.status === 'extracting'
                        ? 'bg-primary/10 border-primary'
                        : 'bg-secondary/20 border-border'
                    }`}
                  >
                    {getStatusIcon(state.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{state.asset.title}</p>
                      {state.error && (
                        <p className="text-[10px] text-destructive">{state.error}</p>
                      )}
                    </div>
                    {getCategoryIcon(state.category)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <FolderArchive className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Print Package Ready!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your event print package has been generated
                </p>
              </div>

              {/* Summary */}
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-3">Package Contents</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(assetsByCategory).map(([category, categoryAssets]) => {
                    const exported = Array.from(exportStates.values())
                      .filter(s => s.category === category && s.status === 'complete').length;
                    if (exported === 0) return null;
                    
                    const categoryNames: Record<string, string> = {
                      environmental: 'Booth/Environment',
                      merchandise: 'Merchandise',
                      signage: 'Signage',
                      direct: 'Direct Print',
                    };

                    return (
                      <div key={category} className="flex items-center gap-2">
                        {getCategoryIcon(category)}
                        <span className="text-muted-foreground">{categoryNames[category]}:</span>
                        <span className="text-foreground font-medium">{exported}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Errors Summary */}
              {getProgressStats().error > 0 && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertTriangle className="w-4 h-4" />
                    {getProgressStats().error} asset(s) failed to export
                  </div>
                </div>
              )}

              {overallError && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                  {overallError}
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={downloadZip}
                disabled={!zipBlob}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download Print Package (.zip)
              </button>

              <button
                onClick={() => {
                  setStep('select');
                  setExportStates(new Map());
                  setZipBlob(null);
                }}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Export More Assets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchPrintExportModal;
