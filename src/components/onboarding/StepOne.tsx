import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import type { EventDetails, LogoAsset } from '../../types';
import EventTypeSelector from './EventTypeSelector';
import { Users, DollarSign, Hash, Shirt, Plus, X, Upload, ChevronRight, Calendar, MapPin, Globe, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepOneProps {
  eventDetails: EventDetails;
  setEventDetails: React.Dispatch<React.SetStateAction<EventDetails>>;
  logos: LogoAsset[];
  setLogos: React.Dispatch<React.SetStateAction<LogoAsset[]>>;
}

const StepOne: React.FC<StepOneProps> = ({ eventDetails, setEventDetails, logos, setLogos }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setLogos(prev => [...prev, { id: uuidv4(), file, url, name: file.name }]);
    });
  };

  const removeLogo = (id: string) => {
    setLogos(prev => {
      const logo = prev.find(l => l.id === id);
      if (logo) URL.revokeObjectURL(logo.url);
      return prev.filter(l => l.id !== id);
    });
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >

      {/* Event Name - Hero Field */}
      <motion.div 
        className="relative group"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="relative">
          <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            Event Name
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              REQUIRED
            </span>
          </label>
          <input
            type="text"
            name="name"
            value={eventDetails.name}
            onChange={handleChange}
            placeholder="e.g., Tech Summit 2025"
            className="w-full px-5 py-4 rounded-xl border border-border bg-card text-lg font-medium placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            autoFocus
          />
        </div>
      </motion.div>

      {/* Event Type Selector */}
      <motion.div 
        className="pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <EventTypeSelector
          selectedType={eventDetails.eventType}
          onSelect={(type) => setEventDetails(prev => ({ ...prev, eventType: type }))}
        />
      </motion.div>

      {/* Logo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-violet-500" />
          Event Logo
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </label>
        
        <AnimatePresence mode="wait">
          {logos.length > 0 ? (
            <motion.div 
              className="flex flex-wrap gap-3 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {logos.map((logo, index) => (
                <motion.div 
                  key={logo.id} 
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                >
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-secondary to-muted border border-border overflow-hidden flex items-center justify-center shadow-lg">
                    <img src={logo.url} alt={logo.name} className="max-w-full max-h-full object-contain p-2" />
                  </div>
                  <motion.button
                    onClick={() => removeLogo(logo.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-border hover:border-violet-500/50 hover:bg-violet-500/5 flex flex-col items-center justify-center text-muted-foreground hover:text-violet-500 transition-all group"
                whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Plus className="w-6 h-6" />
                </motion.div>
                <span className="text-xs mt-1">Add more</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-12 rounded-2xl border-2 border-dashed border-border hover:border-violet-500/50 flex flex-col items-center justify-center gap-4 text-muted-foreground hover:text-foreground transition-all group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ 
                scale: 1.02, 
                borderColor: 'rgba(139, 92, 246, 0.5)',
                background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.05), rgba(168, 85, 247, 0.05))'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Upload className="w-8 h-8 text-violet-500" />
              </motion.div>
              <div className="text-center">
                <span className="block text-sm font-semibold">Upload your logo</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, SVG • Drag & drop or click</span>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleLogoUpload}
          className="hidden"
        />
      </motion.div>

      {/* Optional Details - Collapsible */}
      <motion.details 
        className="group pt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <summary className="flex items-center gap-3 text-sm font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors py-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center group-open:from-violet-500/10 group-open:to-purple-500/10 transition-colors">
            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90 group-open:text-violet-500" />
          </div>
          <span className="group-open:text-foreground">Add more details for better results</span>
          <div className="flex-1 h-px bg-border" />
        </summary>
        
        <motion.div 
          className="mt-6 space-y-5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Description</label>
            <textarea
              name="description"
              value={eventDetails.description}
              onChange={handleChange}
              placeholder="A brief description of your event, its purpose, and target audience..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all resize-none"
            />
          </div>

          {/* Date & Location Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date
              </label>
              <input
                type="date"
                name="date"
                value={eventDetails.date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={eventDetails.location}
                onChange={handleChange}
                placeholder="City, Venue"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Website & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                Website
              </label>
              <input
                type="url"
                name="website"
                value={eventDetails.website}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                Email
              </label>
              <input
                type="email"
                name="email"
                value={eventDetails.email}
                onChange={handleChange}
                placeholder="contact@event.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          {/* Event-Specific Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Expected Attendees
              </label>
              <input
                type="number"
                name="expectedAttendees"
                value={eventDetails.expectedAttendees || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, expectedAttendees: parseInt(e.target.value) || undefined }))}
                placeholder="250"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={eventDetails.budget || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, budget: parseFloat(e.target.value) || undefined }))}
                placeholder="50000"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                Event Hashtag
              </label>
              <input
                type="text"
                name="hashtag"
                value={eventDetails.hashtag || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, hashtag: e.target.value }))}
                placeholder="#TechSummit2025"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <Shirt className="w-4 h-4 text-muted-foreground" />
                Dress Code
              </label>
              <input
                type="text"
                name="dresscode"
                value={eventDetails.dresscode || ''}
                onChange={(e) => setEventDetails(prev => ({ ...prev, dresscode: e.target.value }))}
                placeholder="Business Casual"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 backdrop-blur-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition-all"
              />
            </div>
          </div>
        </motion.div>
      </motion.details>
    </motion.div>
  );
};

export default StepOne;
