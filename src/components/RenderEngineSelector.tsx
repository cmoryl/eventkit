// Render Engine Selector - Inline selector for choosing render engine per asset
import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Key } from 'lucide-react';
import type { RenderEngine, RenderProvider } from '@/services/aiBrain/types';
import { getUserRenderEngines, getAllProviders } from '@/services/aiBrain/renderEngineService';
import { cn } from '@/lib/utils';

interface RenderEngineSelectorProps {
  userId: string;
  value?: string; // engine id or 'lovable-default'
  onChange: (engineId: string, engine: RenderEngine | null) => void;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
}

export function RenderEngineSelector({
  userId,
  value = 'lovable-default',
  onChange,
  compact = false,
  className,
  disabled = false,
}: RenderEngineSelectorProps) {
  const [engines, setEngines] = useState<RenderEngine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadEngines();
    }
  }, [userId]);

  const loadEngines = async () => {
    setLoading(false);
    try {
      const userEngines = await getUserRenderEngines(userId);
      setEngines(userEngines);
    } catch (error) {
      console.error('Failed to load engines:', error);
    }
    setLoading(false);
  };

  // Create default Lovable engine option
  const defaultEngine: RenderEngine = {
    id: 'lovable-default',
    userId,
    provider: 'lovable',
    displayName: 'Lovable AI',
    isActive: true,
    isDefault: true,
    config: { model: 'gemini-2.5-flash-image' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const allEngines = [defaultEngine, ...engines.filter(e => e.isActive)];
  const selectedEngine = allEngines.find(e => e.id === value) || defaultEngine;

  const handleChange = (engineId: string) => {
    const engine = allEngines.find(e => e.id === engineId);
    onChange(engineId, engine || null);
  };

  const getProviderIcon = (provider: RenderProvider) => {
    switch (provider) {
      case 'lovable':
        return <Sparkles className={cn("text-primary", compact ? "w-3 h-3" : "w-4 h-4")} />;
      default:
        return <Zap className={cn("text-muted-foreground", compact ? "w-3 h-3" : "w-4 h-4")} />;
    }
  };

  const getProviderColor = (provider: RenderProvider) => {
    switch (provider) {
      case 'lovable': return 'bg-primary/10 text-primary border-primary/30';
      case 'openai': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'stability': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'replicate': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      case 'midjourney': return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className={cn("animate-pulse bg-secondary/50 rounded-lg", compact ? "h-8 w-32" : "h-10 w-48", className)} />
    );
  }

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger 
        className={cn(
          "bg-background/80 backdrop-blur-sm border-border",
          compact ? "h-8 text-xs gap-1.5 px-2" : "h-10 text-sm gap-2",
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {getProviderIcon(selectedEngine.provider)}
          <SelectValue>
            <span className="truncate">{selectedEngine.displayName}</span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {allEngines.map((engine) => (
          <SelectItem key={engine.id} value={engine.id}>
            <div className="flex items-center gap-2">
              {getProviderIcon(engine.provider)}
              <span className="flex-1">{engine.displayName}</span>
              {engine.provider === 'lovable' ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Built-in</Badge>
              ) : (
                <Key className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </SelectItem>
        ))}
        
        {engines.length === 0 && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-t border-border mt-1 pt-2">
            Add more engines in Settings → Render Engines
          </div>
        )}
      </SelectContent>
    </Select>
  );
}

// Compact badge variant for display only
export function RenderEngineBadge({ 
  engine, 
  className 
}: { 
  engine?: RenderEngine | null; 
  className?: string;
}) {
  const provider = engine?.provider || 'lovable';
  const displayName = engine?.displayName || 'Lovable AI';

  const getProviderColor = (p: RenderProvider) => {
    switch (p) {
      case 'lovable': return 'bg-primary/10 text-primary';
      case 'openai': return 'bg-emerald-500/10 text-emerald-600';
      case 'stability': return 'bg-purple-500/10 text-purple-600';
      case 'replicate': return 'bg-blue-500/10 text-blue-600';
      case 'midjourney': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] px-1.5 py-0 font-medium",
        getProviderColor(provider),
        className
      )}
    >
      {provider === 'lovable' ? (
        <Sparkles className="w-2.5 h-2.5 mr-1" />
      ) : (
        <Zap className="w-2.5 h-2.5 mr-1" />
      )}
      {displayName}
    </Badge>
  );
}

export default RenderEngineSelector;
