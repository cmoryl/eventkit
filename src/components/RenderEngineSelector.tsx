// Render Engine Selector - Inline selector for choosing render engine per asset
import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Key, Video, Crown, Wand2 } from 'lucide-react';
import type { RenderEngine, RenderProvider, VideoProvider } from '@/services/aiBrain/types';
import { getUserRenderEngines, getAllProviders } from '@/services/aiBrain/renderEngineService';
import { pickAutoEngine, describeAutoEngine } from '@/services/aiBrain/engineAutoSelect';
import { cn } from '@/lib/utils';

interface RenderEngineSelectorProps {
  userId: string;
  value?: string; // engine id, 'auto', or 'lovable-default'
  onChange: (engineId: string, engine: RenderEngine | null) => void;
  compact?: boolean;
  className?: string;
  disabled?: boolean;
  engineType?: 'image' | 'video' | 'all'; // Filter by engine type
  /** When set, an "Auto" option is offered (and is the default value) that picks the best engine for this asset type. */
  autoSelectFor?: string;
}

type AnyProvider = RenderProvider | VideoProvider;

export function RenderEngineSelector({
  userId,
  value = 'lovable-default',
  onChange,
  compact = false,
  className,
  disabled = false,
  engineType = 'image',
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

  // Create built-in engine options
  const builtInEngines: RenderEngine[] = [
    {
      id: 'lovable-default',
      userId,
      provider: 'lovable',
      displayName: 'Lovable AI (Fast)',
      isActive: true,
      isDefault: true,
      config: { model: 'gemini-2.5-flash-image' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engineType: 'image',
    },
    {
      id: 'lovable-nano-banana-2',
      userId,
      provider: 'lovable-nano-banana-2',
      displayName: 'Nano Banana 2 (Fast HQ)',
      isActive: true,
      isDefault: false,
      config: { model: 'gemini-3.1-flash-image-preview' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engineType: 'image',
    },
    {
      id: 'lovable-hq',
      userId,
      provider: 'lovable-hq',
      displayName: 'Lovable AI (HQ)',
      isActive: true,
      isDefault: false,
      config: { model: 'gemini-3-pro-image-preview', quality: 'hd' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engineType: 'image',
    },
    {
      id: 'lovable-gpt-image',
      userId,
      provider: 'lovable-gpt-image',
      displayName: 'GPT Image (Typography)',
      isActive: true,
      isDefault: false,
      config: { model: 'gpt-image-2', quality: 'high' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      engineType: 'image',
    },
  ];

  // Filter engines by type
  const filteredEngines = engines.filter(e => {
    if (engineType === 'all') return e.isActive;
    return e.isActive && (e.engineType === engineType || !e.engineType);
  });

  const allEngines = [...builtInEngines, ...filteredEngines];
  const selectedEngine = allEngines.find(e => e.id === value) || builtInEngines[0];

  const handleChange = (engineId: string) => {
    const engine = allEngines.find(e => e.id === engineId);
    onChange(engineId, engine || null);
  };

  const getProviderIcon = (provider: AnyProvider) => {
    if (provider.startsWith('lovable-veo') || provider.startsWith('replicate-luma') || provider.startsWith('replicate-minimax')) {
      return <Video className={cn("text-primary", compact ? "w-3 h-3" : "w-4 h-4")} />;
    }
    switch (provider) {
      case 'lovable':
        return <Sparkles className={cn("text-primary", compact ? "w-3 h-3" : "w-4 h-4")} />;
      case 'lovable-hq':
        return <Crown className={cn("text-amber-500", compact ? "w-3 h-3" : "w-4 h-4")} />;
      case 'lovable-nano-banana-2':
        return <Sparkles className={cn("text-yellow-500", compact ? "w-3 h-3" : "w-4 h-4")} />;
      case 'lovable-gpt-image':
        return <Sparkles className={cn("text-emerald-500", compact ? "w-3 h-3" : "w-4 h-4")} />;
      default:
        return <Zap className={cn("text-muted-foreground", compact ? "w-3 h-3" : "w-4 h-4")} />;
    }
  };

  const getProviderColor = (provider: AnyProvider) => {
    if (provider.startsWith('lovable')) return 'bg-primary/10 text-primary border-primary/30';
    if (provider.startsWith('replicate')) return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
    switch (provider) {
      case 'openai': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
      case 'stability': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
      case 'midjourney': return 'bg-rose-500/10 text-rose-600 border-rose-500/30';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const isBuiltIn = (provider: AnyProvider) => {
    return provider === 'lovable' || provider === 'lovable-hq' || provider === 'lovable-nano-banana-2' || provider === 'lovable-gpt-image' || provider === 'lovable-veo3';
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
              {isBuiltIn(engine.provider) ? (
                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0", engine.provider === 'lovable-hq' && "bg-amber-500/10 text-amber-600 border-amber-500/30")}>
                  {engine.provider === 'lovable-hq' ? 'HQ' : 'Built-in'}
                </Badge>
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

  const getProviderColor = (p: AnyProvider) => {
    if (p.startsWith('lovable')) return 'bg-primary/10 text-primary';
    if (p.startsWith('replicate')) return 'bg-blue-500/10 text-blue-600';
    switch (p) {
      case 'openai': return 'bg-emerald-500/10 text-emerald-600';
      case 'stability': return 'bg-purple-500/10 text-purple-600';
      case 'midjourney': return 'bg-rose-500/10 text-rose-600';
      default: return 'bg-secondary text-muted-foreground';
    }
  };

  const isBuiltIn = provider === 'lovable' || provider === 'lovable-hq' || provider === 'lovable-veo3';

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-[10px] px-1.5 py-0 font-medium",
        getProviderColor(provider),
        className
      )}
    >
      {isBuiltIn ? (
        <Sparkles className="w-2.5 h-2.5 mr-1" />
      ) : (
        <Zap className="w-2.5 h-2.5 mr-1" />
      )}
      {displayName}
    </Badge>
  );
}

export default RenderEngineSelector;
