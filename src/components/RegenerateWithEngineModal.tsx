// Regenerate With Engine Modal - Allows choosing render engine for regeneration
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RefreshCw, Cpu, Wand2 } from 'lucide-react';
import { RenderEngineSelector } from './RenderEngineSelector';
import type { RenderEngine } from '@/services/aiBrain/types';
import type { GeneratedAsset } from '@/types';
import { getAssetConfig } from '@/config/assetConfig';
import { supportsAIGeneration } from '@/services/geminiService';
import { motion } from 'framer-motion';

interface RegenerateWithEngineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: GeneratedAsset;
  userId: string;
  onRegenerate: (asset: GeneratedAsset, engine?: RenderEngine) => Promise<void>;
}

export function RegenerateWithEngineModal({
  open,
  onOpenChange,
  asset,
  userId,
  onRegenerate,
}: RegenerateWithEngineModalProps) {
  const [selectedEngineId, setSelectedEngineId] = useState('auto');
  const [selectedEngine, setSelectedEngine] = useState<RenderEngine | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const config = getAssetConfig(asset.type);
  const supportsAI = supportsAIGeneration(asset.type);

  const handleEngineChange = (engineId: string, engine: RenderEngine | null) => {
    setSelectedEngineId(engineId);
    setSelectedEngine(engine);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerate(asset, selectedEngine || undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Regeneration failed:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Regenerate Asset
          </DialogTitle>
          <DialogDescription>
            Generate a new version of this asset using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Asset Preview */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border">
            {typeof asset.content === 'string' && asset.content.startsWith('data:image') ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border">
                <img src={asset.content} alt={asset.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate">{asset.title}</h4>
              <p className="text-sm text-muted-foreground">{config?.description?.substring(0, 50)}...</p>
              {config?.printSpec && (
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {config.printSpec.widthInches}" × {config.printSpec.heightInches}" • {config.printSpec.dpi} DPI
                </Badge>
              )}
            </div>
          </div>

          {/* Engine Selector */}
          {supportsAI && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                Render Engine
              </Label>
              <RenderEngineSelector
                userId={userId}
                value={selectedEngineId}
                onChange={handleEngineChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Choose which AI engine to use for generating this asset
              </p>
            </div>
          )}

          {!supportsAI && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <p className="text-sm text-amber-600 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                This asset type uses template-based generation
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isRegenerating}>
            Cancel
          </Button>
          <Button 
            onClick={handleRegenerate} 
            disabled={isRegenerating}
            className="gap-2"
          >
            {isRegenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Regenerate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RegenerateWithEngineModal;
