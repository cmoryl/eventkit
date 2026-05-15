import React, { useState } from 'react';
import type { GeneratedAsset, PdfExportOptions, ColorInfo } from '../../types';
import { AssetType } from '../../types';
import { getAssetConfig } from '../../config/assetConfig';
import { generatePrintReadyPdf, sanitizeFileName, printDimensionsMap } from '../../utils';
import {
  Download,
  FileImage,
  FileText,
  Printer,
  X,
  Check,
  Loader2,
  Globe,
  Code,
  Upload,
} from 'lucide-react';
import { pushAssetsToBrandHub } from '@/services/pushToBrandHub';
import { toast } from 'sonner';

interface AssetDownloadModalProps {
  asset: GeneratedAsset;
  eventName: string;
  onClose: () => void;
  brandId?: string;
}

const AssetDownloadModal: React.FC<AssetDownloadModalProps> = ({ asset, eventName, onClose, brandId }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  
  const config = getAssetConfig(asset.type);
  const isPrintable = config?.printSpec || printDimensionsMap[asset.type];
  const isImage = typeof asset.content === 'string' && asset.content.startsWith('data:image');
  const isText = typeof asset.content === 'string' && !asset.content.startsWith('data:');
  const isArray = Array.isArray(asset.content);

  const handleDownloadPng = () => {
    if (!isImage) return;
    const link = document.createElement('a');
    link.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(asset.title)}.png`;
    link.href = asset.content as string;
    link.click();
    setExportSuccess('PNG');
    setTimeout(() => setExportSuccess(null), 2000);
  };

  const handleDownloadJpg = () => {
    if (!isImage) return;
    // Convert to JPG
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(asset.title)}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.click();
        setExportSuccess('JPG');
        setTimeout(() => setExportSuccess(null), 2000);
      }
    };
    img.src = asset.content as string;
  };

  const handleDownloadWebp = () => {
    if (!isImage) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(asset.title)}.webp`;
        link.href = canvas.toDataURL('image/webp', 0.92);
        link.click();
        setExportSuccess('WEBP');
        setTimeout(() => setExportSuccess(null), 2000);
      }
    };
    img.src = asset.content as string;
  };

  const handleDownloadPdf = async () => {
    if (!isImage || !isPrintable) return;
    setIsExporting(true);
    try {
      await generatePrintReadyPdf(
        asset.content as string,
        asset.type,
        asset.title,
        eventName,
        { paperSize: 'custom', bleed: 0.125, showTrimMarks: true }
      );
      setExportSuccess('PDF');
      setTimeout(() => setExportSuccess(null), 2000);
    } catch (e) {
      console.error('PDF export failed:', e);
      toast.error('PDF export failed. Try downloading as PNG instead.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadText = () => {
    let content = '';
    if (isText) {
      content = asset.content as string;
    } else if (isArray) {
      const arr = asset.content as (string | ColorInfo)[];
      content = arr.map((item, i) => {
        if (typeof item === 'string') return `${i + 1}. ${item}`;
        const c = item as ColorInfo;
        return `${c.name}: ${c.hex} | ${c.rgb} | ${c.cmyk} | ${c.pantone}`;
      }).join('\n');
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(asset.title)}.txt`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess('TXT');
    setTimeout(() => setExportSuccess(null), 2000);
  };

  const handleDownloadCSS = () => {
    if (asset.type !== AssetType.Palette || !isArray) return;
    const colors = asset.content as ColorInfo[];
    const cssVars = colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n');
    const tailwindColors = colors.map((c, i) => `  '${c.name.toLowerCase().replace(/\s+/g, '-')}': '${c.hex}',`).join('\n');
    
    const css = `:root {
${cssVars}
}

/* Tailwind Config */
/*
colors: {
${tailwindColors}
}
*/`;
    
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${sanitizeFileName(eventName)}_palette.css`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess('CSS');
    setTimeout(() => setExportSuccess(null), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!isText) return;
    const blob = new Blob([asset.content as string], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${sanitizeFileName(eventName)}_${sanitizeFileName(asset.title)}.md`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setExportSuccess('MD');
    setTimeout(() => setExportSuccess(null), 2000);
  };

  const isPalette = asset.type === AssetType.Palette;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Download Asset</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{asset.title}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Download Options */}
        <div className="p-5 space-y-3">
          {/* Image formats */}
          {isImage && (
            <>
              <button
                onClick={handleDownloadPng}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FileImage className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">PNG Image</p>
                  <p className="text-xs text-muted-foreground">Lossless, transparent background</p>
                </div>
                {exportSuccess === 'PNG' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </button>

              <button
                onClick={handleDownloadJpg}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <FileImage className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">JPG Image</p>
                  <p className="text-xs text-muted-foreground">Compressed, smaller file size</p>
                </div>
                {exportSuccess === 'JPG' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                )}
              </button>

              <button
                onClick={handleDownloadWebp}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <Globe className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">WebP Image</p>
                  <p className="text-xs text-muted-foreground">Modern format, best compression</p>
                </div>
                {exportSuccess === 'WEBP' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                )}
              </button>

              {isPrintable && (
                <button
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                    <Printer className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Print-Ready PDF</p>
                    <p className="text-xs text-muted-foreground">
                      {config?.printSpec ? (
                        `${config.printSpec.widthInches}" × ${config.printSpec.heightInches}" with bleed & trim marks`
                      ) : (
                        'With bleed & trim marks'
                      )}
                    </p>
                  </div>
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : exportSuccess === 'PDF' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-red-500 transition-colors" />
                  )}
                </button>
              )}
            </>
          )}

          {/* Text formats */}
          {(isText || isArray) && (
            <>
              <button
                onClick={handleDownloadText}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">Plain Text</p>
                  <p className="text-xs text-muted-foreground">Simple .txt file</p>
                </div>
                {exportSuccess === 'TXT' ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                )}
              </button>

              {isText && (
                <button
                  onClick={handleDownloadMarkdown}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <FileText className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">Markdown</p>
                    <p className="text-xs text-muted-foreground">Formatted .md file</p>
                  </div>
                  {exportSuccess === 'MD' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                  )}
                </button>
              )}

              {isPalette && (
                <button
                  onClick={handleDownloadCSS}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Code className="w-5 h-5 text-cyan-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">CSS Variables</p>
                    <p className="text-xs text-muted-foreground">Ready for web development</p>
                  </div>
                  {exportSuccess === 'CSS' ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-cyan-500 transition-colors" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Push to BrandHub */}
        {brandId && isImage && (
          <div className="px-5 pb-3">
            <button
              onClick={async () => {
                setIsPushing(true);
                try {
                  await pushAssetsToBrandHub(brandId, [{
                    imageUrl: asset.content as string,
                    assetType: asset.type,
                    title: asset.title,
                  }]);
                } finally {
                  setIsPushing(false);
                }
              }}
              disabled={isPushing}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border border-border bg-muted/30 hover:bg-accent/50 transition-all text-sm font-medium disabled:opacity-50"
            >
              {isPushing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Push to BrandHub
            </button>
          </div>
        )}

        {/* Footer with specs */}
        {config?.printSpec && (
          <div className="px-5 pb-5">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Print Specs:</span>{' '}
                {config.printSpec.widthInches}" × {config.printSpec.heightInches}" @ {config.printSpec.dpi}dpi, 
                {config.printSpec.bleedInches}" bleed, {config.printSpec.colorMode}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetDownloadModal;
