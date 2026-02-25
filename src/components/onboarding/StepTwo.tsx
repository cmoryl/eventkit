import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventDetails, VenueVideoAnalysis } from '../../types';
import { Upload, Image, Palette, Sparkles, X, MapPin, Building2, Check, Camera, Video, Ruler, Eye, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import VenueVideoUploader from '../VenueVideoUploader';
import { VenueAnalysis } from '@/services/venueVideoService';

interface StepTwoProps {
  styleDescription: string;
  setStyleDescription: React.Dispatch<React.SetStateAction<string>>;
  vibeImages: File[];
  setVibeImages: React.Dispatch<React.SetStateAction<File[]>>;
  masterPatterns: File[];
  setMasterPatterns: React.Dispatch<React.SetStateAction<File[]>>;
  venueImage: File | null;
  setVenueImage: React.Dispatch<React.SetStateAction<File | null>>;
  venueVideoAnalysis: VenueVideoAnalysis | null;
  setVenueVideoAnalysis: React.Dispatch<React.SetStateAction<VenueVideoAnalysis | null>>;
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
  vibeImages,
  setVibeImages,
  masterPatterns,
  setMasterPatterns,
  venueImage,
  setVenueImage,
  venueVideoAnalysis,
  setVenueVideoAnalysis,
  eventDetails,
}) => {
  const [vibePreviews, setVibePreviews] = useState<string[]>([]);
  const [patternPreviews, setPatternPreviews] = useState<string[]>([]);
  const [venuePreview, setVenuePreview] = useState<string | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const vibeInputRef = useRef<HTMLInputElement>(null);
  const patternInputRef = useRef<HTMLInputElement>(null);
  const venueInputRef = useRef<HTMLInputElement>(null);

  const handleVideoAnalysisComplete = useCallback((analysis: VenueAnalysis) => {
    setVenueVideoAnalysis(analysis as VenueVideoAnalysis);
    if (analysis.keyFrames.length > 0 && analysis.keyFrames[0].imageData) {
      setVenuePreview(analysis.keyFrames[0].imageData);
    }
  }, [setVenueVideoAnalysis]);

  const handleVideoFrameSelect = useCallback((frameData: string) => {
    setVenuePreview(frameData);
    fetch(frameData)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'venue-frame.jpg', { type: 'image/jpeg' });
        setVenueImage(file);
      });
  }, [setVenueImage]);

  const handleVibeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setVibeImages(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setVibePreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    
    // Reset input so same files can be re-selected
    if (vibeInputRef.current) vibeInputRef.current.value = '';
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
  };

  const handlePatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    setMasterPatterns(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => setPatternPreviews(prev => [...prev, reader.result as string]);
      reader.readAsDataURL(file);
    });
    
    if (patternInputRef.current) patternInputRef.current.value = '';
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

  const removeVibeImage = (index: number) => {
    setVibeImages(prev => prev.filter((_, i) => i !== index));
    setVibePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removePattern = (index: number) => {
    setMasterPatterns(prev => prev.filter((_, i) => i !== index));
    setPatternPreviews(prev => prev.filter((_, i) => i !== index));
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
        {/* Vibe / Background Images - MULTI UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Image className="w-4 h-4 text-pink-500" />
            Background / Vibe References
            <span className="text-xs text-muted-foreground font-normal">(multiple allowed)</span>
          </label>
          <input
            ref={vibeInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleVibeUpload}
            className="hidden"
            id="vibe-upload"
          />
          
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-2">
            {vibePreviews.map((preview, index) => (
              <motion.div 
                key={index}
                className="relative rounded-xl overflow-hidden border border-border aspect-video bg-secondary/20 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img 
                  src={preview} 
                  alt={`Vibe reference ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <motion.button
                  onClick={() => removeVibeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
            
            {/* Add More Button */}
            <motion.label
              htmlFor="vibe-upload"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border cursor-pointer transition-colors group",
                vibePreviews.length === 0 ? "aspect-video col-span-2 p-6" : "aspect-video"
              )}
              whileHover={{ 
                borderColor: 'rgba(236, 72, 153, 0.5)',
                background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), rgba(244, 63, 94, 0.05))'
              }}
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {vibePreviews.length === 0 ? (
                  <Upload className="w-5 h-5 text-pink-500" />
                ) : (
                  <Plus className="w-5 h-5 text-pink-500" />
                )}
              </motion.div>
              <span className="text-xs font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                {vibePreviews.length === 0 ? 'Upload aesthetic references' : 'Add more'}
              </span>
            </motion.label>
          </div>
        </div>

        {/* Master Patterns - MULTI UPLOAD */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4 text-pink-500" />
            Master Patterns
            <span className="text-xs text-muted-foreground font-normal">(multiple allowed)</span>
          </label>
          <input
            ref={patternInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handlePatternUpload}
            className="hidden"
            id="pattern-upload"
          />
          
          {/* Pattern Grid */}
          <div className="grid grid-cols-2 gap-2">
            {patternPreviews.map((preview, index) => (
              <motion.div 
                key={index}
                className="relative rounded-xl overflow-hidden border border-border aspect-video bg-secondary/20 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img 
                  src={preview} 
                  alt={`Pattern ${index + 1}`} 
                  className="w-full h-full object-cover"
                />
                <motion.button
                  onClick={() => removePattern(index)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </motion.div>
            ))}
            
            {/* Add More Button */}
            <motion.label
              htmlFor="pattern-upload"
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border cursor-pointer transition-colors group",
                patternPreviews.length === 0 ? "aspect-video col-span-2 p-6" : "aspect-video"
              )}
              whileHover={{ 
                borderColor: 'rgba(236, 72, 153, 0.5)',
                background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.05), rgba(244, 63, 94, 0.05))'
              }}
            >
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center mb-2"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {patternPreviews.length === 0 ? (
                  <Upload className="w-5 h-5 text-pink-500" />
                ) : (
                  <Plus className="w-5 h-5 text-pink-500" />
                )}
              </motion.div>
              <span className="text-xs font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                {patternPreviews.length === 0 ? 'Upload patterns to use' : 'Add more'}
              </span>
            </motion.label>
          </div>
        </div>
      </motion.div>

      {/* Venue Photo Upload - For Realistic Compositing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Camera className="w-4 h-4 text-emerald-500" />
          Venue Photo
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          <motion.span 
            className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-emerald-500 to-green-500 text-white"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            PHOTOREALISTIC
          </motion.span>
        </label>
        <p className="text-xs text-muted-foreground mb-3">
          Upload a photo of your actual venue and AI will composite your branded assets directly into the space
        </p>
        <input
          ref={venueInputRef}
          type="file"
          accept="image/*"
          onChange={handleVenueUpload}
          className="hidden"
          id="venue-upload"
        />
        <AnimatePresence mode="wait">
          {venuePreview ? (
            <motion.div 
              className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/30 aspect-video bg-secondary/20 group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <motion.img 
                src={venuePreview} 
                alt="Venue photo" 
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.button
                onClick={clearVenueImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-foreground shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
              <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                <motion.span 
                  className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  ✓ Venue photo loaded
                </motion.span>
              </div>
            </motion.div>
          ) : (
            <motion.div className="space-y-3">
              <motion.label
                htmlFor="venue-upload"
                className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-emerald-500/30 cursor-pointer transition-colors aspect-video group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileHover={{ 
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                  background: 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))'
                }}
              >
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center mb-3"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Camera className="w-7 h-7 text-emerald-500" />
                </motion.div>
                <span className="text-sm font-medium text-muted-foreground text-center group-hover:text-foreground transition-colors">
                  Upload venue photo for compositing
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  AI will place your branded assets into this space
                </span>
              </motion.label>
              
              {/* Video Analysis Toggle */}
              <motion.button
                type="button"
                onClick={() => setShowVideoUploader(!showVideoUploader)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <Video className="w-4 h-4" />
                {showVideoUploader ? 'Hide Video Analysis' : 'Or upload a venue walkthrough video'}
                {showVideoUploader ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </motion.button>
              
              <AnimatePresence>
                {showVideoUploader && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <VenueVideoUploader 
                      eventName={eventDetails.name}
                      eventDescription={eventDetails.description}
                      onAnalysisComplete={handleVideoAnalysisComplete}
                      onFrameSelect={handleVideoFrameSelect}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Venue Video Analysis Results */}
        {venueVideoAnalysis && (
          <motion.div 
            className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                AI Venue Analysis Complete
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{venueVideoAnalysis.overallAssessment?.venueType || 'Analyzed'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{venueVideoAnalysis.areas?.length || 0} areas mapped</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{venueVideoAnalysis.assetRecommendations?.length || 0} recommendations</span>
              </div>
              <div className="flex items-center gap-1">
                <Camera className="w-3 h-3" />
                <span>{venueVideoAnalysis.keyFrames?.length || 0} key frames</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Style Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-500" />
          Custom Style Notes
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </label>
        <textarea
          value={styleDescription}
          onChange={(e) => setStyleDescription(e.target.value)}
          placeholder="Describe any additional style preferences... e.g., 'Art deco with gold foil accents, inspired by 1920s glamour'"
          className="w-full px-4 py-3 rounded-2xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition-all min-h-[100px]"
          rows={3}
        />
      </motion.div>
    </motion.div>
  );
};

export default StepTwo;
