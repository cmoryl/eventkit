import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, Layers, QrCode, Mail, Megaphone, Gift, Camera,
  MapPin, Calendar, CreditCard, Users, Video, Shield, UtensilsCrossed
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssetType } from '@/types';
import { getStudioByAssetType, StudioType } from '@/types/studio.types';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  gradient: string;
  assetType: AssetType;
  studioId: StudioType;
}

// Map assets to their studios
const topRowAssets: ShowcaseAsset[] = [
  { id: 'branding', icon: Sparkles, title: 'Branding', gradient: 'from-violet-500 to-purple-600', assetType: AssetType.Logo, studioId: 'branding' },
  { id: 'banner', icon: Image, title: 'Print', gradient: 'from-blue-500 to-cyan-500', assetType: AssetType.Banner, studioId: 'print-signage' },
  { id: 'tshirt', icon: ShoppingBag, title: 'Merch', gradient: 'from-orange-500 to-red-500', assetType: AssetType.Tshirt, studioId: 'merchandise' },
  { id: 'social', icon: Monitor, title: 'Social', gradient: 'from-pink-500 to-rose-500', assetType: AssetType.SocialPost, studioId: 'social-digital' },
  { id: 'presentation', icon: Presentation, title: 'Slides', gradient: 'from-emerald-500 to-teal-500', assetType: AssetType.Presentation, studioId: 'presentations' },
  { id: 'venue', icon: Layers, title: 'Venue', gradient: 'from-indigo-500 to-blue-600', assetType: AssetType.MainStageBackdrop, studioId: 'venue-experience' },
];

const bottomRowAssets: ShowcaseAsset[] = [
  { id: 'invites', icon: Ticket, title: 'Invites', gradient: 'from-amber-500 to-yellow-500', assetType: AssetType.InvitationCard, studioId: 'invitations-access' },
  { id: 'dining', icon: UtensilsCrossed, title: 'Dining', gradient: 'from-lime-500 to-green-500', assetType: AssetType.Menu, studioId: 'hospitality-dining' },
  { id: 'video', icon: Video, title: 'Video', gradient: 'from-red-500 to-pink-600', assetType: AssetType.VideoTeaser, studioId: 'video-motion' },
  { id: 'docs', icon: FileText, title: 'Docs', gradient: 'from-slate-500 to-gray-600', assetType: AssetType.ProgramBooklet, studioId: 'documents-forms' },
  { id: 'photo', icon: Camera, title: 'Photo', gradient: 'from-fuchsia-500 to-purple-600', assetType: AssetType.PhotoBoothFrame, studioId: 'photo-engagement' },
  { id: 'safety', icon: Shield, title: 'Safety', gradient: 'from-green-500 to-emerald-600', assetType: AssetType.AccessibilitySignage, studioId: 'accessibility-safety' },
];

const IconCard: React.FC<{
  asset: ShowcaseAsset;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  isClickable: boolean;
  onClick?: (studioId: StudioType) => void;
}> = ({ asset, isHovered, onHover, isClickable, onClick }) => {
  const Icon = asset.icon;
  
  const handleClick = () => {
    if (isClickable && onClick) {
      onClick(asset.studioId);
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
        "relative flex flex-col items-center gap-2 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl transition-all duration-300",
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
          "w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transition-all duration-300",
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
        
        {/* Click hint for logged-in users */}
        {isClickable && isHovered && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 text-[10px] text-primary font-medium whitespace-nowrap"
          >
            Open Studio →
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
  onStudioClick?: (studioId: StudioType) => void;
}> = ({ assets, direction, speed = 30, hoveredId, onHover, isClickable, onStudioClick }) => {
  // Duplicate for seamless loop
  const duplicatedAssets = [...assets, ...assets, ...assets];
  const isPaused = hoveredId !== null;
  
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
            isClickable={isClickable}
            onClick={onStudioClick}
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
  const navigate = useNavigate();
  
  const isClickable = isAuthenticated;
  
  const handleStudioClick = (studioId: StudioType) => {
    navigate(`/studio/${studioId}`);
  };

  // Embedded version (no header, no stats - for use inside hero)
  if (embedded) {
    return (
      <div className="w-full overflow-hidden">
        <div className="space-y-3 sm:space-y-4 pb-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={45}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onStudioClick={handleStudioClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={50}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onStudioClick={handleStudioClick}
          />
        </div>
        {isClickable && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground"
          >
            <span className="text-primary font-medium">✨ Click any studio</span> to start creating
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
            12 Professional Studios
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From branding to video, each studio is a complete production toolkit for your event assets.
          </p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          <ScrollingRow
            assets={topRowAssets}
            direction="left"
            speed={50}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onStudioClick={handleStudioClick}
          />
          <ScrollingRow
            assets={bottomRowAssets}
            direction="right"
            speed={55}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            isClickable={isClickable}
            onStudioClick={handleStudioClick}
          />
        </div>
      </div>
    </section>
  );
};
