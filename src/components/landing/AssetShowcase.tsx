import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, Layers, QrCode, Mail, Megaphone, Gift, Camera,
  MapPin, Calendar, CreditCard, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  gradient: string;
  assetType: AssetType; // Map to actual AssetType
}

const topRowAssets: ShowcaseAsset[] = [
  { id: 'banner', icon: Image, title: 'Banners', gradient: 'from-violet-500 to-purple-600', assetType: AssetType.Banner },
  { id: 'badge', icon: Tag, title: 'Badges', gradient: 'from-cyan-400 to-blue-500', assetType: AssetType.NameTag },
  { id: 'ticket', icon: Ticket, title: 'Tickets', gradient: 'from-orange-400 to-red-500', assetType: AssetType.TicketDesign },
  { id: 'tshirt', icon: ShoppingBag, title: 'Merch', gradient: 'from-emerald-400 to-green-500', assetType: AssetType.Tshirt },
  { id: 'social', icon: Monitor, title: 'Social', gradient: 'from-pink-400 to-rose-500', assetType: AssetType.SocialPost },
  { id: 'presentation', icon: Presentation, title: 'Decks', gradient: 'from-indigo-400 to-violet-500', assetType: AssetType.Presentation },
  { id: 'signage', icon: Layers, title: 'Signage', gradient: 'from-amber-400 to-orange-500', assetType: AssetType.EventSignage },
  { id: 'flyer', icon: FileText, title: 'Flyers', gradient: 'from-teal-400 to-cyan-500', assetType: AssetType.InvitationCard },
  { id: 'qr', icon: QrCode, title: 'QR Codes', gradient: 'from-slate-400 to-zinc-500', assetType: AssetType.QRCode },
];

const bottomRowAssets: ShowcaseAsset[] = [
  { id: 'email', icon: Mail, title: 'Emails', gradient: 'from-blue-400 to-indigo-500', assetType: AssetType.EmailHeader },
  { id: 'ads', icon: Megaphone, title: 'Ads', gradient: 'from-rose-400 to-pink-500', assetType: AssetType.LinkedInBanner },
  { id: 'swag', icon: Gift, title: 'Swag', gradient: 'from-purple-400 to-fuchsia-500', assetType: AssetType.SwagBag },
  { id: 'photo', icon: Camera, title: 'Backdrops', gradient: 'from-sky-400 to-blue-500', assetType: AssetType.StepAndRepeat },
  { id: 'maps', icon: MapPin, title: 'Maps', gradient: 'from-green-400 to-emerald-500', assetType: AssetType.FloorPlan },
  { id: 'schedule', icon: Calendar, title: 'Schedules', gradient: 'from-yellow-400 to-amber-500', assetType: AssetType.AgendaHighlights },
  { id: 'passes', icon: CreditCard, title: 'Passes', gradient: 'from-red-400 to-orange-500', assetType: AssetType.VIPBadge },
  { id: 'team', icon: Users, title: 'Team', gradient: 'from-violet-400 to-purple-500', assetType: AssetType.SpeakerIntroCard },
  { id: 'lanyard', icon: Tag, title: 'Lanyards', gradient: 'from-cyan-400 to-teal-500', assetType: AssetType.Lanyard },
];

const IconCard: React.FC<{
  asset: ShowcaseAsset;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isClickable: boolean;
  onClick?: (assetType: AssetType) => void;
}> = ({ asset, isHovered, onHover, isClickable, onClick }) => {
  const Icon = asset.icon;
  
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(asset.assetType);
    }
  };
  
  return (
    <motion.div
      className={cn(
        "flex-shrink-0",
        isClickable ? "cursor-pointer" : "cursor-default"
      )}
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
      onClick={handleClick}
      whileHover={{ scale: 1.1, y: -8 }}
      whileTap={isClickable ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className={cn(
        "relative flex flex-col items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300",
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
          "w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-transform duration-300",
          asset.gradient,
          isHovered && "scale-110 shadow-xl"
        )}>
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        
        {/* Label */}
        <span className={cn(
          "text-xs font-medium transition-colors duration-300",
          isHovered ? "text-foreground" : "text-muted-foreground"
        )}>
          {asset.title}
        </span>
        
        {/* Click hint for logged-in users */}
        {isClickable && isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 text-[10px] text-primary font-medium whitespace-nowrap"
          >
            Click to create
          </motion.span>
        )}
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
  isClickable: boolean;
  onAssetClick?: (assetType: AssetType) => void;
}> = ({ assets, direction, speed = 30, hoveredId, onHover, isClickable, onAssetClick }) => {
  // Duplicate for seamless loop
  const duplicatedAssets = [...assets, ...assets, ...assets];
  const isPaused = hoveredId !== null;
  
  return (
    <div className="relative overflow-hidden py-1">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-1 sm:gap-2"
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
            isClickable={isClickable}
            onClick={onAssetClick}
          />
        ))}
      </motion.div>
    </div>
  );
};

interface AssetShowcaseProps {
  embedded?: boolean;
  isAuthenticated?: boolean;
  onAssetClick?: (assetType: AssetType) => void;
}

export const AssetShowcase: React.FC<AssetShowcaseProps> = ({ 
  embedded = false,
  isAuthenticated = false,
  onAssetClick
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  
  const isClickable = isAuthenticated && !!onAssetClick;

  // Embedded version (no header, no stats - for use inside hero)
  if (embedded) {
    return (
      <div className="w-full overflow-hidden">
        <div className="space-y-2 sm:space-y-3 pb-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={35}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onAssetClick={onAssetClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={40}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onAssetClick={onAssetClick}
          />
        </div>
        {isClickable && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground"
          >
            <span className="text-primary font-medium">Logged in:</span> Click any asset to start creating
          </motion.p>
        )}
      </div>
    );
  }

  // Full standalone version
  return (
    <section className="py-20 sm:py-28 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background pointer-events-none" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            See What You Can Create
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From digital banners to print-ready merchandise, generate everything your event needs.
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={40}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onAssetClick={onAssetClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={45}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onAssetClick={onAssetClick}
          />
        </div>
      </div>
    </section>
  );
};
