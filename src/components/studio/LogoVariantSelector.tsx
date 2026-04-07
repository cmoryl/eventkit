import React from 'react';
import { Image, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export type LogoVariant = 'primary' | 'monochrome' | 'reversed';

interface LogoVariantSelectorProps {
  selectedVariant: LogoVariant;
  onVariantChange: (variant: LogoVariant) => void;
  primaryUrl?: string;
  monochromeUrl?: string;
  reversedUrl?: string;
  className?: string;
}

const VARIANTS: { key: LogoVariant; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'monochrome', label: 'Mono' },
  { key: 'reversed', label: 'Reversed' },
];

export const LogoVariantSelector: React.FC<LogoVariantSelectorProps> = ({
  selectedVariant,
  onVariantChange,
  primaryUrl,
  monochromeUrl,
  reversedUrl,
  className,
}) => {
  const urls: Record<LogoVariant, string | undefined> = {
    primary: primaryUrl,
    monochrome: monochromeUrl,
    reversed: reversedUrl,
  };

  const availableVariants = VARIANTS.filter(v => !!urls[v.key]);

  // Don't render if there are fewer than 2 variants available
  if (availableVariants.length < 2) return null;

  const activeUrl = urls[selectedVariant] || primaryUrl;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
            'border border-border/50 hover:border-primary/50 hover:bg-muted/50',
            className,
          )}
        >
          {activeUrl ? (
            <img src={activeUrl} alt="Logo variant" className="h-5 w-5 object-contain rounded" />
          ) : (
            <Image className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground capitalize">{selectedVariant}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-52 p-2" align="start">
        <p className="text-xs font-medium text-muted-foreground px-1 mb-2">Logo Variant</p>
        <div className="space-y-1">
          {availableVariants.map(v => {
            const url = urls[v.key];
            const isActive = selectedVariant === v.key;
            return (
              <button
                key={v.key}
                onClick={() => onVariantChange(v.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-muted/60 text-foreground',
                )}
              >
                {url ? (
                  <div className={cn(
                    'h-7 w-7 rounded border flex items-center justify-center overflow-hidden',
                    v.key === 'reversed' ? 'bg-zinc-800 border-zinc-700' : 'bg-background border-border/60',
                  )}>
                    <img src={url} alt={v.label} className="h-5 w-5 object-contain" />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded border border-border/60 flex items-center justify-center">
                    <ImageOff className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
