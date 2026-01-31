import React from 'react';
import { Brain, Palette, MapPin, Sparkles, Lightbulb } from 'lucide-react';
import type { LearnedInsight } from '@/services/aiBrain/types';

interface LearnedInsightsDisplayProps {
  insights: LearnedInsight[];
  variant?: 'compact' | 'full' | 'inline';
  maxItems?: number;
  className?: string;
}

const getInsightIcon = (type: LearnedInsight['type']) => {
  switch (type) {
    case 'style':
      return <Palette className="w-3.5 h-3.5" />;
    case 'cultural':
      return <MapPin className="w-3.5 h-3.5" />;
    case 'prompt':
      return <Lightbulb className="w-3.5 h-3.5" />;
    case 'asset':
      return <Sparkles className="w-3.5 h-3.5" />;
    default:
      return <Brain className="w-3.5 h-3.5" />;
  }
};

const getInsightLabel = (insight: LearnedInsight): string => {
  const confidence = Math.round(insight.confidence * 100);
  
  switch (insight.type) {
    case 'style':
      return `Prefers ${insight.value}`;
    case 'cultural':
      return `${insight.key}: ${insight.value}`;
    case 'prompt':
      return insight.value;
    case 'asset':
      return `${insight.key} style: ${insight.value}`;
    default:
      return insight.value;
  }
};

const LearnedInsightsDisplay: React.FC<LearnedInsightsDisplayProps> = ({
  insights,
  variant = 'compact',
  maxItems = 3,
  className = '',
}) => {
  if (!insights || insights.length === 0) return null;

  // Sort by confidence and take top items
  const topInsights = [...insights]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, maxItems);

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Brain className="w-4 h-4 text-primary" />
        <span>Based on your preferences:</span>
        <span className="text-foreground font-medium">
          {topInsights.map(i => getInsightLabel(i)).join(' • ')}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Brain className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">
            AI learned {insights.length} preference{insights.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={`rounded-xl border border-primary/20 bg-primary/5 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
          <Brain className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">AI Learning Active</h4>
          <p className="text-xs text-muted-foreground">
            Based on your feedback, I've learned these preferences
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {topInsights.map((insight, index) => (
          <div
            key={`${insight.type}-${insight.key}-${index}`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50"
          >
            <div className="text-primary">
              {getInsightIcon(insight.type)}
            </div>
            <span className="text-sm text-foreground flex-1">
              {getInsightLabel(insight)}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(insight.confidence * 100)}% confident
            </span>
          </div>
        ))}
      </div>
      
      {insights.length > maxItems && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          +{insights.length - maxItems} more learned preferences
        </p>
      )}
    </div>
  );
};

export default LearnedInsightsDisplay;
