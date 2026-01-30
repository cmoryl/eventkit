import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRCodeGenerationParams, ColorInfo } from '../types';
import { 
  X, 
  Download, 
  RefreshCw, 
  Palette, 
  Square, 
  Circle,
  Link,
  Image as ImageIcon
} from 'lucide-react';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (dataUrl: string, params: QRCodeGenerationParams) => void;
  eventDetails: { website?: string; name: string };
  colorPalette: ColorInfo[];
  logoDataUrl?: string;
}

const DOT_STYLES: { value: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

const CORNER_STYLES: { value: QRCodeGenerationParams['cornersSquareType']; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'extra-rounded', label: 'Rounded' },
  { value: 'dot', label: 'Dot' },
];

const QRCodeGeneratorModal: React.FC<QRCodeGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  eventDetails,
  colorPalette,
  logoDataUrl,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  const [params, setParams] = useState<QRCodeGenerationParams>({
    url: eventDetails.website || `https://event.example.com/${eventDetails.name.toLowerCase().replace(/\s/g, '-')}`,
    foregroundColor: colorPalette[0]?.hex || '#000000',
    backgroundColor: '#ffffff',
    margin: 10,
    errorCorrectionLevel: 'M',
    dotsType: 'rounded' as const,
    cornersSquareType: 'extra-rounded',
    cornersDotType: 'dot',
    logoImage: logoDataUrl,
    logoWidth: 60,
    logoHeight: 60,
    logoMargin: 5,
  });

  const [includeLogo, setIncludeLogo] = useState(!!logoDataUrl);

  useEffect(() => {
    if (!isOpen || !qrRef.current) return;

    const qrCode = new QRCodeStyling({
      width: 280,
      height: 280,
      type: 'svg',
      data: params.url,
      margin: params.margin,
      qrOptions: {
        errorCorrectionLevel: params.errorCorrectionLevel,
      },
      dotsOptions: {
        color: params.foregroundColor,
        type: params.dotsType,
      },
      cornersSquareOptions: {
        color: params.foregroundColor,
        type: params.cornersSquareType,
      },
      cornersDotOptions: {
        color: params.foregroundColor,
        type: params.cornersDotType,
      },
      backgroundOptions: {
        color: params.backgroundColor,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: params.logoMargin,
      },
      image: includeLogo && params.logoImage ? params.logoImage : undefined,
    });

    qrRef.current.innerHTML = '';
    qrCode.append(qrRef.current);
    qrCodeInstance.current = qrCode;
  }, [isOpen, params, includeLogo]);

  const handleDownload = async () => {
    if (!qrCodeInstance.current) return;
    
    const blob = await qrCodeInstance.current.getRawData('png');
    if (!blob || !(blob instanceof Blob)) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onGenerate(dataUrl, params);
    };
    reader.readAsDataURL(blob);
  };

  const handleDownloadDirect = async () => {
    if (!qrCodeInstance.current) return;
    await qrCodeInstance.current.download({ 
      name: `${eventDetails.name.replace(/\s/g, '_')}_QR`, 
      extension: 'png' 
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-lg font-semibold text-foreground">QR Code Generator</h2>
            <p className="text-sm text-muted-foreground">Create a customized QR code for your event</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="flex flex-col items-center">
            <div 
              ref={qrRef} 
              className="bg-white rounded-2xl p-4 shadow-lg border border-border"
              style={{ width: 312, height: 312 }}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleDownloadDirect}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Add to Assets
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-5">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-primary" />
                Destination URL
              </label>
              <input
                type="url"
                value={params.url}
                onChange={(e) => setParams({ ...params, url: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Foreground
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={params.foregroundColor}
                    onChange={(e) => setParams({ ...params, foregroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={params.foregroundColor}
                    onChange={(e) => setParams({ ...params, foregroundColor: e.target.value })}
                    className="input-field flex-1 font-mono text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Background
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={params.backgroundColor}
                    onChange={(e) => setParams({ ...params, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                  />
                  <input
                    type="text"
                    value={params.backgroundColor}
                    onChange={(e) => setParams({ ...params, backgroundColor: e.target.value })}
                    className="input-field flex-1 font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Quick colors from palette */}
            {colorPalette.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Brand Colors
                </label>
                <div className="flex gap-2 flex-wrap">
                  {colorPalette.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => setParams({ ...params, foregroundColor: color.hex })}
                      className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                        params.foregroundColor === color.hex ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Dot Style */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Square className="w-4 h-4 text-primary" />
                Dot Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DOT_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setParams({ ...params, dotsType: style.value })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      params.dotsType === style.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Style */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Circle className="w-4 h-4 text-primary" />
                Corner Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CORNER_STYLES.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setParams({ ...params, cornersSquareType: style.value })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      params.cornersSquareType === style.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Toggle */}
            {logoDataUrl && (
              <div>
                <label className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="h-5 w-5 rounded bg-secondary border-border text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <div>
                      <span className="text-foreground font-medium text-sm">Include Logo</span>
                      <p className="text-xs text-muted-foreground">Center your logo in the QR code</p>
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGeneratorModal;
