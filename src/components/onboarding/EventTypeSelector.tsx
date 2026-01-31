import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventType } from '../../types';
import {
  Building2,
  Heart,
  Briefcase,
  Music,
  Award,
  Users,
  Lightbulb,
  Mic,
  Trophy,
  HandHeart,
  GraduationCap,
  Rocket,
  UserPlus,
  Medal,
  HelpCircle,
  Check,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventTypeSelectorProps {
  selectedType?: EventType;
  onSelect: (type: EventType) => void;
}

const EVENT_TYPES: { 
  type: EventType; 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  description: string; 
  suggestedAssets: string[];
  gradient: string;
  accentColor: string;
}[] = [
  {
    type: 'conference',
    label: 'Conference',
    icon: Building2,
    description: 'Multi-day professional gathering with keynotes',
    suggestedAssets: ['Name Tags', 'Stage Backdrop', 'Presentation Deck', 'WiFi Signs', 'Room Signage'],
    gradient: 'from-blue-500 to-indigo-600',
    accentColor: 'blue',
  },
  {
    type: 'wedding',
    label: 'Wedding',
    icon: Heart,
    description: 'Celebration of love with ceremony and reception',
    suggestedAssets: ['Invitation Cards', 'Place Cards', 'Table Numbers', 'Menu', 'Thank You Cards'],
    gradient: 'from-rose-400 to-pink-500',
    accentColor: 'rose',
  },
  {
    type: 'corporate',
    label: 'Corporate',
    icon: Briefcase,
    description: 'Company meetings, retreats, or team-building',
    suggestedAssets: ['Banners', 'Name Tags', 'Folders', 'Presentation Deck', 'Swag Bags'],
    gradient: 'from-slate-500 to-zinc-600',
    accentColor: 'slate',
  },
  {
    type: 'festival',
    label: 'Festival',
    icon: Music,
    description: 'Large-scale celebration with multiple stages',
    suggestedAssets: ['Wristbands', 'Stage Backdrops', 'Wayfinding Signs', 'Merchandise'],
    gradient: 'from-orange-500 to-amber-500',
    accentColor: 'orange',
  },
  {
    type: 'gala',
    label: 'Gala',
    icon: Award,
    description: 'Elegant evening with dinner and entertainment',
    suggestedAssets: ['Invitations', 'Menus', 'Table Numbers', 'Program Booklets', 'Awards'],
    gradient: 'from-amber-400 to-yellow-500',
    accentColor: 'amber',
  },
  {
    type: 'tradeshow',
    label: 'Trade Show',
    icon: Users,
    description: 'Exhibition with vendor booths and showcases',
    suggestedAssets: ['Booth Displays', 'Banners', 'Business Cards', 'Floor Plans', 'Badges'],
    gradient: 'from-emerald-500 to-teal-500',
    accentColor: 'emerald',
  },
  {
    type: 'workshop',
    label: 'Workshop',
    icon: Lightbulb,
    description: 'Hands-on learning with focused curriculum',
    suggestedAssets: ['Workbooks', 'Name Tags', 'Certificates', 'Presentation Slides'],
    gradient: 'from-violet-500 to-purple-600',
    accentColor: 'violet',
  },
  {
    type: 'concert',
    label: 'Concert',
    icon: Mic,
    description: 'Live music or theatrical performance',
    suggestedAssets: ['Tickets', 'Posters', 'Stage Graphics', 'Merchandise', 'Wristbands'],
    gradient: 'from-fuchsia-500 to-pink-600',
    accentColor: 'fuchsia',
  },
  {
    type: 'sports',
    label: 'Sports',
    icon: Trophy,
    description: 'Athletic competition or sporting activity',
    suggestedAssets: ['Jerseys', 'Banners', 'Signage', 'Medals', 'Programs'],
    gradient: 'from-red-500 to-orange-500',
    accentColor: 'red',
  },
  {
    type: 'fundraiser',
    label: 'Fundraiser',
    icon: HandHeart,
    description: 'Event to raise money or awareness',
    suggestedAssets: ['Donation Cards', 'Banners', 'Thank You Notes', 'Programs', 'Sponsor Logos'],
    gradient: 'from-pink-500 to-rose-500',
    accentColor: 'pink',
  },
  {
    type: 'graduation',
    label: 'Graduation',
    icon: GraduationCap,
    description: 'Academic achievement celebration',
    suggestedAssets: ['Programs', 'Banners', 'Name Cards', 'Photo Frames', 'Certificates'],
    gradient: 'from-sky-500 to-blue-600',
    accentColor: 'sky',
  },
  {
    type: 'product_launch',
    label: 'Launch',
    icon: Rocket,
    description: 'Unveiling of a new product or service',
    suggestedAssets: ['Press Kits', 'Backdrops', 'Social Media', 'Invitations', 'Swag'],
    gradient: 'from-cyan-500 to-blue-500',
    accentColor: 'cyan',
  },
  {
    type: 'networking',
    label: 'Networking',
    icon: UserPlus,
    description: 'Professional social gathering for connections',
    suggestedAssets: ['Name Tags', 'Social Media', 'Banners', 'Business Cards'],
    gradient: 'from-indigo-500 to-violet-600',
    accentColor: 'indigo',
  },
  {
    type: 'award_ceremony',
    label: 'Awards',
    icon: Medal,
    description: 'Recognition event honoring achievements',
    suggestedAssets: ['Certificates', 'Programs', 'Stage Graphics', 'Trophies', 'Invitations'],
    gradient: 'from-yellow-400 to-orange-500',
    accentColor: 'yellow',
  },
  {
    type: 'other',
    label: 'Other',
    icon: HelpCircle,
    description: 'Custom event type not listed above',
    suggestedAssets: ['Core branding', 'Basic signage', 'Digital assets'],
    gradient: 'from-gray-400 to-gray-500',
    accentColor: 'gray',
  },
];

const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ selectedType, onSelect }) => {
  const [hoveredType, setHoveredType] = useState<EventType | null>(null);
  const selectedEvent = EVENT_TYPES.find(e => e.type === selectedType);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div 
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center"
          whileHover={{ scale: 1.05, rotate: 5 }}
        >
          <Sparkles className="w-5 h-5 text-violet-500" />
        </motion.div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Event Type</h3>
          <p className="text-xs text-muted-foreground">Select to customize asset recommendations</p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {EVENT_TYPES.map((eventType, index) => {
          const Icon = eventType.icon;
          const isSelected = selectedType === eventType.type;
          const isHovered = hoveredType === eventType.type;

          return (
            <motion.button
              key={eventType.type}
              onClick={() => onSelect(eventType.type)}
              onMouseEnter={() => setHoveredType(eventType.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={cn(
                "group relative p-3 rounded-xl border-2 transition-colors text-center overflow-hidden",
                isSelected
                  ? "border-transparent shadow-lg"
                  : "border-border/50 hover:border-primary/30"
              )}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.03, type: "spring", stiffness: 300, damping: 25 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Background gradient when selected */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    className={cn("absolute inset-0 bg-gradient-to-br", eventType.gradient)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.15, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  />
                )}
              </AnimatePresence>

              {/* Hover glow */}
              <motion.div
                className={cn("absolute inset-0 pointer-events-none")}
                animate={{ opacity: isHovered && !isSelected ? 0.3 : 0 }}
              >
                <div className={cn("absolute -inset-1 bg-gradient-to-r blur-lg", eventType.gradient)} />
              </motion.div>

              {/* Selection check */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div 
                    className={cn("absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br", eventType.gradient)}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="relative">
                <motion.div 
                  className={cn(
                    "w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all mb-2",
                    isSelected
                      ? `bg-gradient-to-br ${eventType.gradient} text-white shadow-lg`
                      : "bg-secondary/80 text-muted-foreground group-hover:bg-secondary group-hover:text-foreground"
                  )}
                  animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <h4 className={cn(
                  "text-xs font-bold transition-colors",
                  isSelected 
                    ? `bg-gradient-to-r ${eventType.gradient} bg-clip-text text-transparent`
                    : "text-foreground"
                )}>
                  {eventType.label}
                </h4>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Event Details */}
      <AnimatePresence mode="wait">
        {selectedEvent && (
          <motion.div 
            key={selectedEvent.type}
            className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Accent line */}
            <motion.div 
              className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", selectedEvent.gradient)}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{ originX: 0 }}
            />

            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <motion.div 
                  className={cn("w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg", selectedEvent.gradient)}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <selectedEvent.icon className="w-7 h-7 text-white" />
                </motion.div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      selectedEvent.gradient
                    )}>
                      {selectedEvent.label}
                    </h4>
                    <motion.span 
                      className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r", selectedEvent.gradient)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      SELECTED
                    </motion.span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{selectedEvent.description}</p>

                  {/* Recommended Assets */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      Recommended Assets
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEvent.suggestedAssets.map((asset, idx) => (
                        <motion.span 
                          key={idx}
                          className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium",
                            "bg-secondary/80 text-foreground border border-border/50"
                          )}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + idx * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {asset}
                        </motion.span>
                      ))}
                      <motion.span 
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <ChevronRight className="w-3 h-3" />
                        +{100 - selectedEvent.suggestedAssets.length} more
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventTypeSelector;
