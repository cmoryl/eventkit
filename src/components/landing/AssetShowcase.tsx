import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, Calendar, QrCode, MapPin, Music, Camera, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: string;
  gradient: string;
  glowColor: string;
}

const showcaseAssets: ShowcaseAsset[] = [
  { 
    id: 'banner',
    icon: Image, 
    title: 'Event Banner',
    category: 'Banner',
    gradient: 'from-violet-500 to-purple-600',
    glowColor: 'violet'
  },
  { 
    id: 'badge',
    icon: Tag, 
    title: 'VIP Badge',
    category: 'Badge',
    gradient: 'from-cyan-400 to-blue-500',
    glowColor: 'cyan'
  },
  { 
    id: 'ticket',
    icon: Ticket, 
    title: 'Event Ticket',
    category: 'Ticket',
    gradient: 'from-orange-400 to-red-500',
    glowColor: 'orange'
  },
  { 
    id: 'tshirt',
    icon: ShoppingBag, 
    title: 'T-Shirt Design',
    category: 'Merch',
    gradient: 'from-emerald-400 to-green-500',
    glowColor: 'emerald'
  },
  { 
    id: 'social',
    icon: Monitor, 
    title: 'Social Post',
    category: 'Social',
    gradient: 'from-pink-400 to-rose-500',
    glowColor: 'pink'
  },
  { 
    id: 'flyer',
    icon: FileText, 
    title: 'Event Flyer',
    category: 'Flyer',
    gradient: 'from-amber-400 to-orange-500',
    glowColor: 'amber'
  },
  { 
    id: 'presentation',
    icon: Presentation, 
    title: 'Pitch Deck',
    category: 'Presentation',
    gradient: 'from-indigo-400 to-blue-600',
    glowColor: 'indigo'
  },
  { 
    id: 'schedule',
    icon: Calendar, 
    title: 'Schedule Card',
    category: 'Schedule',
    gradient: 'from-teal-400 to-cyan-500',
    glowColor: 'teal'
  },
];

// Orbital positions for cards - arranged in a constellation pattern
const cardPositions = [
  { left: '2%', top: '15%', scale: 0.9, rotate: -12, delay: 0 },
  { left: '78%', top: '8%', scale: 0.85, rotate: 10, delay: 0.1 },
  { left: '-2%', top: '55%', scale: 0.85, rotate: -8, delay: 0.2 },
  { left: '18%', top: '72%', scale: 0.88, rotate: 6, delay: 0.3 },
  { left: '82%', top: '45%', scale: 0.9, rotate: 12, delay: 0.15 },
  { left: '75%', top: '75%', scale: 0.82, rotate: -6, delay: 0.25 },
  { left: '8%', top: '35%', scale: 0.78, rotate: 4, delay: 0.35 },
  { left: '88%', top: '25%', scale: 0.75, rotate: -4, delay: 0.4 },
];

const FloatingCard: React.FC<{
  asset: ShowcaseAsset;
  position: typeof cardPositions[0];
  isHovered: boolean;
  onHover: (id: string | null) => void;
}> = ({ asset, position, isHovered, onHover }) => {
  const Icon = asset.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: position.rotate }}
      whileInView={{ 
        opacity: 1, 
        scale: position.scale, 
        rotate: position.rotate 
      }}
      viewport={{ once: true }}
      transition={{ 
        delay: position.delay + 0.3, 
        type: 'spring', 
        stiffness: 80,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0, 
        zIndex: 30,
        transition: { type: 'spring', stiffness: 300 }
      }}
      animate={{
        y: [0, -8, 0],
        transition: {
          duration: 4 + position.delay * 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: position.delay
        }
      }}
      className="absolute cursor-pointer z-10"
      style={{ left: position.left, top: position.top }}
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className={cn(
        "rounded-2xl bg-card/95 backdrop-blur-md border border-border/50 p-3 shadow-xl transition-all duration-500",
        isHovered && "border-primary/50 shadow-2xl"
      )}>
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 -z-10",
          `bg-gradient-to-br ${asset.gradient}`,
          isHovered && "opacity-20 blur-xl"
        )} />
        
        {/* Icon container */}
        <div className={cn(
          "w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br flex items-center justify-center mb-2 transition-transform duration-300",
          asset.gradient,
          isHovered && "scale-105"
        )}>
          <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
        </div>
        
        {/* Label */}
        <div className="text-center">
          <p className="text-xs sm:text-sm font-medium text-foreground truncate">{asset.title}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{asset.category}</p>
        </div>
      </div>
    </motion.div>
  );
};

const CenterShowcaseCard: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-72 md:w-80 z-20"
    >
      {/* Outer glow ring */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary via-accent to-primary opacity-75 blur-sm animate-pulse" />
      
      {/* Border gradient */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-accent p-[2px] shadow-2xl shadow-primary/40">
        <div className="rounded-2xl bg-card p-4">
          {/* Preview area */}
          <div className="aspect-[16/10] rounded-xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border border-border/30 flex items-center justify-center mb-4 overflow-hidden relative">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-30">
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            
            {/* Center content */}
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-center relative z-10"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-foreground">Tech Summit 2026</p>
              <p className="text-xs text-muted-foreground">Event Banner</p>
            </motion.div>
          </div>
          
          {/* Footer info */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Hero Banner</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              1920×1080
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatsRow: React.FC = () => {
  const stats = [
    { value: '100+', label: 'Asset Types', gradient: 'from-violet-400 to-purple-500' },
    { value: 'Print-Ready', label: 'High Resolution', gradient: 'from-cyan-400 to-blue-500' },
    { value: '<1 min', label: 'Generation Time', gradient: 'from-pink-400 to-rose-500' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 md:gap-16 mt-16"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className="text-center"
        >
          <p className={cn(
            "text-3xl sm:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            stat.gradient
          )}>
            {stat.value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export const AssetShowcase: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 overflow-hidden relative">
      {/* Section background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            See What You Can Create
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From digital banners to print-ready merchandise, generate everything your event needs.
          </p>
        </motion.div>

        {/* Floating cards showcase */}
        <div className="relative h-[450px] sm:h-[550px] md:h-[600px]">
          {/* Ambient glow effects */}
          <motion.div
            className="absolute left-1/3 top-1/4 w-48 h-48 rounded-full bg-primary/15 blur-[80px]"
            animate={{ 
              scale: [1, 1.3, 1], 
              opacity: [0.3, 0.5, 0.3],
              x: [0, 20, 0],
              y: [0, -10, 0]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute right-1/4 bottom-1/3 w-56 h-56 rounded-full bg-accent/15 blur-[80px]"
            animate={{ 
              scale: [1.2, 1, 1.2], 
              opacity: [0.4, 0.2, 0.4],
              x: [0, -20, 0],
              y: [0, 15, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/4 bottom-1/4 w-40 h-40 rounded-full bg-violet-500/10 blur-[60px]"
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.2, 0.4, 0.2] 
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Floating asset cards */}
          {showcaseAssets.slice(0, 6).map((asset, i) => (
            <FloatingCard
              key={asset.id}
              asset={asset}
              position={cardPositions[i]}
              isHovered={hoveredCard === asset.id}
              onHover={setHoveredCard}
            />
          ))}

          {/* Center showcase card */}
          <CenterShowcaseCard />

          {/* Connection lines (decorative) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20 hidden md:block">
            <motion.line 
              x1="15%" y1="30%" x2="45%" y2="45%" 
              stroke="url(#lineGradient)" 
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
            <motion.line 
              x1="85%" y1="20%" x2="55%" y2="45%" 
              stroke="url(#lineGradient)" 
              strokeWidth="1"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.7 }}
            />
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Stats row */}
        <StatsRow />
      </div>
    </section>
  );
};
