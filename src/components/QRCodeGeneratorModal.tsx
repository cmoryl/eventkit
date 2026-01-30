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
  Image as ImageIcon,
  Sparkles,
  Zap,
  Copy,
  Check
} from 'lucide-react';

interface QRCodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (dataUrl: string, params: QRCodeGenerationParams) => void;
  eventDetails: { website?: string; name: string };
  colorPalette: ColorInfo[];
  logoDataUrl?: string;
}

const DOT_STYLES: { value: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'; label: string; icon: string }[] = [
  { value: 'square', label: 'Square', icon: '▪️' },
  { value: 'dots', label: 'Dots', icon: '⚫' },
  { value: 'rounded', label: 'Rounded', icon: '⬤' },
  { value: 'classy', label: 'Classy', icon: '◆' },
  { value: 'classy-rounded', label: 'Soft', icon: '◉' },
  { value: 'extra-rounded', label: 'Bubble', icon: '●' },
];

const CORNER_STYLES: { value: QRCodeGenerationParams['cornersSquareType']; label: string }[] = [
  { value: 'square', label: 'Sharp' },
  { value: 'extra-rounded', label: 'Soft' },
  { value: 'dot', label: 'Round' },
];

interface QRPreset {
  name: string;
  dotsType: QRCodeGenerationParams['dotsType'];
  cornersSquareType: QRCodeGenerationParams['cornersSquareType'];
  cornersDotType: QRCodeGenerationParams['cornersDotType'];
  foregroundColor: string;
  backgroundColor: string;
  gradient?: { type: 'linear' | 'radial'; colors: [string, string]; rotation?: number };
}

const PRESETS: QRPreset[] = [
  { name: 'Classic', dotsType: 'square', cornersSquareType: 'square', cornersDotType: 'square', foregroundColor: '#000000', backgroundColor: '#ffffff' },
  { name: 'Modern', dotsType: 'rounded', cornersSquareType: 'extra-rounded', cornersDotType: 'dot', foregroundColor: '#1a1a2e', backgroundColor: '#ffffff' },
  { name: 'Elegant', dotsType: 'classy', cornersSquareType: 'extra-rounded', cornersDotType: 'dot', foregroundColor: '#2c3e50', backgroundColor: '#ecf0f1' },
  { name: 'Vibrant', dotsType: 'dots', cornersSquareType: 'dot', cornersDotType: 'dot', foregroundColor: '#e74c3c', backgroundColor: '#ffffff' },
  { name: 'Ocean', dotsType: 'extra-rounded', cornersSquareType: 'extra-rounded', cornersDotType: 'dot', foregroundColor: '#0077b6', backgroundColor: '#caf0f8' },
  { name: 'Forest', dotsType: 'classy-rounded', cornersSquareType: 'extra-rounded', cornersDotType: 'dot', foregroundColor: '#2d6a4f', backgroundColor: '#d8f3dc' },
  { name: 'Sunset', dotsType: 'rounded', cornersSquareType: 'extra-rounded', cornersDotType: 'dot', foregroundColor: '#ff6b35', backgroundColor: '#fff3e0' },
  { name: 'Midnight', dotsType: 'dots', cornersSquareType: 'dot', cornersDotType: 'dot', foregroundColor: '#7c3aed', backgroundColor: '#1e1b4b' },
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
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>('Modern');

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

  const handleDownloadDirect = async (format: 'png' | 'svg' = 'png') => {
    if (!qrCodeInstance.current) return;
    await qrCodeInstance.current.download({ 
      name: `${eventDetails.name.replace(/\s/g, '_')}_QR`, 
      extension: format
    });
  };

  const applyPreset = (preset: QRPreset) => {
    setSelectedPreset(preset.name);
    setParams(prev => ({
      ...prev,
      dotsType: preset.dotsType,
      cornersSquareType: preset.cornersSquareType,
      cornersDotType: preset.cornersDotType,
      foregroundColor: preset.foregroundColor,
      backgroundColor: preset.backgroundColor,
    }));
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(params.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">QR Code Generator</h2>
              <p className="text-sm text-muted-foreground">Create a branded QR code for your event</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Preview - Left Column */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <div className="sticky top-24">
              <div 
                ref={qrRef} 
                className="rounded-2xl p-4 shadow-lg border border-border transition-all"
                style={{ 
                  width: 312, 
                  height: 312,
                  backgroundColor: params.backgroundColor
                }}
              />
              
              {/* Download buttons */}
              <div className="flex gap-2 mt-4 w-full">
                <button
                  onClick={() => handleDownloadDirect('png')}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => handleDownloadDirect('svg')}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  SVG
                </button>
              </div>
              <button
                onClick={handleDownload}
                className="w-full mt-2 btn-primary flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Add to Assets
              </button>
            </div>
          </div>

          {/* Controls - Right Column */}
          <div className="lg:col-span-3 space-y-5">
            {/* URL Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Link className="w-4 h-4 text-primary" />
                Destination URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={params.url}
                  onChange={(e) => setParams({ ...params, url: e.target.value })}
                  className="input-field flex-1"
                  placeholder="https://..."
                />
                <button
                  onClick={copyUrl}
                  className="p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl">
              <button
                onClick={() => setActiveTab('presets')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'presets'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Presets
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'custom'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Customize
              </button>
            </div>

            {activeTab === 'presets' && (
              <div className="space-y-4">
                {/* Preset Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                        selectedPreset === preset.name
                          ? 'border-primary ring-2 ring-primary/30'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div 
                        className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center text-2xl"
                        style={{ backgroundColor: preset.backgroundColor }}
                      >
                        <span style={{ color: preset.foregroundColor }}>▣</span>
                      </div>
                      <p className="text-xs font-medium text-foreground text-center truncate">{preset.name}</p>
                    </button>
                  ))}
                </div>

                {/* Brand colors quick apply */}
                {colorPalette.length > 0 && (
                  <div className="p-4 bg-secondary/30 rounded-xl">
                    <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      Apply Brand Colors
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {colorPalette.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setSelectedPreset(null);
                            setParams({ ...params, foregroundColor: color.hex });
                          }}
                          className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                            params.foregroundColor === color.hex ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="space-y-5">
                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Foreground
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={params.foregroundColor}
                        onChange={(e) => {
                          setSelectedPreset(null);
                          setParams({ ...params, foregroundColor: e.target.value });
                        }}
                        className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                      />
                      <input
                        type="text"
                        value={params.foregroundColor}
                        onChange={(e) => {
                          setSelectedPreset(null);
                          setParams({ ...params, foregroundColor: e.target.value });
                        }}
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
                        onChange={(e) => {
                          setSelectedPreset(null);
                          setParams({ ...params, backgroundColor: e.target.value });
                        }}
                        className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                      />
                      <input
                        type="text"
                        value={params.backgroundColor}
                        onChange={(e) => {
                          setSelectedPreset(null);
                          setParams({ ...params, backgroundColor: e.target.value });
                        }}
                        className="input-field flex-1 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

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
                        onClick={() => {
                          setSelectedPreset(null);
                          setParams({ ...params, dotsType: style.value });
                        }}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 justify-center ${
                          params.dotsType === style.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <span>{style.icon}</span>
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
                        onClick={() => {
                          setSelectedPreset(null);
                          setParams({ ...params, cornersSquareType: style.value });
                        }}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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

                {/* Error Correction */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Error Correction Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setParams({ ...params, errorCorrectionLevel: level })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          params.errorCorrectionLevel === level
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {level}
                        <span className="block text-xs opacity-70">
                          {level === 'L' ? '7%' : level === 'M' ? '15%' : level === 'Q' ? '25%' : '30%'}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Higher = more reliable but larger code. Use H if adding logo.</p>
                </div>

                {/* Margin */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Quiet Zone (Margin): {params.margin}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={params.margin}
                    onChange={(e) => setParams({ ...params, margin: parseInt(e.target.value) })}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}

            {/* Logo Toggle - Always visible */}
            {logoDataUrl && (
              <div className="p-4 bg-secondary/30 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeLogo}
                    onChange={(e) => setIncludeLogo(e.target.checked)}
                    className="h-5 w-5 rounded bg-secondary border-border text-primary focus:ring-primary"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border">
                      <img src={logoDataUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
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
