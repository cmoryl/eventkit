import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, X, ChevronRight, Layers, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: string;
  description: string;
  gradient: string;
  dimensions: string;
  features: string[];
}

const showcaseAssets: ShowcaseAsset[] = [
  { 
    id: 'banner',
    icon: Image, 
    title: 'Event Banners',
    category: 'Digital',
    description: 'Eye-catching hero banners for websites, social media, and digital displays.',
    gradient: 'from-violet-500 to-purple-600',
    dimensions: '1920×1080',
    features: ['Web-optimized', 'Social ready', 'Multiple sizes']
  },
  { 
    id: 'badge',
    icon: Tag, 
    title: 'VIP Badges',
    category: 'Print',
    description: 'Professional name badges with QR codes and custom branding.',
    gradient: 'from-cyan-400 to-blue-500',
    dimensions: '3.5×2"',
    features: ['Print-ready', 'QR support', 'Double-sided']
  },
  { 
    id: 'ticket',
    icon: Ticket, 
    title: 'Event Tickets',
    category: 'Print',
    description: 'Scannable tickets with tear-off stubs and security features.',
    gradient: 'from-orange-400 to-red-500',
    dimensions: '6×2"',
    features: ['Barcodes', 'Tear-off stub', 'Numbered']
  },
  { 
    id: 'tshirt',
    icon: ShoppingBag, 
    title: 'Merchandise',
    category: 'Apparel',
    description: 'T-shirts, hats, and swag items with your event branding.',
    gradient: 'from-emerald-400 to-green-500',
    dimensions: 'Various',
    features: ['Screen-print', 'DTG ready', 'Embroidery']
  },
  { 
    id: 'social',
    icon: Monitor, 
    title: 'Social Posts',
    category: 'Digital',
    description: 'Platform-optimized posts for Instagram, Twitter, LinkedIn, and more.',
    gradient: 'from-pink-400 to-rose-500',
    dimensions: '1080×1080',
    features: ['Story format', 'Feed posts', 'Reels covers']
  },
  { 
    id: 'presentation',
    icon: Presentation, 
    title: 'Pitch Decks',
    category: 'Digital',
    description: 'Branded presentation templates for sponsors and stakeholders.',
    gradient: 'from-indigo-400 to-violet-500',
    dimensions: '16:9',
    features: ['PowerPoint', 'Google Slides', 'Keynote']
  },
  { 
    id: 'signage',
    icon: Layers, 
    title: 'Event Signage',
    category: 'Print',
    description: 'Wayfinding signs, banners, and backdrops for your venue.',
    gradient: 'from-amber-400 to-orange-500',
    dimensions: 'Custom',
    features: ['Large format', 'Vinyl ready', 'Roll-up']
  },
  { 
    id: 'flyer',
    icon: FileText, 
    title: 'Flyers & Posters',
    category: 'Print',
    description: 'Promotional materials for marketing and on-site distribution.',
    gradient: 'from-teal-400 to-cyan-500',
    dimensions: '8.5×11"',
    features: ['Bleed ready', 'CMYK', 'Multiple sizes']
  },
];

// Physics constants for magnetic effect
const MAGNETIC_STRENGTH = 0.15;
const DAMPING = 0.92;

interface AssetNodeProps {
  asset: ShowcaseAsset;
  index: number;
  mousePosition: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  isSelected: string | null;
  onSelect: (id: string) => void;
}

const AssetNode: React.FC<AssetNodeProps> = ({ 
  asset, 
  index, 
  mousePosition, 
  containerRef,
  isSelected,
  onSelect 
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate grid position (responsive)
  const cols = 4;
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  // Spring animation for smooth movement
  const springX = useSpring(0, { stiffness: 150, damping: 20 });
  const springY = useSpring(0, { stiffness: 150, damping: 20 });
  const springScale = useSpring(1, { stiffness: 300, damping: 25 });
  const springRotate = useSpring(0, { stiffness: 200, damping: 20 });

  useEffect(() => {
    if (!nodeRef.current || !containerRef.current || isSelected) return;
    
    const nodeRect = nodeRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const nodeCenterX = nodeRect.left + nodeRect.width / 2 - containerRect.left;
    const nodeCenterY = nodeRect.top + nodeRect.height / 2 - containerRect.top;
    
    const dx = mousePosition.x - nodeCenterX;
    const dy = mousePosition.y - nodeCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Magnetic attraction based on distance
    const maxDistance = 300;
    if (distance < maxDistance && distance > 0) {
      const force = (1 - distance / maxDistance) * MAGNETIC_STRENGTH;
      const offsetX = dx * force * 0.5;
      const offsetY = dy * force * 0.5;
      const rotation = (dx * force * 0.1);
      
      springX.set(offsetX);
      springY.set(offsetY);
      springRotate.set(rotation);
    } else {
      springX.set(0);
      springY.set(0);
      springRotate.set(0);
    }
  }, [mousePosition, isSelected]);

  useEffect(() => {
    springScale.set(isHovered ? 1.08 : 1);
  }, [isHovered]);

  const Icon = asset.icon;
  const isThisSelected = isSelected === asset.id;

  return (
    <motion.div
      ref={nodeRef}
      className={cn(
        "relative cursor-pointer select-none",
        isSelected && !isThisSelected && "opacity-30 pointer-events-none"
      )}
      style={{
        x: springX,
        y: springY,
        scale: springScale,
        rotateY: springRotate,
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(asset.id)}
    >
      <div className={cn(
        "group relative rounded-2xl p-1 transition-all duration-300",
        isHovered && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -inset-2 rounded-3xl opacity-0 blur-xl transition-opacity duration-500",
          `bg-gradient-to-br ${asset.gradient}`,
          isHovered && "opacity-40"
        )} />
        
        {/* Card */}
        <div className="relative rounded-xl bg-card/95 backdrop-blur-sm border border-border/50 p-4 overflow-hidden">
          {/* Animated gradient background on hover */}
          <motion.div 
            className={cn(
              "absolute inset-0 opacity-0 transition-opacity duration-500",
              `bg-gradient-to-br ${asset.gradient}`
            )}
            animate={{ opacity: isHovered ? 0.08 : 0 }}
          />
          
          {/* Icon */}
          <div className={cn(
            "relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 transition-transform duration-300",
            asset.gradient,
            isHovered && "scale-110"
          )}>
            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg" />
            
            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0"
              initial={{ x: '-100%', opacity: 0 }}
              animate={isHovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </div>
          
          {/* Text */}
          <div className="relative text-center">
            <p className="text-sm font-semibold text-foreground mb-0.5">{asset.title}</p>
            <p className="text-xs text-muted-foreground">{asset.category}</p>
          </div>
          
          {/* Expand indicator */}
          <motion.div
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            animate={isHovered ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <ChevronRight className="w-4 h-4 text-primary" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const ExpandedAssetView: React.FC<{
  asset: ShowcaseAsset;
  onClose: () => void;
}> = ({ asset, onClose }) => {
  const Icon = asset.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className={cn(
          "absolute -inset-4 rounded-3xl blur-2xl opacity-50",
          `bg-gradient-to-br ${asset.gradient}`
        )} />
        
        {/* Card */}
        <div className="relative rounded-2xl bg-card border border-border p-6 shadow-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={cn(
              "w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
              asset.gradient
            )}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">{asset.title}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {asset.category}
                </span>
                <span className="text-xs text-muted-foreground">{asset.dimensions}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6">{asset.description}</p>
          
          {/* Features */}
          <div className="space-y-2 mb-6">
            <p className="text-sm font-medium">Features included:</p>
            <div className="flex flex-wrap gap-2">
              {asset.features.map((feature) => (
                <span 
                  key={feature}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
          
          {/* Preview mockup */}
          <div className={cn(
            "rounded-xl p-8 flex items-center justify-center bg-gradient-to-br",
            asset.gradient,
            "bg-opacity-10"
          )}>
            <motion.div
              animate={{ 
                rotateY: [0, 5, 0, -5, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="text-center"
            >
              <div className={cn(
                "w-20 h-20 mx-auto rounded-xl bg-gradient-to-br flex items-center justify-center mb-3",
                asset.gradient
              )}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              <p className="text-sm font-medium">Sample {asset.title}</p>
              <p className="text-xs text-muted-foreground">AI-generated preview</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const InteractiveHint: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1 }}
    className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-8"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Wand2 className="w-4 h-4" />
    </motion.div>
    <span>Move your cursor to interact • Click to explore</span>
  </motion.div>
);

const StatsRow: React.FC = () => {
  const stats = [
    { value: '100+', label: 'Asset Types' },
    { value: 'Print-Ready', label: 'High Resolution' },
    { value: '<1 min', label: 'Generation Time' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-8 sm:gap-16 mt-16"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 + i * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className="text-center group cursor-default"
        >
          <p className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent group-hover:from-accent group-hover:to-primary transition-all duration-500">
            {stat.value}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export const AssetShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  const handleSelect = (id: string) => {
    setSelectedAsset(id);
  };

  const handleClose = () => {
    setSelectedAsset(null);
  };

  const selectedAssetData = showcaseAssets.find(a => a.id === selectedAsset);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 overflow-hidden relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/5 to-background pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Interactive Showcase
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            See What You Can Create
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From digital banners to print-ready merchandise, generate everything your event needs.
          </p>
        </motion.div>

        {/* Interactive Grid */}
        <div 
          ref={containerRef}
          className="relative"
          onMouseMove={handleMouseMove}
        >
          {/* Ambient cursor glow */}
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none -z-10"
            animate={{
              x: mousePosition.x - 128,
              y: mousePosition.y - 128,
            }}
            transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          />
          
          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {showcaseAssets.map((asset, i) => (
              <AssetNode
                key={asset.id}
                asset={asset}
                index={i}
                mousePosition={mousePosition}
                containerRef={containerRef}
                isSelected={selectedAsset}
                onSelect={handleSelect}
              />
            ))}
          </div>
          
          <InteractiveHint />
        </div>

        {/* Stats */}
        <StatsRow />
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {selectedAssetData && (
          <ExpandedAssetView 
            asset={selectedAssetData} 
            onClose={handleClose} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
