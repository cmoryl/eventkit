import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventDetails } from '../../types';
import { Upload, Image, Palette, Sparkles, X, MapPin, Building2, Check, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepTwoProps {
  styleDescription: string;
  setStyleDescription: React.Dispatch<React.SetStateAction<string>>;
  vibeImage: File | null;
  setVibeImage: React.Dispatch<React.SetStateAction<File | null>>;
  masterPattern: File | null;
  setMasterPattern: React.Dispatch<React.SetStateAction<File | null>>;
  venueImage: File | null;
  setVenueImage: React.Dispatch<React.SetStateAction<File | null>>;
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
  venueImage,
  setVenueImage,
  eventDetails,
}) => {
  const [vibePreview, setVibePreview] = useState<string | null>(null);
  const [patternPreview, setPatternPreview] = useState<string | null>(null);
  const [venuePreview, setVenuePreview] = useState<string | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const vibeInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);

  const handleVibeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVibeImage(file);
      const reader = new FileReader();
      reader.onload = () => setVibePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVenueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVenueImage(file);
      const reader = new FileReader();
      reader.onload = () => setVenuePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearVenueImage = () => {
    setVenueImage(null);
    setVenuePreview(null);
    if (venueInputRef.current) venueInputRef.current.value = '';
  }

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
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >

      {/* Style Presets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-pink-500" />
          </motion.div>
          Quick Style Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STYLE_PRESETS.map((preset, index) => {
            const isSelected = selectedPresets.has(preset.id);
            return (
              <motion.button
                key={preset.id}
                onClick={() => togglePreset(preset.id)}
                className={cn(
                  "group relative p-4 rounded-2xl border-2 text-left transition-colors overflow-hidden",
                  isSelected
                    ? "border-transparent shadow-lg"
                    : "border-border hover:border-primary/30"
                )}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient when selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      className={cn("absolute inset-0 bg-gradient-to-br", preset.gradient)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>
                
                {/* Selection indicator */}
                <motion.div 
                  className={cn(
                    "absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-colors",
                    isSelected
                      ? `bg-gradient-to-r ${preset.gradient} text-white`
                      : "bg-secondary text-muted-foreground"
                  )}
                  animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="relative">
                  {/* Icon */}
                  <motion.span 
                    className="text-2xl mb-2 block"
                    animate={isSelected ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {preset.icon}
                  </motion.span>
                  
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
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Image Uploads Row */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
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
          <AnimatePresence mode="wait">
            {vibePreview ? (
              <motion.div 
                className="relative rounded-2xl overflow-hidden border border-border aspect-video bg-secondary/20 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.img 
                  src={vibePreview} 
                  alt="Vibe reference" 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <motion.button
                  onClick={clearVibeImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.label
                htmlFor="vibe-upload"
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border cursor-pointer transition-colors aspect-video group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ 
                  borderColor: 'rgba(236, 72, 153, 0.5)',
                  background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), rgba(244, 63, 94, 0.05))'
                }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Upload className="w-6 h-6 text-pink-500" />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                  Upload aesthetic reference
                </span>
              </motion.label>
            )}
          </AnimatePresence>
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
          <AnimatePresence mode="wait">
            {patternPreview ? (
              <motion.div 
                className="relative rounded-2xl overflow-hidden border border-border aspect-video bg-secondary/20 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <motion.img 
                  src={patternPreview} 
                  alt="Master pattern" 
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                />
                <motion.button
                  onClick={clearPattern}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.label
                htmlFor="pattern-upload"
                className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border cursor-pointer transition-colors aspect-video group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ 
                  borderColor: 'rgba(236, 72, 153, 0.5)',
                  background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), rgba(244, 63, 94, 0.05))'
                }}
              >
                <motion.div 
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                >
                  <Upload className="w-6 h-6 text-pink-500" />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                  Upload pattern to use
                </span>
              </motion.label>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Venue Intelligence hint */}
      <AnimatePresence>
        {eventDetails.location && (
          <motion.div 
            className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <motion.div 
              className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative flex items-start gap-3">
              <motion.div 
                className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Building2 className="w-5 h-5" />
              </motion.div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  Venue Intelligence
                  <motion.span 
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ACTIVE
                  </motion.span>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Style Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="block text-sm font-semibold text-foreground mb-2">
          Additional Style Notes
        </label>
        <div className="relative group">
          <motion.div 
            className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl blur transition-opacity duration-300 opacity-0 group-focus-within:opacity-100"
          />
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
      </motion.div>

      {/* AI Safety Notes */}
      <motion.div 
        className="p-4 rounded-2xl bg-gradient-to-r from-secondary/50 to-muted/50 border border-border"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-start gap-3">
          <motion.div 
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center flex-shrink-0"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
          </motion.div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">AI Safety Guarantees</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {[
                "Text won't overlap logos",
                "Clear space maintained",
                "Brand colors prioritized",
                "Print specs enforced"
              ].map((item, index) => (
                <motion.span 
                  key={item}
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Check className="w-3 h-3 text-emerald-500" />
                  {item}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StepTwo;
