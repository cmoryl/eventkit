import React, { useState } from 'react';
import { AssetType, GeneratedAsset, EventDetails } from '../types';
import { 
  requiresDesignExtraction, 
  getPrintReadySpec, 
  getPrintMethodLabel,
  getIsolatedDesignPrompt,
  PRINT_READY_SPECS
} from '../config/printReadyConfig';
import { printDimensionsMap } from '../utils';
import { supabase } from '../integrations/supabase/client';
import {
  Printer,
  FileImage,
  Scissors,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Shirt,
  Package,
  Info,
  Sparkles,
  FileCheck,
  Eye,
  Layers
} from 'lucide-react';

interface PrintReadyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: GeneratedAsset;
  eventDetails: EventDetails;
  colorPalette?: string[];
}

type ExportStep = 'choose' | 'extracting' | 'preview' | 'exporting' | 'complete';

const PrintReadyExportModal: React.FC<PrintReadyExportModalProps> = ({
  isOpen,
  onClose,
  asset,
  eventDetails,
  colorPalette
}) => {
  const [step, setStep] = useState<ExportStep>('choose');
  const [extractedDesign, setExtractedDesign] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsExtraction = requiresDesignExtraction(asset.type);
  const spec = getPrintReadySpec(asset.type);
  const dims = printDimensionsMap[asset.type];
  const currentImage = typeof asset.content === 'string' ? asset.content : '';

  if (!isOpen) return null;

  const handleExtractDesign = async () => {
    setIsExtracting(true);
    setError(null);
    setStep('extracting');

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

      setExtractedDesign(response.data.imageUrl);
      setStep('preview');
    } catch (err) {
      console.error('Design extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract design');
      setStep('choose');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    setStep('exporting');
    
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setStep('complete');
    } catch (err) {
      setError('Failed to download file');
      setStep('preview');
    }
  };

  const getFilename = (suffix: string = '') => {
    const baseName = asset.title.replace(/\s+/g, '-').toLowerCase();
    const typeSuffix = suffix ? `-${suffix}` : '';
    return `${baseName}${typeSuffix}-print-ready.png`;
  };

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Printer className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Print-Ready Export</h2>
                <p className="text-xs text-muted-foreground">{asset.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step: Choose export type */}
          {step === 'choose' && (
            <div className="space-y-6">
              {/* Current Preview */}
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-xl bg-muted/30 border border-border overflow-hidden flex-shrink-0">
                  {currentImage && (
                    <img src={currentImage} alt={asset.title} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground mb-1">{asset.title}</h3>
                  {spec && (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" />
                        {getPrintMethodLabel(spec.printMethod)}
                      </p>
                      {spec.isolatedDimensions && (
                        <p className="flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5" />
                          {spec.isolatedDimensions.width}" × {spec.isolatedDimensions.height}"
                        </p>
                      )}
                      {spec.colorLimit && (
                        <p className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Max {spec.colorLimit} colors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Export Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Export Options</h4>
                
                {needsExtraction ? (
                  <>
                    {/* Info about mockup vs design */}
                    <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Mockup vs Print File</p>
                          <p>The current image shows a product mockup. For printing, you need the <strong>isolated design graphic</strong> without the product visible.</p>
                        </div>
                      </div>
                    </div>

                    {/* Option 1: Extract Design */}
                    <button
                      onClick={handleExtractDesign}
                      className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-xl text-left transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground flex items-center gap-2">
                            Generate Print-Ready Design
                            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Recommended</span>
                          </h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            AI will create an isolated design file optimized for {getPrintMethodLabel(spec?.printMethod)}
                          </p>
                        </div>
                      </div>
                    </button>

                    {/* Option 2: Download mockup anyway */}
                    <button
                      onClick={() => handleDownload(currentImage, getFilename('mockup'))}
                      className="w-full p-4 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-xl text-left transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-secondary">
                          <FileImage className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">Download Mockup Image</h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Download the product mockup for presentations or approval
                          </p>
                        </div>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Direct print asset */}
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium text-foreground mb-1">Ready for Print</p>
                          <p>This asset is already a print-ready design. Download directly for production.</p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(currentImage, getFilename())}
                      className="w-full p-4 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-xl text-left transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/20">
                          <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">Download Print-Ready File</h5>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {dims ? `${dims.w}" × ${dims.h}" at 300 DPI` : 'High resolution print file'}
                          </p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>

              {/* Print specifications */}
              {spec && (
                <div className="p-3 bg-secondary/30 rounded-lg">
                  <h5 className="text-xs font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    Print Specifications
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <span className="ml-1 text-foreground">{getPrintMethodLabel(spec.printMethod)}</span>
                    </div>
                    {spec.isolatedDimensions && (
                      <div>
                        <span className="text-muted-foreground">Size:</span>
                        <span className="ml-1 text-foreground">{spec.isolatedDimensions.width}" × {spec.isolatedDimensions.height}"</span>
                      </div>
                    )}
                    {spec.colorLimit && (
                      <div>
                        <span className="text-muted-foreground">Colors:</span>
                        <span className="ml-1 text-foreground">Max {spec.colorLimit}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Background:</span>
                      <span className="ml-1 text-foreground">{spec.requiresTransparency ? 'Transparent' : 'Solid'}</span>
                    </div>
                  </div>
                  {spec.notes && (
                    <p className="mt-2 text-[10px] text-muted-foreground italic">{spec.notes}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step: Extracting */}
          {step === 'extracting' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <Sparkles className="w-5 h-5 text-primary absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-foreground">Generating Print-Ready Design</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Creating isolated artwork optimized for {getPrintMethodLabel(spec?.printMethod)}...
                </p>
              </div>
            </div>
          )}

          {/* Step: Preview extracted design */}
          {step === 'preview' && extractedDesign && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  Design Extracted Successfully
                </div>
              </div>

              {/* Side by side comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-muted-foreground text-center">Original Mockup</h4>
                  <div className="aspect-square rounded-xl bg-muted/30 border border-border overflow-hidden">
                    <img src={currentImage} alt="Mockup" className="w-full h-full object-contain" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-primary text-center flex items-center justify-center gap-1">
                    <Printer className="w-3.5 h-3.5" />
                    Print-Ready Design
                  </h4>
                  <div className="aspect-square rounded-xl bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:12px_12px] border-2 border-primary overflow-hidden">
                    <img src={extractedDesign} alt="Print Ready" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              {/* Download button */}
              <button
                onClick={() => handleDownload(extractedDesign, getFilename('print-ready'))}
                className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Print-Ready File
              </button>

              <button
                onClick={() => setStep('choose')}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to options
              </button>
            </div>
          )}

          {/* Step: Complete */}
          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <h3 className="font-medium text-foreground">Download Complete!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your print-ready file has been downloaded.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('choose')}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm"
                >
                  Export Another
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Step: Exporting */}
          {step === 'exporting' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Preparing download...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintReadyExportModal;
