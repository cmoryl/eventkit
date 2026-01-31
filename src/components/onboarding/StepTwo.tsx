import React, { useState, useRef } from 'react';
import { EventDetails } from '../../types';
import { Upload, Image, Palette, Sparkles, X, MapPin, Building2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepTwoProps {
  styleDescription: string;
  setStyleDescription: React.Dispatch<React.SetStateAction<string>>;
  vibeImage: File | null;
  setVibeImage: React.Dispatch<React.SetStateAction<File | null>>;
  masterPattern: File | null;
  setMasterPattern: React.Dispatch<React.SetStateAction<File | null>>;
  eventDetails: EventDetails;
}

const STYLE_PRESETS = [
  { id: 'modern', label: 'Modern & Minimal', description: 'Clean lines, white space, geometric shapes', gradient: 'from-slate-500 to-zinc-600', icon: '◯' },
  { id: 'bold', label: 'Bold & Vibrant', description: 'High contrast, saturated colors, dynamic layouts', gradient: 'from-orange-500 to-red-500', icon: '◆' },
  { id: 'elegant', label: 'Elegant & Luxurious', description: 'Gold accents, serif fonts, refined details', gradient: 'from-amber-500 to-yellow-600', icon: '✧' },
  { id: 'tech', label: 'Tech & Futuristic', description: 'Gradients, neon accents, digital aesthetics', gradient: 'from-cyan-500 to-blue-500', icon: '⬡' },
  { id: 'organic', label: 'Organic & Natural', description: 'Earth tones, flowing shapes, sustainable feel', gradient: 'from-emerald-500 to-green-600', icon: '◎' },
  { id: 'playful', label: 'Playful & Creative', description: 'Bright colors, fun patterns, hand-drawn elements', gradient: 'from-pink-500 to-rose-500', icon: '★' },
];

const StepTwo: React.FC<StepTwoProps> = ({
  styleDescription,
  setStyleDescription,
  vibeImage,
  setVibeImage,
  masterPattern,
  setMasterPattern,
  eventDetails,
}) => {
  const [vibePreview, setVibePreview] = useState<string | null>(null);
  const [patternPreview, setPatternPreview] = useState<string | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const vibeInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);

  const handleVibeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVibeImage(file);
      const reader = new FileReader();
      reader.onload = () => setVibePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMasterPattern(file);
      const reader = new FileReader();
      reader.onload = () => setPatternPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const togglePreset = (id: string) => {
    const newPresets = new Set(selectedPresets);
    if (newPresets.has(id)) {
      newPresets.delete(id);
    } else {
      newPresets.add(id);
    }
    setSelectedPresets(newPresets);
    
    const descriptions = STYLE_PRESETS
      .filter(p => newPresets.has(p.id))
      .map(p => p.description)
      .join('. ');
    
    if (descriptions) {
      setStyleDescription(prev => {
        const customPart = prev.split(' | Custom: ')[1] || '';
        return descriptions + (customPart ? ` | Custom: ${customPart}` : '');
      });
    }
  };

  const clearVibeImage = () => {
    setVibeImage(null);
    setVibePreview(null);
    if (vibeInputRef.current) vibeInputRef.current.value = '';
  };

  const clearPattern = () => {
    setMasterPattern(null);
    setPatternPreview(null);
    if (patternInputRef.current) patternInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 mb-4">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 animate-pulse" />
          <span className="text-sm font-medium bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Step 2 of 3
          </span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Define Your Style</h2>
        <p className="text-muted-foreground">Help AI understand your brand's visual language</p>
      </div>

      {/* Style Presets */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Quick Style Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedPresets.has(preset.id);
            return (
              <button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                className={cn(
                  "group relative p-4 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden",
                  isSelected
                    ? "border-transparent shadow-lg scale-[1.02]"
                    : "border-border hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Background gradient when selected */}
                {isSelected && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-10",
                    preset.gradient
                  )} />
                )}
                
                {/* Selection indicator */}
                <div className={cn(
                  "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all",
                  isSelected
                    ? `bg-gradient-to-r ${preset.gradient} text-white`
                    : "bg-secondary text-muted-foreground"
                )}>
                  {isSelected && <Check className="w-3 h-3" />}
                </div>

                <div className="relative">
                  {/* Icon */}
                  <span className={cn(
                    "text-2xl mb-2 block transition-transform",
                    isSelected && "scale-110"
                  )}>
                    {preset.icon}
                  </span>
                  
                  <span className={cn(
                    "text-sm font-bold block transition-colors",
                    isSelected 
                      ? `bg-gradient-to-r ${preset.gradient} bg-clip-text text-transparent`
                      : "text-foreground"
                  )}>
                    {preset.label}
                  </span>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Image Uploads Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vibe Image */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Image className="w-4 h-4 text-pink-500" />
            Vibe Reference
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            ref={vibeInputRef}
            type="file"
            accept="image/*"
            onChange={handleVibeUpload}
            className="hidden"
            id="vibe-upload"
          />
          {vibePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-border aspect-video bg-secondary/20 group">
              <img src={vibePreview} alt="Vibe reference" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={clearVibeImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="vibe-upload"
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-pink-500/50 hover:bg-gradient-to-br hover:from-pink-500/5 hover:to-rose-500/5 cursor-pointer transition-all aspect-video group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-pink-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                Upload aesthetic reference
              </span>
            </label>
          )}
        </div>

        {/* Master Pattern */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" />
            Master Pattern
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            ref={patternInputRef}
            type="file"
            accept="image/*"
            onChange={handlePatternUpload}
            className="hidden"
            id="pattern-upload"
          />
          {patternPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-border aspect-video bg-secondary/20 group">
              <img src={patternPreview} alt="Master pattern" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={clearPattern}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-white transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="pattern-upload"
              className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border hover:border-pink-500/50 hover:bg-gradient-to-br hover:from-pink-500/5 hover:to-rose-500/5 cursor-pointer transition-all aspect-video group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 text-pink-500" />
              </div>
              <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                Upload pattern to use
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Venue Intelligence hint */}
      {eventDetails.location && (
        <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                Venue Intelligence
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white">
                  ACTIVE
                </span>
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI will research "<span className="font-medium text-foreground">{eventDetails.location}</span>" to inform floor plans and location-specific designs.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <MapPin className="w-3.5 h-3.5" />
              Ready
            </div>
          </div>
        </div>
      )}

      {/* Custom Style Description */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Additional Style Notes
        </label>
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl opacity-0 group-focus-within:opacity-100 blur transition-opacity duration-300" />
          <textarea
            value={styleDescription}
            onChange={e => setStyleDescription(e.target.value)}
            placeholder="e.g., Use blue and silver tones, avoid red, include subtle geometric patterns, maintain professional corporate feel..."
            rows={3}
            className="relative w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition-all resize-none"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Be specific about colors, patterns, typography preferences, and any elements to avoid
        </p>
      </div>

      {/* AI Safety Notes */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-secondary/50 to-muted/50 border border-border">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">AI Safety Guarantees</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Text won't overlap logos
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Clear space maintained
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Brand colors prioritized
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-500" />
                Print specs enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepTwo;
