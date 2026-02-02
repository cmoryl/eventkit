import React, { useEffect, useState, useMemo } from 'react';
import type { GeneratedAsset } from '../types';
import type { LearnedInsight } from '@/services/aiBrain/types';
import type { GenerationProgressInfo } from '@/hooks/useAIOrchestrator';
import { useRealtimeProgress, type RealtimeProgressData } from '@/hooks/useRealtimeProgress';
import { Sparkles, Check, Loader2, Brain, Clock, Zap, Activity, Wifi, WifiOff } from 'lucide-react';
import LearnedInsightsDisplay from './LearnedInsightsDisplay';

interface GenerationLoaderProps {
  progress: GenerationProgressInfo;
  assets?: GeneratedAsset[];
  insights?: LearnedInsight[];
}

// Merge local progress with realtime data (realtime takes precedence when available)
function mergeProgress(
  local: GenerationProgressInfo, 
  realtime: RealtimeProgressData | null
): GenerationProgressInfo {
  if (!realtime) return local;
  
  return {
    ...local,
    current: realtime.completed_assets,
    total: realtime.total_assets,
    completedAICalls: realtime.completed_ai_calls,
    estimatedAICalls: realtime.estimated_ai_calls,
    estimatedSecondsRemaining: realtime.estimated_seconds_remaining,
    currentAssetName: realtime.current_asset_name || local.currentAssetName,
    phase: realtime.phase as GenerationProgressInfo['phase'],
  };
}

const GENERATION_TIPS = [
  "Pro tip: Use the Paint Mask tool to edit specific areas of your assets",
  "Try adding your event logo to the QR Code for brand recognition",
  "Export your Brand Style Guide as a PDF for easy sharing",
  "Use the Presentation Editor to create speaker decks quickly",
  "Regenerate individual assets if you want a different variation",
  "Mark your favorite assets with the star for quick access",
  "Download all assets as a ZIP file when you're done"
];

const formatTime = (seconds: number): string => {
  if (seconds <= 0) return 'Almost done...';
  if (seconds < 60) return `~${seconds}s remaining`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `~${mins}m ${secs}s remaining`;
};

const getPhaseLabel = (phase: GenerationProgressInfo['phase']): string => {
  switch (phase) {
    case 'preparing': return 'Preparing assets...';
    case 'analyzing': return 'Analyzing reference images...';
    case 'generating': return 'Generating designs...';
    case 'complete': return 'Generation complete!';
    default: return 'Processing...';
  }
};

const GenerationLoader: React.FC<GenerationLoaderProps> = ({ progress: localProgress, assets, insights }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Subscribe to realtime progress updates
  const { progress: realtimeProgress, isSubscribed } = useRealtimeProgress({
    sessionId: localProgress.sessionId,
    enabled: !!localProgress.sessionId
  });
  
  // Merge local and realtime progress
  const progress = useMemo(() => 
    mergeProgress(localProgress, realtimeProgress),
    [localProgress, realtimeProgress]
  );
  
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (percentage / 100) * circumference;

  // Track elapsed time
  useEffect(() => {
    if (progress.startTime > 0) {
      const interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - progress.startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.startTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % GENERATION_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate efficiency metrics
  const efficiency = useMemo(() => {
    if (progress.completedAICalls === 0 || elapsedSeconds === 0) return null;
    const avgSecondsPerCall = elapsedSeconds / progress.completedAICalls;
    return {
      avgTimePerCall: avgSecondsPerCall.toFixed(1),
      callsPerMinute: (60 / avgSecondsPerCall).toFixed(1)
    };
  }, [progress.completedAICalls, elapsedSeconds]);

  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[100] animate-fade-in p-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="flex flex-col items-center flex-shrink-0 mb-10 relative z-10">
        {/* Progress Ring */}
        <div className="relative w-52 h-52 flex items-center justify-center mb-8">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 256 256">
            {/* Background ring */}
            <circle
              className="text-secondary"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              r="90"
              cx="128"
              cy="128"
            />
            {/* Progress ring with gradient */}
            <defs>
              <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            <circle
              stroke="url(#progressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="90"
              cx="128"
              cy="128"
              className="transition-all duration-500 ease-out"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 shadow-[0_0_60px_rgba(var(--primary),0.15)] flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary mb-1 animate-pulse" />
              <span className="text-4xl font-bold text-foreground tracking-tight">
                {percentage}%
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">{getPhaseLabel(progress.phase)}</h2>
        <p className="text-muted-foreground">
          {progress.current} of {progress.total} assets completed
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 flex-wrap justify-center">
          {/* Realtime indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
            isSubscribed ? 'bg-success/10 text-success' : 'bg-secondary/50 text-muted-foreground'
          }`}>
            {isSubscribed ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">Local</span>
              </>
            )}
          </div>
          
          {/* Time remaining */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {formatTime(progress.estimatedSecondsRemaining)}
            </span>
          </div>

          {/* AI Calls */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {progress.completedAICalls}/{progress.estimatedAICalls} AI calls
            </span>
          </div>

          {/* Efficiency (after first call) */}
          {efficiency && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <Activity className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">
                {efficiency.avgTimePerCall}s/asset
              </span>
            </div>
          )}
        </div>

        {/* Current asset being generated */}
        {progress.currentAssetName && (
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Generating: {progress.currentAssetName}</span>
          </div>
        )}

        {/* AI Learning indicator */}
        {insights && insights.length > 0 && (
          <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 animate-fade-in">
            <Brain className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm text-primary font-medium">
              Applying {insights.length} learned preference{insights.length !== 1 ? 's' : ''} to your designs
            </span>
          </div>
        )}

        {/* Animated tip */}
        <div className="mt-6 h-12 flex items-center">
          <p className="text-sm text-muted-foreground text-center max-w-md animate-fade-in" key={tipIndex}>
            💡 {GENERATION_TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* Asset status grid */}
      {assets && assets.length > 0 && (
        <div className="w-full max-w-4xl overflow-y-auto max-h-[35vh] custom-scrollbar relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {assets.filter(a => a.isLoading || a.content).map((asset, index) => (
              <div
                key={asset.id}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  asset.isLoading
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-success/50 bg-success/5'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {asset.isLoading ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
                      <Check className="w-3 h-3 text-success-foreground" />
                    </div>
                  )}
                  <p className="text-sm font-medium text-foreground truncate flex-1">{asset.title}</p>
                </div>
                
                {/* Mini preview for completed assets */}
                {!asset.isLoading && typeof asset.content === 'string' && asset.content.startsWith('data:image') && (
                  <div className="mt-2 h-12 rounded-lg overflow-hidden bg-secondary/50">
                    <img src={asset.content} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {asset.isLoading && (
                  <div className="mt-2 h-12 rounded-lg shimmer" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationLoader;
