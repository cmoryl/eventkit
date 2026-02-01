import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { 
  Sparkles, Image, Tag, Ticket, Monitor, ShoppingBag, FileText,
  Presentation, Layers, ChevronLeft, ChevronRight, Play, Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ShowcaseAsset {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  category: string;
  tagline: string;
  gradient: string;
  bgPattern: string;
}

const showcaseAssets: ShowcaseAsset[] = [
  { 
    id: 'banner',
    icon: Image, 
    title: 'Event Banners',
    category: 'Digital',
    tagline: 'Hero graphics that captivate',
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    bgPattern: 'radial-gradient(circle at 30% 70%, rgba(139,92,246,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'badge',
    icon: Tag, 
    title: 'VIP Badges',
    category: 'Print',
    tagline: 'Professional name tags with style',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    bgPattern: 'radial-gradient(circle at 70% 30%, rgba(34,211,238,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'ticket',
    icon: Ticket, 
    title: 'Event Tickets',
    category: 'Print',
    tagline: 'Scannable & stunning',
    gradient: 'from-orange-400 via-red-500 to-pink-500',
    bgPattern: 'radial-gradient(circle at 50% 50%, rgba(251,146,60,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'tshirt',
    icon: ShoppingBag, 
    title: 'Merchandise',
    category: 'Apparel',
    tagline: 'Wearable brand moments',
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    bgPattern: 'radial-gradient(circle at 30% 30%, rgba(52,211,153,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'social',
    icon: Monitor, 
    title: 'Social Posts',
    category: 'Digital',
    tagline: 'Scroll-stopping content',
    gradient: 'from-pink-400 via-rose-500 to-red-500',
    bgPattern: 'radial-gradient(circle at 70% 70%, rgba(244,114,182,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'presentation',
    icon: Presentation, 
    title: 'Pitch Decks',
    category: 'Digital',
    tagline: 'Presentations that persuade',
    gradient: 'from-indigo-400 via-violet-500 to-purple-500',
    bgPattern: 'radial-gradient(circle at 50% 30%, rgba(129,140,248,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'signage',
    icon: Layers, 
    title: 'Event Signage',
    category: 'Print',
    tagline: 'Wayfinding with impact',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    bgPattern: 'radial-gradient(circle at 30% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)'
  },
  { 
    id: 'flyer',
    icon: FileText, 
    title: 'Flyers & Posters',
    category: 'Print',
    tagline: 'Print that pops',
    gradient: 'from-teal-400 via-cyan-500 to-blue-500',
    bgPattern: 'radial-gradient(circle at 70% 50%, rgba(45,212,191,0.3) 0%, transparent 50%)'
  },
];

const CarouselCard: React.FC<{
  asset: ShowcaseAsset;
  position: number; // -3 to 3, 0 being center
  onClick: () => void;
}> = ({ asset, position, onClick }) => {
  const Icon = asset.icon;
  const isCenter = position === 0;
  const isVisible = Math.abs(position) <= 2;
  
  // Calculate 3D transforms based on position
  const translateZ = isCenter ? 100 : Math.abs(position) === 1 ? 50 : 0;
  const translateX = position * 120;
  const rotateY = position * -25;
  const scale = isCenter ? 1.15 : Math.abs(position) === 1 ? 0.9 : 0.75;
  const opacity = isCenter ? 1 : Math.abs(position) === 1 ? 0.7 : 0.4;
  const blur = isCenter ? 0 : Math.abs(position) * 2;

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 cursor-pointer"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      animate={{
        x: translateX,
        z: translateZ,
        rotateY: rotateY,
        scale: scale,
        opacity: opacity,
        filter: `blur(${blur}px)`,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      onClick={onClick}
      whileHover={isCenter ? { scale: 1.2 } : {}}
    >
      <motion.div
        className="relative -translate-x-1/2 -translate-y-1/2 w-48 sm:w-56 md:w-64"
        whileHover={isCenter ? { y: -10 } : {}}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        {/* Glow effect for center card */}
        {isCenter && (
          <motion.div
            className={cn(
              "absolute -inset-4 rounded-3xl blur-2xl",
              `bg-gradient-to-br ${asset.gradient}`
            )}
            animate={{ opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Card */}
        <div 
          className={cn(
            "relative rounded-2xl border overflow-hidden transition-all duration-300",
            isCenter 
              ? "bg-card/95 border-primary/30 shadow-2xl" 
              : "bg-card/80 border-border/50 shadow-lg"
          )}
          style={{ background: asset.bgPattern }}
        >
          {/* Gradient overlay */}
          <div className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br",
            asset.gradient
          )} />
          
          {/* Content */}
          <div className="relative p-6">
            {/* Icon */}
            <motion.div 
              className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4 shadow-lg",
                asset.gradient
              )}
              animate={isCenter ? { 
                rotateZ: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md" />
            </motion.div>
            
            {/* Text */}
            <div className="text-center">
              <span className={cn(
                "inline-block text-xs px-2 py-0.5 rounded-full mb-2 font-medium",
                isCenter 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {asset.category}
              </span>
              <h3 className={cn(
                "font-bold mb-1 transition-colors",
                isCenter ? "text-lg text-foreground" : "text-base text-foreground/80"
              )}>
                {asset.title}
              </h3>
              <p className={cn(
                "text-sm transition-colors",
                isCenter ? "text-muted-foreground" : "text-muted-foreground/60"
              )}>
                {asset.tagline}
              </p>
            </div>
            
            {/* Center card badge */}
            {isCenter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-1 -right-1"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ProgressDots: React.FC<{
  total: number;
  current: number;
  onSelect: (index: number) => void;
}> = ({ total, current, onSelect }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        className={cn(
          "transition-all duration-300 rounded-full",
          i === current 
            ? "w-8 h-2 bg-primary" 
            : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
        )}
      />
    ))}
  </div>
);

const StatsCounter: React.FC<{ value: string; label: string; delay: number }> = ({ 
  value, 
  label, 
  delay 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="text-center"
    >
      <motion.div
        className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto]"
        animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      >
        {value}
      </motion.div>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
};

export const AssetShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  const totalAssets = showcaseAssets.length;

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % totalAssets);
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, totalAssets]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalAssets);
    setIsAutoPlaying(false);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalAssets) % totalAssets);
    setIsAutoPlaying(false);
  };

  // Calculate position for each card relative to current
  const getPosition = (index: number) => {
    let pos = index - currentIndex;
    if (pos > totalAssets / 2) pos -= totalAssets;
    if (pos < -totalAssets / 2) pos += totalAssets;
    return pos;
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Explore Assets
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            See What You Can Create
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            From digital banners to print-ready merchandise, generate everything your event needs.
          </p>
        </motion.div>

        {/* 3D Carousel */}
        <div className="relative h-[350px] sm:h-[400px] md:h-[450px]" style={{ perspective: '1200px' }}>
          {/* Navigation buttons */}
          <button
            onClick={goPrev}
            className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card hover:scale-110 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-lg hover:bg-card hover:scale-110 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {/* Cards */}
          <div 
            className="relative w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {showcaseAssets.map((asset, index) => (
              <CarouselCard
                key={asset.id}
                asset={asset}
                position={getPosition(index)}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-4">
          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="gap-2"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Auto-play
              </>
            )}
          </Button>
          
          {/* Progress dots */}
          <ProgressDots
            total={totalAssets}
            current={currentIndex}
            onSelect={goToSlide}
          />
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-10 sm:gap-16 mt-16"
        >
          <StatsCounter value="100+" label="Asset Types" delay={0.5} />
          <StatsCounter value="Print-Ready" label="High Resolution" delay={0.6} />
          <StatsCounter value="<1 min" label="Generation Time" delay={0.7} />
        </motion.div>
      </div>
    </section>
  );
};
