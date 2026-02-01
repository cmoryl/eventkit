import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, Clock, Zap, DollarSign, Sparkles, TrendingUp, Rocket, Trophy, ArrowRight, Copy, CheckCircle2, RotateCcw, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { GenerationProgressInfo } from '@/hooks/useAIOrchestrator';
import { toast } from '@/hooks/use-toast';

interface GenerationSummaryProps {
  progress: GenerationProgressInfo;
  onDismiss: () => void;
}

// Estimated cost per AI call
const COST_PER_IMAGE_CALL = 0.02;
const COST_PER_TEXT_CALL = 0.005;
const COST_PER_ANALYSIS_CALL = 0.01;

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

const formatCost = (cost: number): string => {
  if (cost < 0.01) return '< $0.01';
  return `~$${cost.toFixed(2)}`;
};

// Confetti particle
const ConfettiParticle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const color = colors[index % colors.length];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  
  return (
    <motion.div
      initial={{ x: `${startX}vw`, y: -20, rotate: 0, opacity: 1, scale: Math.random() * 0.5 + 0.5 }}
      animate={{ x: `${endX}vw`, y: '100vh', rotate: Math.random() * 720 - 360, opacity: 0 }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeOut' }}
      className="fixed pointer-events-none z-[101]"
      style={{ 
        width: Math.random() * 10 + 4, 
        height: Math.random() * 10 + 4,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }}
    />
  );
};

// Circular progress ring
const ProgressRing: React.FC<{ progress: number; size: number; strokeWidth: number; color: string }> = ({
  progress, size, strokeWidth, color
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const springProgress = useSpring(0, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    springProgress.set(progress);
  }, [progress, springProgress]);
  
  const strokeDashoffset = useTransform(springProgress, [0, 100], [circumference, 0]);
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/20"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={{ strokeDasharray: circumference, strokeDashoffset }}
      />
    </svg>
  );
};

// Interactive stat card
interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  rawValue: string | number;
  color: string;
  bgColor: string;
  borderColor: string;
  index: number;
  progress?: number;
  detail?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon, label, value, rawValue, color, bgColor, borderColor, index, progress, detail
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-50, 50], [-5, 5]);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(`${label}: ${rawValue}`);
    setCopied(true);
    toast({ title: "Copied!", description: `${label} copied to clipboard` });
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4 + index * 0.1, type: 'spring', damping: 15 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleCopy}
      className={`relative p-4 rounded-2xl bg-card/80 backdrop-blur-sm border ${borderColor} overflow-hidden cursor-pointer group perspective-1000`}
    >
      {/* Animated gradient on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        className={`absolute inset-0 ${bgColor}`}
      />
      
      {/* Shine effect */}
      <motion.div
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: isHovered ? '200%' : '-100%', opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
      />
      
      <div className="relative flex items-start justify-between">
        <div>
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-3 shadow-lg`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            {progress !== undefined && (
              <div className="absolute -top-1 -right-1">
                <ProgressRing progress={progress} size={20} strokeWidth={2} color={`hsl(var(--primary))`} />
              </div>
            )}
          </div>
          <motion.p 
            className="text-2xl font-bold text-foreground tabular-nums"
            animate={{ scale: isHovered ? 1.05 : 1 }}
          >
            {value}
          </motion.p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {detail && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
              className="text-xs text-muted-foreground/70 mt-1"
            >
              {detail}
            </motion.p>
          )}
        </div>
        
        {/* Copy indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          className={`p-1.5 rounded-lg ${bgColor}`}
        >
          {copied ? (
            <CheckCircle2 className={`w-4 h-4 ${color}`} />
          ) : (
            <Copy className={`w-4 h-4 ${color}`} />
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const GenerationSummary: React.FC<GenerationSummaryProps> = ({ progress, onDismiss }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({ time: 0, assets: 0, calls: 0, cost: 0 });

  const totalTime = Date.now() - progress.startTime;
  const assetsGenerated = progress.current;
  const aiCalls = progress.completedAICalls;
  
  const estimatedCost = 
    (aiCalls * 0.7 * COST_PER_IMAGE_CALL) +
    (aiCalls * 0.2 * COST_PER_TEXT_CALL) +
    (aiCalls * 0.1 * COST_PER_ANALYSIS_CALL);
  
  const avgTimePerAsset = assetsGenerated > 0 ? totalTime / assetsGenerated : 0;
  const assetsPerMinute = totalTime > 0 ? (assetsGenerated / (totalTime / 60000)).toFixed(1) : '0';

  // Animate stats
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setAnimatedStats({
        time: Math.floor(totalTime * eased),
        assets: Math.floor(assetsGenerated * eased),
        calls: Math.floor(aiCalls * eased),
        cost: estimatedCost * eased
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalTime, assetsGenerated, aiCalls, estimatedCost, animationKey]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, [animationKey]);

  const replayAnimation = () => {
    setShowConfetti(true);
    setAnimatedStats({ time: 0, assets: 0, calls: 0, cost: 0 });
    setAnimationKey(prev => prev + 1);
  };

  const shareResults = async () => {
    const text = `🎉 Just generated ${assetsGenerated} design assets in ${formatDuration(totalTime)}!\n\n📊 Stats:\n• AI Calls: ${aiCalls}\n• Speed: ${assetsPerMinute} assets/min\n• Est. Cost: ${formatCost(estimatedCost)}\n\nBuilt with Event Design Kit Generator ✨`;
    
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Results copied to clipboard" });
    }
  };

  const stats = [
    {
      icon: Clock,
      label: 'Total Time',
      value: formatDuration(animatedStats.time),
      rawValue: formatDuration(totalTime),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      detail: `~${formatDuration(avgTimePerAsset)} per asset`,
    },
    {
      icon: Sparkles,
      label: 'Assets Created',
      value: animatedStats.assets.toString(),
      rawValue: assetsGenerated,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      progress: 100,
      detail: 'Ready to download',
    },
    {
      icon: Zap,
      label: 'AI Calls',
      value: animatedStats.calls.toString(),
      rawValue: aiCalls,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      detail: 'Optimized with caching',
    },
    {
      icon: DollarSign,
      label: 'Est. Cost',
      value: formatCost(animatedStats.cost),
      rawValue: formatCost(estimatedCost),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      detail: 'Based on API usage',
    },
  ];

  return (
    <TooltipProvider>
      <motion.div
        key={animationKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-background/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"
      >
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && Array.from({ length: 60 }).map((_, i) => (
            <ConfettiParticle key={`${animationKey}-${i}`} delay={i * 0.04} index={i} />
          ))}
        </AnimatePresence>

        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-[100px]"
          />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="w-full max-w-lg relative"
        >
          {/* Action buttons */}
          <div className="absolute -top-2 right-0 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={replayAnimation}
                  className="p-2 rounded-full bg-card/80 border border-border hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Replay animation</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={shareResults}
                  className="p-2 rounded-full bg-card/80 border border-border hover:bg-muted transition-colors"
                >
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>Share results</TooltipContent>
            </Tooltip>
          </div>

          {/* Success header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', damping: 12 }}
              className="relative w-24 h-24 mx-auto mb-6"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/30 blur-xl"
              />
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40 cursor-pointer"
                onClick={replayAnimation}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>
              <motion.div
                animate={{ y: [-2, 2, -2], rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Trophy className="w-8 h-8 text-amber-400 drop-shadow-lg" />
              </motion.div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent mb-2"
            >
              Generation Complete!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground flex items-center justify-center gap-2"
            >
              <Rocket className="w-4 h-4" />
              Click any stat to copy • Tap checkmark to replay
            </motion.p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} {...stat} index={index} />
            ))}
          </div>

          {/* Efficiency insight */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 mb-6 relative overflow-hidden cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(`${assetsPerMinute} assets/min • ${formatDuration(avgTimePerAsset)} per asset`);
              toast({ title: "Copied!", description: "Performance stats copied" });
            }}
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
            />
            <div className="relative flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              >
                <TrendingUp className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Generation Performance</p>
                <p className="text-sm text-muted-foreground">
                  <span className="text-primary font-medium">{assetsPerMinute}</span> assets/min
                  <span className="mx-2 text-border">•</span>
                  <span className="text-primary font-medium">{formatDuration(avgTimePerAsset)}</span> per asset
                </p>
              </div>
              <Copy className="w-4 h-4 text-muted-foreground/50" />
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={onDismiss}
              size="lg"
              className="w-full h-14 text-lg bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/25 group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <span className="relative">View Your Assets</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform relative" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-muted-foreground/60 text-center mt-4"
          >
            * Cost estimate based on typical API usage
          </motion.p>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};

export default GenerationSummary;
