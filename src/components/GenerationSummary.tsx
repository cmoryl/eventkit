import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Zap, DollarSign, Sparkles, TrendingUp, Rocket, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GenerationProgressInfo } from '@/hooks/useAIOrchestrator';

interface GenerationSummaryProps {
  progress: GenerationProgressInfo;
  onDismiss: () => void;
}

// Estimated cost per AI call (approximate based on typical usage)
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

// Confetti particle component
const ConfettiParticle: React.FC<{ delay: number; index: number }> = ({ delay, index }) => {
  const colors = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ec4899'];
  const color = colors[index % colors.length];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 40;
  
  return (
    <motion.div
      initial={{ 
        x: `${startX}vw`, 
        y: -20, 
        rotate: 0, 
        opacity: 1,
        scale: Math.random() * 0.5 + 0.5
      }}
      animate={{ 
        x: `${endX}vw`, 
        y: '100vh', 
        rotate: Math.random() * 720 - 360,
        opacity: 0
      }}
      transition={{ 
        duration: 3 + Math.random() * 2, 
        delay, 
        ease: 'easeOut' 
      }}
      className="fixed pointer-events-none z-[101]"
      style={{ 
        width: Math.random() * 8 + 4, 
        height: Math.random() * 8 + 4,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px'
      }}
    />
  );
};

const GenerationSummary: React.FC<GenerationSummaryProps> = ({ progress, onDismiss }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    time: 0,
    assets: 0,
    calls: 0,
    cost: 0
  });

  const totalTime = Date.now() - progress.startTime;
  const assetsGenerated = progress.current;
  const aiCalls = progress.completedAICalls;
  
  const estimatedCost = 
    (aiCalls * 0.7 * COST_PER_IMAGE_CALL) +
    (aiCalls * 0.2 * COST_PER_TEXT_CALL) +
    (aiCalls * 0.1 * COST_PER_ANALYSIS_CALL);
  
  const avgTimePerAsset = assetsGenerated > 0 ? totalTime / assetsGenerated : 0;
  const assetsPerMinute = totalTime > 0 ? (assetsGenerated / (totalTime / 60000)).toFixed(1) : '0';

  // Animate stats counting up
  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
      
      setAnimatedStats({
        time: Math.floor(totalTime * eased),
        assets: Math.floor(assetsGenerated * eased),
        calls: Math.floor(aiCalls * eased),
        cost: estimatedCost * eased
      });
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [totalTime, assetsGenerated, aiCalls, estimatedCost]);

  // Hide confetti after animation
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      icon: Clock,
      label: 'Total Time',
      value: formatDuration(animatedStats.time),
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/20',
    },
    {
      icon: Sparkles,
      label: 'Assets Created',
      value: animatedStats.assets.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      glowColor: 'shadow-primary/20',
    },
    {
      icon: Zap,
      label: 'AI Calls',
      value: animatedStats.calls.toString(),
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/20',
    },
    {
      icon: DollarSign,
      label: 'Est. Cost',
      value: formatCost(animatedStats.cost),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20',
      glowColor: 'shadow-emerald-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/90 backdrop-blur-2xl flex items-center justify-center z-[100] p-4"
    >
      {/* Confetti */}
      <AnimatePresence>
        {showConfetti && (
          <>
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle key={i} delay={i * 0.05} index={i} />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2]
          }}
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
        {/* Success header with trophy */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', damping: 12 }}
            className="relative w-24 h-24 mx-auto mb-6"
          >
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/30 to-green-500/30 blur-xl"
            />
            {/* Main circle */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-2xl shadow-emerald-500/40">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', damping: 10 }}
              >
                <Check className="w-12 h-12 text-white" strokeWidth={3} />
              </motion.div>
            </div>
            {/* Floating sparkles */}
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
            Your design kit is ready to use
          </motion.p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, type: 'spring', damping: 15 }}
              className={`relative p-4 rounded-2xl bg-card/80 backdrop-blur-sm border ${stat.borderColor} overflow-hidden group hover:scale-[1.02] transition-transform`}
            >
              {/* Subtle gradient overlay on hover */}
              <div className={`absolute inset-0 ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
              
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3 shadow-lg ${stat.glowColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Efficiency insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 mb-6 relative overflow-hidden"
        >
          {/* Animated gradient border */}
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
          />
          
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Generation Performance</p>
              <p className="text-sm text-muted-foreground">
                <span className="text-primary font-medium">{assetsPerMinute}</span> assets/min
                <span className="mx-2 text-border">•</span>
                <span className="text-primary font-medium">{formatDuration(avgTimePerAsset)}</span> per asset
              </p>
            </div>
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
            className="w-full h-14 text-lg bg-gradient-to-r from-primary via-primary to-accent hover:opacity-90 text-primary-foreground shadow-xl shadow-primary/25 group"
          >
            View Your Assets
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Cost disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xs text-muted-foreground/60 text-center mt-4"
        >
          * Cost estimate is approximate based on typical API usage
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default GenerationSummary;
