import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { 
  PrintTemplateSpecs, 
  PrintTemplate, 
  VENDOR_PRESETS,
  convertToInches,
  getTotalDimensions 
} from '../types/printTemplate';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Ruler,
  Palette,
  Scissors,
  Grid3X3,
  Eye,
  EyeOff,
  RotateCcw,
  Save,
  X,
  ChevronDown,
  Building2,
  Sparkles,
  Move,
  ZoomIn,
  ZoomOut,
  Layers
} from 'lucide-react';

interface TemplateImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateImported: (template: PrintTemplate) => void;
  projectId?: string;
  assetType?: string;
}

type ImportStep = 'upload' | 'extracting' | 'preview' | 'adjust' | 'saving';

const TemplateImportModal: React.FC<TemplateImportModalProps> = ({
  isOpen,
  onClose,
  onTemplateImported,
  projectId,
  assetType
}) => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [specs, setSpecs] = useState<PrintTemplateSpecs | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [sourceVendor, setSourceVendor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Overlay adjustment state
  const [showBleed, setShowBleed] = useState(true);
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showDieLines, setShowDieLines] = useState(true);
  const [overlayOpacity, setOverlayOpacity] = useState(0.7);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setTemplateName(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setError(null);

    // Create preview for images/PDFs
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'application/pdf' || droppedFile.type.startsWith('image/'))) {
      handleFileSelect(droppedFile);
    } else {
      setError('Please upload a PDF or image file');
    }
  }, [handleFileSelect]);

  const handleExtractSpecs = async () => {
    if (!file || !filePreview) return;

    setIsExtracting(true);
    setError(null);
    setStep('extracting');

    try {
      // Convert file to base64
      const base64 = filePreview.split(',')[1] || filePreview;

      const response = await supabase.functions.invoke('parse-template', {
        body: {
          fileBase64: filePreview,
          fileName: file.name,
          mimeType: file.type,
        }
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data?.success) throw new Error(response.data?.error || 'Failed to extract specs');

      setSpecs(response.data.specs);
      setStep('preview');
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extract template specs');
      setStep('upload');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyPreset = (preset: typeof VENDOR_PRESETS[0]) => {
    setSpecs(preset.specs);
    setSourceVendor(preset.vendor);
    setTemplateName(`${preset.vendor} - ${preset.productName}`);
    setStep('preview');
  };

  const handleSaveTemplate = async () => {
    if (!specs) return;

    setIsSaving(true);
    setStep('saving');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to save templates');

      // Upload file to storage if we have one
      let filePath = '';
      if (file && filePreview) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('print-templates')
          .upload(fileName, file);

        if (uploadError) {
          console.warn('File upload failed:', uploadError);
          // Continue without file upload
        } else {
          filePath = fileName;
        }
      }

      // Save template to database
      const templateData = {
        user_id: user.id,
        project_id: projectId || null,
        name: templateName || 'Imported Template',
        description: specs.extractionNotes?.join('. ') || null,
        file_path: filePath || 'preset',
        specs: JSON.parse(JSON.stringify(specs)),
        width_inches: convertToInches(specs.width, specs.unit),
        height_inches: convertToInches(specs.height, specs.unit),
        bleed_inches: convertToInches(specs.bleed, specs.unit),
        safe_zone_inches: convertToInches(specs.safeZone, specs.unit),
        resolution_dpi: specs.resolution,
        color_mode: specs.colorMode,
        has_die_lines: specs.dieLine?.detected || false,
        has_fold_lines: (specs.foldLines?.positions?.length || 0) > 0,
        has_perforation: (specs.perforationLines?.positions?.length || 0) > 0,
        source_vendor: sourceVendor || null,
        asset_type: assetType || null,
      };

      const { data: savedTemplate, error: saveError } = await supabase
        .from('print_templates')
        .insert([templateData])
        .select()
        .single();

      if (saveError) throw saveError;

      // Convert to PrintTemplate type
      const template: PrintTemplate = {
        id: savedTemplate.id,
        userId: savedTemplate.user_id,
        projectId: savedTemplate.project_id,
        name: savedTemplate.name,
        description: savedTemplate.description,
        filePath: savedTemplate.file_path,
        specs: savedTemplate.specs as unknown as PrintTemplateSpecs,
        widthInches: Number(savedTemplate.width_inches),
        heightInches: Number(savedTemplate.height_inches),
        bleedInches: Number(savedTemplate.bleed_inches),
        safeZoneInches: Number(savedTemplate.safe_zone_inches),
        resolutionDpi: savedTemplate.resolution_dpi || 300,
        colorMode: savedTemplate.color_mode || 'CMYK',
        hasDieLines: savedTemplate.has_die_lines || false,
        hasFoldLines: savedTemplate.has_fold_lines || false,
        hasPerforation: savedTemplate.has_perforation || false,
        sourceVendor: savedTemplate.source_vendor,
        assetType: savedTemplate.asset_type,
        isFavorite: savedTemplate.is_favorite || false,
        createdAt: savedTemplate.created_at,
        updatedAt: savedTemplate.updated_at,
      };

      onTemplateImported(template);
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save template');
      setStep('preview');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSpecChange = (field: keyof PrintTemplateSpecs, value: any) => {
    if (!specs) return;
    setSpecs({ ...specs, [field]: value });
  };

  const resetModal = () => {
    setStep('upload');
    setFile(null);
    setFilePreview(null);
    setSpecs(null);
    setTemplateName('');
    setSourceVendor('');
    setError(null);
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
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Import Print Template</h2>
                <p className="text-xs text-muted-foreground">Upload a vendor template or use a preset</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Step: Upload */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Drag & Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  file ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                
                {file ? (
                  <div className="space-y-3">
                    {filePreview && (
                      <div className="w-32 h-32 mx-auto rounded-lg bg-muted/30 border overflow-hidden">
                        <img src={filePreview} alt="Template preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={() => { setFile(null); setFilePreview(null); }}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">Drop your template file here</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
                    >
                      Select File
                    </button>
                    <p className="text-xs text-muted-foreground">Supports PDF and image files</p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Extract Button */}
              {file && (
                <button
                  onClick={handleExtractSpecs}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Extract Specifications with AI
                </button>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border"></div>
                <span className="text-xs text-muted-foreground">or use a vendor preset</span>
                <div className="flex-1 h-px bg-border"></div>
              </div>

              {/* Vendor Presets */}
              <div className="grid grid-cols-2 gap-3">
                {VENDOR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm text-foreground">{preset.vendor}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{preset.productName}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {preset.specs.width}" × {preset.specs.height}" • {preset.specs.resolution} DPI
                    </p>
                  </button>
                ))}
              </div>
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
                <h3 className="font-medium text-foreground">Analyzing Template</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Extracting dimensions, bleed, safe zones, and special features...
                </p>
              </div>
            </div>
          )}

          {/* Step: Preview & Adjust */}
          {(step === 'preview' || step === 'adjust') && specs && (
            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <label className="text-sm font-medium text-foreground">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-secondary/30 border border-border rounded-lg text-foreground"
                  placeholder="My Print Template"
                />
              </div>

              {/* Confidence Score */}
              {specs.confidenceScore !== undefined && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                  specs.confidenceScore >= 70 ? 'bg-emerald-500/10 text-emerald-600' :
                  specs.confidenceScore >= 40 ? 'bg-amber-500/10 text-amber-600' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  {specs.confidenceScore >= 70 ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  AI Confidence: {specs.confidenceScore}% - 
                  {specs.confidenceScore >= 70 ? ' High confidence extraction' :
                   specs.confidenceScore >= 40 ? ' Please verify measurements' :
                   ' Manual adjustment recommended'}
                </div>
              )}

              {/* Visual Preview with Overlay */}
              <div className="grid grid-cols-2 gap-6">
                {/* Template Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Template Preview</h4>
                  <div className="relative aspect-[3/4] bg-[repeating-conic-gradient(#80808020_0%_25%,transparent_0%_50%)] bg-[length:12px_12px] rounded-lg border overflow-hidden">
                    {filePreview && (
                      <img src={filePreview} alt="Template" className="w-full h-full object-contain" />
                    )}
                    
                    {/* Overlay zones */}
                    <div className="absolute inset-0 pointer-events-none" style={{ opacity: overlayOpacity }}>
                      {/* Bleed area */}
                      {showBleed && (
                        <div 
                          className="absolute border-4 border-cyan-400"
                          style={{
                            inset: 0,
                          }}
                        />
                      )}
                      {/* Safe zone */}
                      {showSafeZone && (
                        <div 
                          className="absolute border-2 border-dashed border-fuchsia-400"
                          style={{
                            inset: `${((specs.bleed + specs.safeZone) / specs.height) * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Overlay toggles */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowBleed(!showBleed)}
                      className={`flex-1 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                        showBleed ? 'bg-cyan-500/20 text-cyan-600' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {showBleed ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Bleed
                    </button>
                    <button
                      onClick={() => setShowSafeZone(!showSafeZone)}
                      className={`flex-1 py-1.5 text-xs rounded flex items-center justify-center gap-1 ${
                        showSafeZone ? 'bg-fuchsia-500/20 text-fuchsia-600' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {showSafeZone ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      Safe
                    </button>
                  </div>
                </div>

                {/* Spec Editor */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-foreground">Specifications</h4>
                  
                  {/* Dimensions */}
                  <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Ruler className="w-3.5 h-3.5" />
                      Dimensions
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Width</label>
                        <div className="flex">
                          <input
                            type="number"
                            step="0.125"
                            value={specs.width}
                            onChange={(e) => handleSpecChange('width', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 bg-background border border-border rounded-l text-sm"
                          />
                          <span className="px-2 py-1 bg-muted border border-l-0 border-border rounded-r text-xs text-muted-foreground">
                            {specs.unit}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Height</label>
                        <div className="flex">
                          <input
                            type="number"
                            step="0.125"
                            value={specs.height}
                            onChange={(e) => handleSpecChange('height', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 bg-background border border-border rounded-l text-sm"
                          />
                          <span className="px-2 py-1 bg-muted border border-l-0 border-border rounded-r text-xs text-muted-foreground">
                            {specs.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bleed & Safe Zone */}
                  <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Scissors className="w-3.5 h-3.5" />
                      Bleed & Safe Zone
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                          Bleed
                        </label>
                        <input
                          type="number"
                          step="0.0625"
                          value={specs.bleed}
                          onChange={(e) => handleSpecChange('bleed', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <span className="w-2 h-2 bg-fuchsia-400 rounded-full"></span>
                          Safe Zone
                        </label>
                        <input
                          type="number"
                          step="0.0625"
                          value={specs.safeZone}
                          onChange={(e) => handleSpecChange('safeZone', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Resolution & Color */}
                  <div className="p-3 bg-secondary/30 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Palette className="w-3.5 h-3.5" />
                      Output Settings
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-muted-foreground">Resolution (DPI)</label>
                        <input
                          type="number"
                          value={specs.resolution}
                          onChange={(e) => handleSpecChange('resolution', parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground">Color Mode</label>
                        <select
                          value={specs.colorMode}
                          onChange={(e) => handleSpecChange('colorMode', e.target.value)}
                          className="w-full px-2 py-1 bg-background border border-border rounded text-sm"
                        >
                          <option value="CMYK">CMYK</option>
                          <option value="RGB">RGB</option>
                          <option value="Grayscale">Grayscale</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Special Features */}
                  <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Layers className="w-3.5 h-3.5" />
                      Detected Features
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specs.dieLine?.detected && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full">
                          Die Lines
                        </span>
                      )}
                      {specs.foldLines && specs.foldLines.positions?.length > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full">
                          Fold Lines ({specs.foldLines.positions.length})
                        </span>
                      )}
                      {specs.perforationLines && specs.perforationLines.positions?.length > 0 && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] rounded-full">
                          Perforations
                        </span>
                      )}
                      {!specs.dieLine?.detected && 
                       !(specs.foldLines?.positions?.length) && 
                       !(specs.perforationLines?.positions?.length) && (
                        <span className="text-[10px] text-muted-foreground">
                          No special features detected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extraction Notes */}
                  {specs.extractionNotes && specs.extractionNotes.length > 0 && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-xs font-medium text-amber-600 mb-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Notes
                      </div>
                      <ul className="text-[10px] text-amber-600 space-y-0.5">
                        {specs.extractionNotes.map((note, idx) => (
                          <li key={idx}>• {note}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetModal}
                  className="flex-1 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Start Over
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save to Library
                </button>
              </div>
            </div>
          )}

          {/* Step: Saving */}
          {step === 'saving' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Saving template to library...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateImportModal;
