import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Loader2, Play, Download, Sparkles, Cpu, Clock, Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';
import { getUserRenderEngines } from '@/services/aiBrain/renderEngineService';
import type { RenderEngine } from '@/services/aiBrain/types';

interface VideoTeaserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
  eventDescription?: string;
  onVideoGenerated?: (thumbnailUrl: string, videoUrl?: string) => void;
}

// Video engine options
const VIDEO_ENGINES = [
  {
    id: 'lovable',
    name: 'Lovable AI (Veo 3)',
    description: 'Google Veo 3 powered video generation',
    badge: 'Default',
    requiresKey: false,
  },
  {
    id: 'replicate',
    name: 'Replicate',
    description: 'Luma Ray, Minimax, and other video models',
    badge: 'Custom',
    requiresKey: true,
  },
];

export const VideoTeaserModal: React.FC<VideoTeaserModalProps> = ({
  open,
  onOpenChange,
  eventName,
  eventDescription,
  onVideoGenerated,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [styleDescription, setStyleDescription] = useState('');
  const [duration, setDuration] = useState('5');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1080p');
  const [selectedEngine, setSelectedEngine] = useState('lovable');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);
  const [userEngines, setUserEngines] = useState<RenderEngine[]>([]);
  const [generationTime, setGenerationTime] = useState<number | null>(null);
  const [startingFrame, setStartingFrame] = useState<string | null>(null);
  const [startingFramePreview, setStartingFramePreview] = useState<string | null>(null);

  // Load user's Replicate engines if available
  useEffect(() => {
    if (user?.id && open) {
      loadUserEngines();
    }
  }, [user?.id, open]);

  const loadUserEngines = async () => {
    if (!user?.id) return;
    const engines = await getUserRenderEngines(user.id);
    // Filter for Replicate engines (they support video)
    const replicateEngines = engines.filter(e => e.provider === 'replicate');
    setUserEngines(replicateEngines);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setStartingFrame(base64);
      setStartingFramePreview(base64);
      toast.success('Starting frame uploaded!');
    };
    reader.onerror = () => {
      toast.error('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStartingFrame = () => {
    setStartingFrame(null);
    setStartingFramePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedVideo(null);
    setGeneratedThumbnail(null);
    setVideoStatus(null);
    setGenerationTime(null);

    const startTime = Date.now();

    try {
      // Get API key for custom providers
      let apiKey: string | undefined;
      if (selectedEngine === 'replicate' && userEngines.length > 0) {
        apiKey = userEngines[0].apiKeyEncrypted;
      }

      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          eventName,
          eventDescription,
          styleDescription,
          duration: parseInt(duration),
          aspectRatio,
          resolution,
          provider: selectedEngine,
          apiKey,
          startingFrameBase64: startingFrame,
        },
      });

      const elapsed = Date.now() - startTime;
      setGenerationTime(elapsed);

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (data.videoUrl) {
        setGeneratedVideo(data.videoUrl);
        toast.success('Video generated successfully!');
      }
      
      if (data.thumbnailUrl) {
        setGeneratedThumbnail(data.thumbnailUrl);
      }
      
      setVideoStatus(data.message);

      if (onVideoGenerated) {
        onVideoGenerated(data.thumbnailUrl, data.videoUrl);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, type: 'video' | 'thumbnail') => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName.replace(/\s+/g, '-')}-${type === 'video' ? 'teaser.mp4' : 'thumbnail.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type === 'video' ? 'Video' : 'Thumbnail'} downloaded!`);
  };

  const handleClose = () => {
    onOpenChange(false);
    setGeneratedVideo(null);
    setGeneratedThumbnail(null);
    setVideoStatus(null);
    setStyleDescription('');
    setGenerationTime(null);
    setStartingFrame(null);
    setStartingFramePreview(null);
  };

  const canUseReplicate = userEngines.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            AI Video Teaser Generator
            <Badge variant="secondary" className="ml-2">Veo 3</Badge>
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

          {/* Engine Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Video Engine
              </CardTitle>
              <CardDescription className="text-xs">
                Choose which AI engine to use for video generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {VIDEO_ENGINES.map((engine) => {
                  const isDisabled = engine.requiresKey && !canUseReplicate;
                  const isSelected = selectedEngine === engine.id;
                  
                  return (
                    <button
                      key={engine.id}
                      onClick={() => !isDisabled && setSelectedEngine(engine.id)}
                      disabled={isDisabled}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary' 
                          : isDisabled
                            ? 'border-border/50 bg-muted/30 opacity-50 cursor-not-allowed'
                            : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{engine.name}</span>
                        <Badge variant={engine.badge === 'Default' ? 'default' : 'outline'} className="text-[10px]">
                          {engine.badge}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{engine.description}</p>
                      {engine.requiresKey && !canUseReplicate && (
                        <p className="text-xs text-amber-600 mt-1">Requires Replicate API key</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Starting Frame Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Starting Frame (Optional)
              </CardTitle>
              <CardDescription className="text-xs">
                Upload an image to animate into a video. Great for logos, posters, or event graphics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {startingFramePreview ? (
                <div className="relative">
                  <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={startingFramePreview}
                      alt="Starting frame preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={handleRemoveStartingFrame}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This image will be animated into video
                  </p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full h-24 border-dashed gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload Starting Frame</span>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio} disabled={!!startingFrame}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
              {startingFrame && (
                <p className="text-[10px] text-muted-foreground">Auto-detected from image</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Resolution</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="480p">480p (Fast)</SelectItem>
                  <SelectItem value="1080p">1080p (HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Style Description */}
          <div className="space-y-2">
            <Label>{startingFrame ? 'Motion Description' : 'Visual Style'} (optional)</Label>
            <Textarea
              placeholder={startingFrame 
                ? "Describe how the image should animate... (e.g., 'Gentle zoom with floating particles', 'Dynamic camera pan', 'Subtle breathing motion')"
                : "Describe the visual style you want... (e.g., 'Cinematic with dramatic lighting', 'Colorful and energetic', 'Minimal and elegant')"
              }
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
                Generating Video... This may take a moment
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Video Teaser
              </>
            )}
          </Button>

          {/* Generation Time */}
          {generationTime && (
            <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Generated in {(generationTime / 1000).toFixed(1)}s
            </p>
          )}

          {/* Generated Result */}
          {(generatedVideo || generatedThumbnail) && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
                {generatedVideo ? (
                  <video
                    src={generatedVideo}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : generatedThumbnail ? (
                  <>
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
                  </>
                ) : null}
              </div>
              
              {videoStatus && (
                <p className="text-sm text-muted-foreground text-center">{videoStatus}</p>
              )}
              
              <div className="flex gap-2">
                {generatedVideo && (
                  <Button
                    variant="default"
                    onClick={() => handleDownload(generatedVideo, 'video')}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Video
                  </Button>
                )}
                {generatedThumbnail && (
                  <Button
                    variant="outline"
                    onClick={() => handleDownload(generatedThumbnail, 'thumbnail')}
                    className="flex-1 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Thumbnail
                  </Button>
                )}
              </div>
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
