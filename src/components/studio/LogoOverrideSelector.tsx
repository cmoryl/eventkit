import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, X, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LogoOverrideSelectorProps {
  /** Current override URL (null = using brand default) */
  overrideLogoUrl: string | null;
  /** Brand's default logo URL for display */
  brandLogoUrl?: string;
  /** Callback when override changes; null means "reset to brand default" */
  onLogoChange: (logoUrl: string | null) => void;
  /** Label shown in the trigger */
  label?: string;
  /** Compact mode for asset-level usage */
  compact?: boolean;
  className?: string;
}

export const LogoOverrideSelector: React.FC<LogoOverrideSelectorProps> = ({
  overrideLogoUrl,
  brandLogoUrl,
  onLogoChange,
  label = 'Logo',
  compact = false,
  className,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);

  const activeLogoUrl = overrideLogoUrl || brandLogoUrl;
  const isOverridden = !!overrideLogoUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Logo must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `logo-overrides/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
      const { data, error } = await supabase.storage
        .from('asset-images')
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('asset-images')
        .getPublicUrl(data.path);

      if (urlData?.publicUrl) {
        onLogoChange(urlData.publicUrl);
        toast.success('Logo uploaded');
        setOpen(false);
      }
    } catch (err) {
      console.error('Logo upload failed:', err);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    onLogoChange(null);
    setOpen(false);
    toast.success('Reset to brand logo');
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'relative flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors',
                'border border-border/50 hover:border-primary/50 hover:bg-muted/50',
                isOverridden && 'border-primary/30 bg-primary/5'
              )}
            >
              {activeLogoUrl ? (
                <img src={activeLogoUrl} alt="Logo" className="h-5 w-5 object-contain rounded" />
              ) : (
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">{label}</span>
              {isOverridden && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                {isOverridden ? 'Custom logo active' : 'Using brand logo'}
              </p>
              
              {activeLogoUrl && (
                <div className="flex items-center justify-center p-3 bg-muted/30 rounded-lg border border-border/50">
                  <img src={activeLogoUrl} alt="Current logo" className="max-h-12 max-w-full object-contain" />
                </div>
              )}

              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                {isUploading ? 'Uploading...' : 'Upload Different Logo'}
              </Button>

              {isOverridden && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset to Brand Logo
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  // Full-size variant for project-level
  return (
    <div className={cn('flex items-center', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={isOverridden ? 'secondary' : 'outline'}
            size="sm"
            className="gap-2"
          >
            {activeLogoUrl ? (
              <img src={activeLogoUrl} alt="Logo" className="h-5 w-5 object-contain rounded" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{label}</span>
            {isOverridden && (
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="end">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold">Project Logo</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isOverridden
                  ? 'Using a custom logo for this project'
                  : 'Using your brand\'s default logo'}
              </p>
            </div>

            {activeLogoUrl && (
              <div className="flex items-center justify-center p-4 bg-muted/30 rounded-xl border border-border/50">
                <img src={activeLogoUrl} alt="Current logo" className="max-h-16 max-w-full object-contain" />
              </div>
            )}

            {brandLogoUrl && isOverridden && (
              <div className="flex items-center gap-2 p-2 bg-muted/20 rounded-lg text-xs text-muted-foreground">
                <img src={brandLogoUrl} alt="Brand logo" className="h-6 w-6 object-contain rounded opacity-60" />
                <span>Brand default</span>
              </div>
            )}

            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload Project Logo'}
              </Button>

              {isOverridden && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Brand Logo
                </Button>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
