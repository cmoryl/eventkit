import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, Layers, QrCode, Mail, Megaphone, Gift, Camera,
  MapPin, Calendar, CreditCard, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  gradient: string;
}

const topRowAssets: ShowcaseAsset[] = [
  { id: 'banner', icon: Image, title: 'Banners', gradient: 'from-violet-500 to-purple-600' },
  { id: 'badge', icon: Tag, title: 'Badges', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'ticket', icon: Ticket, title: 'Tickets', gradient: 'from-orange-400 to-red-500' },
  { id: 'tshirt', icon: ShoppingBag, title: 'Merch', gradient: 'from-emerald-400 to-green-500' },
  { id: 'social', icon: Monitor, title: 'Social', gradient: 'from-pink-400 to-rose-500' },
  { id: 'presentation', icon: Presentation, title: 'Decks', gradient: 'from-indigo-400 to-violet-500' },
  { id: 'signage', icon: Layers, title: 'Signage', gradient: 'from-amber-400 to-orange-500' },
  { id: 'flyer', icon: FileText, title: 'Flyers', gradient: 'from-teal-400 to-cyan-500' },
  { id: 'qr', icon: QrCode, title: 'QR Codes', gradient: 'from-slate-400 to-zinc-500' },
];

const bottomRowAssets: ShowcaseAsset[] = [
  { id: 'email', icon: Mail, title: 'Emails', gradient: 'from-blue-400 to-indigo-500' },
  { id: 'ads', icon: Megaphone, title: 'Ads', gradient: 'from-rose-400 to-pink-500' },
  { id: 'swag', icon: Gift, title: 'Swag', gradient: 'from-purple-400 to-fuchsia-500' },
  { id: 'photo', icon: Camera, title: 'Backdrops', gradient: 'from-sky-400 to-blue-500' },
  { id: 'maps', icon: MapPin, title: 'Maps', gradient: 'from-green-400 to-emerald-500' },
  { id: 'schedule', icon: Calendar, title: 'Schedules', gradient: 'from-yellow-400 to-amber-500' },
  { id: 'passes', icon: CreditCard, title: 'Passes', gradient: 'from-red-400 to-orange-500' },
  { id: 'team', icon: Users, title: 'Team', gradient: 'from-violet-400 to-purple-500' },
  { id: 'lanyard', icon: Tag, title: 'Lanyards', gradient: 'from-cyan-400 to-teal-500' },
];

const IconCard: React.FC<{
  asset: ShowcaseAsset;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}> = ({ asset, isHovered, onHover }) => {
  const Icon = asset.icon;
  
  return (
    <motion.div
      className="flex-shrink-0 cursor-pointer"
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
      whileHover={{ scale: 1.1, y: -8 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={cn(
        "relative flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all duration-300",
        isHovered ? "bg-card/90 shadow-xl" : "bg-transparent"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-0 blur-xl transition-opacity duration-300 -z-10",
          `bg-gradient-to-br ${asset.gradient}`,
          isHovered && "opacity-40"
        )} />
        
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300",
          asset.gradient,
          isHovered && "scale-110 shadow-xl"
        )}>
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-xs sm:text-sm font-medium transition-colors duration-300",
          isHovered ? "text-foreground" : "text-muted-foreground"
        )}>
          {asset.title}
        </span>
      </div>
    </motion.div>
  );
};

const ScrollingRow: React.FC<{
  assets: ShowcaseAsset[];
  direction: 'left' | 'right';
  speed?: number;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  isPaused: boolean;
}> = ({ assets, direction, speed = 30, hoveredId, onHover, isPaused }) => {
  // Duplicate for seamless loop
  const duplicatedAssets = [...assets, ...assets, ...assets];
  
  return (
    <div className="relative overflow-hidden py-2">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-2 sm:gap-4"
        animate={{
          x: direction === 'left' 
            ? ['0%', '-33.333%'] 
            : ['-33.333%', '0%']
        }}
        transition={{
          x: {
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
            repeatType: 'loop',
          }
        }}
        style={{
          animationPlayState: isPaused ? 'paused' : 'running'
        }}
      >
        {duplicatedAssets.map((asset, i) => (
          <IconCard
            key={`${asset.id}-${i}`}
            asset={asset}
            isHovered={hoveredId === asset.id}
            onHover={onHover}
          />
        ))}
      </motion.div>
    </div>
  );
};

const StatPill: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-3 px-5 py-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg"
  >
    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
      {value}
    </span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </motion.div>
);

export const AssetShowcase: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isPaused = hoveredId !== null;

  return (
    <section className="py-20 sm:py-28 overflow-hidden relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />
      
      <div className="relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            100+ Asset Types
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            See What You Can Create
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From digital banners to print-ready merchandise, generate everything your event needs.
          </p>
        </motion.div>

        {/* Scrolling Rows */}
        <div className="space-y-4 sm:space-y-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={40}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isPaused={isPaused}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={45}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isPaused={isPaused}
          />
        </div>

        {/* Hover instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Hover to pause • Explore asset types
        </motion.p>

        {/* Stats Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-12 px-4"
        >
          <StatPill value="100+" label="Asset Types" />
          <StatPill value="Print-Ready" label="High Resolution" />
          <StatPill value="<1 min" label="Generation Time" />
        </motion.div>
      </div>
    </section>
  );
};
