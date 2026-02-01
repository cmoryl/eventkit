import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Zap, DollarSign, Sparkles, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GenerationProgressInfo } from '@/hooks/useAIOrchestrator';

interface GenerationSummaryProps {
  progress: GenerationProgressInfo;
  onDismiss: () => void;
}

// Estimated cost per AI call (approximate based on typical usage)
const COST_PER_IMAGE_CALL = 0.02; // ~$0.02 per image generation
const COST_PER_TEXT_CALL = 0.005; // ~$0.005 per text generation
const COST_PER_ANALYSIS_CALL = 0.01; // ~$0.01 per image analysis

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

const GenerationSummary: React.FC<GenerationSummaryProps> = ({ progress, onDismiss }) => {
  const totalTime = Date.now() - progress.startTime;
  const assetsGenerated = progress.current;
  const aiCalls = progress.completedAICalls;
  
  // Estimate cost (rough approximation)
  // Assume ~70% are image calls, ~20% text calls, ~10% analysis
  const estimatedCost = 
    (aiCalls * 0.7 * COST_PER_IMAGE_CALL) +
    (aiCalls * 0.2 * COST_PER_TEXT_CALL) +
    (aiCalls * 0.1 * COST_PER_ANALYSIS_CALL);
  
  // Calculate efficiency metrics
  const avgTimePerAsset = assetsGenerated > 0 ? totalTime / assetsGenerated : 0;
  const assetsPerMinute = totalTime > 0 ? (assetsGenerated / (totalTime / 60000)).toFixed(1) : '0';

  const stats = [
    {
      icon: Clock,
      label: 'Total Time',
      value: formatDuration(totalTime),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Sparkles,
      label: 'Assets Generated',
      value: assetsGenerated.toString(),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Zap,
      label: 'AI Calls Made',
      value: aiCalls.toString(),
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: DollarSign,
      label: 'Est. Cost',
      value: formatCost(estimatedCost),
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-full max-w-lg"
      >
        {/* Success header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25"
          >
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Generation Complete!</h2>
          <p className="text-muted-foreground">Your design kit is ready to use</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 rounded-xl bg-card border border-border"
            >
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Efficiency insight */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Generation Speed</p>
              <p className="text-sm text-muted-foreground">
                {assetsPerMinute} assets/min • {formatDuration(avgTimePerAsset)} avg per asset
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dismiss button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={onDismiss}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground"
          >
            View Your Assets
          </Button>
        </motion.div>

        {/* Cost disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-xs text-muted-foreground text-center mt-4"
        >
          * Cost estimate is approximate and may vary based on actual usage
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default GenerationSummary;
