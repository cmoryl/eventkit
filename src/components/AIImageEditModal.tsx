import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Wand2, Loader2, Palette, Sun, Moon, Zap, Brush, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIImageEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  eventName?: string;
  onImageEdited: (newImageUrl: string) => void;
}

const QUICK_ACTIONS = [
  { label: 'More vibrant', icon: Palette, instruction: 'Make the colors more vibrant and saturated' },
  { label: 'Brighten', icon: Sun, instruction: 'Brighten the image and add more light' },
  { label: 'Darken', icon: Moon, instruction: 'Create a darker, moodier atmosphere' },
  { label: 'Add energy', icon: Zap, instruction: 'Add dynamic elements and energy to the design' },
  { label: 'Soften', icon: Brush, instruction: 'Soften the design with gentler gradients and transitions' },
  { label: 'Refresh style', icon: RefreshCw, instruction: 'Reimagine with a fresh, modern aesthetic' },
];

export const AIImageEditModal: React.FC<AIImageEditModalProps> = ({
  open,
  onOpenChange,
  imageUrl,
  eventName,
  onImageEdited,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleEdit = async (editInstruction: string) => {
    if (!editInstruction.trim()) {
      toast.error('Please enter an instruction');
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('edit-image', {
        body: {
          imageBase64: imageUrl,
          instruction: editInstruction,
          eventName,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPreviewUrl(data.imageUrl);
      toast.success('Image edited successfully!');
    } catch (error) {
      console.error('Image edit error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to edit image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (previewUrl) {
      onImageEdited(previewUrl);
      onOpenChange(false);
      setPreviewUrl(null);
      setInstruction('');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPreviewUrl(null);
    setInstruction('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Image Editor
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Image */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Original</h4>
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={imageUrl}
                alt="Original"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Preview / Result */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {previewUrl ? 'Edited Result' : 'Preview'}
            </h4>
            <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="text-sm">AI is editing your image...</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Edited"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <Wand2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Enter an instruction or use a quick action</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleEdit(action.instruction)}
                disabled={isProcessing}
                className="gap-1.5"
              >
                <action.icon className="h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Instruction */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Custom Instruction</h4>
          <Textarea
            placeholder="Describe how you want to edit this image... (e.g., 'Add a subtle gradient overlay', 'Make it look more futuristic', 'Add geometric patterns')"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            rows={3}
            disabled={isProcessing}
          />
          <Button
            onClick={() => handleEdit(instruction)}
            disabled={isProcessing || !instruction.trim()}
            className="w-full gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Apply Edit
              </>
            )}
          </Button>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!previewUrl}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Use This Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
