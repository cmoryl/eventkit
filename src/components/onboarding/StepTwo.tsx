import React, { useState, useRef } from 'react';
import { EventDetails } from '../../types';
import { Upload, Image, Palette, Sparkles, X, MapPin, Building2 } from 'lucide-react';

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
  { id: 'modern', label: 'Modern & Minimal', description: 'Clean lines, white space, geometric shapes' },
  { id: 'bold', label: 'Bold & Vibrant', description: 'High contrast, saturated colors, dynamic layouts' },
  { id: 'elegant', label: 'Elegant & Luxurious', description: 'Gold accents, serif fonts, refined details' },
  { id: 'tech', label: 'Tech & Futuristic', description: 'Gradients, neon accents, digital aesthetics' },
  { id: 'organic', label: 'Organic & Natural', description: 'Earth tones, flowing shapes, sustainable feel' },
  { id: 'playful', label: 'Playful & Creative', description: 'Bright colors, fun patterns, hand-drawn elements' },
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
    
    // Update style description based on selected presets
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
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Define Your Style</h2>
        <p className="text-sm text-muted-foreground">Help AI understand your brand's visual language</p>
      </div>

      {/* Style Presets */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Quick Style Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => togglePreset(preset.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                selectedPresets.has(preset.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <span className="text-sm font-medium text-foreground">{preset.label}</span>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Image Uploads Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Vibe Image */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            Vibe Reference Image
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
            <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-secondary/20">
              <img src={vibePreview} alt="Vibe reference" className="w-full h-full object-cover" />
              <button
                onClick={clearVibeImage}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="vibe-upload"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/20 aspect-video"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center">
                Upload an image that captures your desired aesthetic
              </span>
            </label>
          )}
        </div>

        {/* Master Pattern */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
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
            <div className="relative rounded-xl overflow-hidden border border-border aspect-video bg-secondary/20">
              <img src={patternPreview} alt="Master pattern" className="w-full h-full object-cover" />
              <button
                onClick={clearPattern}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="pattern-upload"
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors bg-secondary/20 aspect-video"
            >
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground text-center">
                Upload a pattern to use across assets
              </span>
            </label>
          )}
        </div>
      </div>

      {/* Venue Intelligence hint */}
      {eventDetails.location && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">Venue Intelligence Enabled</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              AI will research "{eventDetails.location}" to inform floor plans and location-specific designs.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-primary">
            <MapPin className="w-3 h-3" />
            Active
          </div>
        </div>
      )}

      {/* Custom Style Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Additional Style Notes
        </label>
        <textarea
          value={styleDescription}
          onChange={e => setStyleDescription(e.target.value)}
          placeholder="e.g., Use blue and silver tones, avoid red, include subtle geometric patterns, maintain professional corporate feel..."
          rows={3}
          className="input-field resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Be specific about colors, patterns, typography preferences, and any elements to avoid
        </p>
      </div>

      {/* AI Safety Notes */}
      <div className="p-3 rounded-lg bg-secondary/30 border border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">AI Safety:</span> Text won't overlap logos • Clear space maintained • Brand colors prioritized • Print specifications enforced
        </p>
      </div>
    </div>
  );
};

export default StepTwo;
