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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Loader2, Play, Download, Sparkles } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoTeaserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDescription?: string;
  onVideoGenerated?: (thumbnailUrl: string) => void;
}

export const VideoTeaserModal: React.FC<VideoTeaserModalProps> = ({
  open,
  onOpenChange,
  eventName,
  eventDescription,
  onVideoGenerated,
}) => {
  const [styleDescription, setStyleDescription] = useState('');
  const [duration, setDuration] = useState('5');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedThumbnail(null);
    setVideoStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          eventName,
          eventDescription,
          styleDescription,
          duration: parseInt(duration),
          aspectRatio,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedThumbnail(data.thumbnailUrl);
      setVideoStatus(data.message);
      toast.success('Video teaser generated!');

      if (onVideoGenerated) {
        onVideoGenerated(data.thumbnailUrl);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedThumbnail) {
      const link = document.createElement('a');
      link.href = generatedThumbnail;
      link.download = `${eventName.replace(/\s+/g, '-')}-video-teaser.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Thumbnail downloaded!');
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedThumbnail(null);
    setVideoStatus(null);
    setStyleDescription('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            AI Video Teaser Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-1">
            <p className="font-medium">{eventName}</p>
            {eventDescription && (
              <p className="text-sm text-muted-foreground">{eventDescription}</p>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="15">15 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait/Story)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style Description */}
          <div className="space-y-2">
            <Label>Visual Style (optional)</Label>
            <Textarea
              placeholder="Describe the visual style you want... (e.g., 'Cinematic with dramatic lighting', 'Colorful and energetic', 'Minimal and elegant')"
              value={styleDescription}
              onChange={(e) => setStyleDescription(e.target.value)}
              rows={3}
              disabled={isGenerating}
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Video Teaser...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Video Teaser
              </>
            )}
          </Button>

          {/* Generated Result */}
          {generatedThumbnail && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                <img
                  src={generatedThumbnail}
                  alt="Video teaser thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary ml-1" />
                  </div>
                </div>
              </div>
              {videoStatus && (
                <p className="text-sm text-muted-foreground text-center">{videoStatus}</p>
              )}
              <Button
                variant="outline"
                onClick={handleDownload}
                className="w-full gap-2"
              >
                <Download className="h-4 w-4" />
                Download Thumbnail
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
