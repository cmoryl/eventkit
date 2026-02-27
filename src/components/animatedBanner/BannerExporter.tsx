import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Film, Image, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { AnimatedBannerConfig } from '@/config/animationPresets';
import html2canvas from 'html2canvas';

interface BannerExporterProps {
  isOpen: boolean;
  onClose: () => void;
  config: AnimatedBannerConfig;
  canvasRef: React.RefObject<HTMLDivElement>;
}

type ExportFormat = 'gif' | 'webm' | 'png-sequence' | 'mp4';
type ExportStatus = 'idle' | 'recording' | 'processing' | 'complete' | 'error';

export const BannerExporter: React.FC<BannerExporterProps> = ({
  isOpen,
  onClose,
  config,
  canvasRef,
}) => {
  const [format, setFormat] = useState<ExportFormat>('webm');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const exportAsWebM = useCallback(async () => {
    if (!canvasRef.current) {
      toast.error('Canvas not available');
      return;
    }

    setStatus('recording');
    setProgress(0);
    setErrorMsg(null);

    try {
      // Create an offscreen canvas for recording
      const element = canvasRef.current;
      const fps = quality === 'high' ? 30 : 15;
      const totalFrames = Math.ceil(config.totalDuration * fps);
      const frameInterval = 1000 / fps;

      // Use html2canvas to capture frames
      const frames: Blob[] = [];
      
      for (let i = 0; i < totalFrames; i++) {
        const canvas = await html2canvas(element, {
          width: config.canvasWidth,
          height: config.canvasHeight,
          scale: 1,
          backgroundColor: null,
          logging: false,
          useCORS: true,
        });

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => {
            if (b) resolve(b);
            else reject(new Error('Frame capture failed'));
          }, 'image/png');
        });

        frames.push(blob);
        setProgress(Math.round(((i + 1) / totalFrames) * 70));
        
        // Small delay to allow animation to advance
        await new Promise(r => setTimeout(r, frameInterval));
      }

      setStatus('processing');
      setProgress(80);

      // For WebM: use canvas + MediaRecorder
      const offCanvas = document.createElement('canvas');
      offCanvas.width = config.canvasWidth;
      offCanvas.height = config.canvasHeight;
      const ctx = offCanvas.getContext('2d')!;
      
      const stream = offCanvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: quality === 'high' ? 5000000 : 2500000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingDone = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
      });

      mediaRecorder.start();

      // Draw each captured frame to the canvas
      for (let i = 0; i < frames.length; i++) {
        const img = await createImageBitmap(frames[i]);
        ctx.clearRect(0, 0, offCanvas.width, offCanvas.height);
        ctx.drawImage(img, 0, 0);
        setProgress(80 + Math.round(((i + 1) / frames.length) * 15));
        await new Promise(r => setTimeout(r, frameInterval));
      }

      mediaRecorder.stop();
      const videoBlob = await recordingDone;

      setProgress(100);
      setStatus('complete');

      // Trigger download
      downloadBlob(videoBlob, `${config.name || 'animated-banner'}.webm`);
      toast.success('Video exported successfully!');
    } catch (err) {
      console.error('Export failed:', err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
      toast.error('Export failed');
    }
  }, [canvasRef, config, quality]);

  const exportAsPngSequence = useCallback(async () => {
    if (!canvasRef.current) return;

    setStatus('recording');
    setProgress(0);

    try {
      const element = canvasRef.current;
      const fps = 10;
      const totalFrames = Math.ceil(config.totalDuration * fps);
      const frameInterval = 1000 / fps;

      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      const folder = zip.folder('frames');

      for (let i = 0; i < totalFrames; i++) {
        const canvas = await html2canvas(element, {
          width: config.canvasWidth,
          height: config.canvasHeight,
          scale: 1,
          backgroundColor: null,
          logging: false,
          useCORS: true,
        });

        const dataUrl = canvas.toDataURL('image/png');
        const base64 = dataUrl.split(',')[1];
        folder?.file(`frame_${String(i).padStart(4, '0')}.png`, base64, { base64: true });
        
        setProgress(Math.round(((i + 1) / totalFrames) * 90));
        await new Promise(r => setTimeout(r, frameInterval));
      }

      setStatus('processing');
      setProgress(95);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${config.name || 'animated-banner'}_frames.zip`);

      setProgress(100);
      setStatus('complete');
      toast.success('PNG sequence exported!');
    } catch (err) {
      console.error('Export failed:', err);
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
    }
  }, [canvasRef, config]);

  const exportAsStaticPng = useCallback(async () => {
    if (!canvasRef.current) return;

    setStatus('processing');
    setProgress(50);

    try {
      const canvas = await html2canvas(canvasRef.current, {
        width: config.canvasWidth,
        height: config.canvasHeight,
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${config.name || 'banner'}.png`);
          setProgress(100);
          setStatus('complete');
          toast.success('PNG exported!');
        }
      }, 'image/png');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Export failed');
    }
  }, [canvasRef, config]);

  const handleExport = useCallback(() => {
    switch (format) {
      case 'webm':
      case 'mp4':
      case 'gif':
        exportAsWebM();
        break;
      case 'png-sequence':
        exportAsPngSequence();
        break;
      default:
        exportAsStaticPng();
    }
  }, [format, exportAsWebM, exportAsPngSequence, exportAsStaticPng]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Animated Banner
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-sm">Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webm">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" /> WebM Video (recommended)
                  </div>
                </SelectItem>
                <SelectItem value="gif">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4" /> Animated GIF
                  </div>
                </SelectItem>
                <SelectItem value="png-sequence">
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" /> PNG Sequence (ZIP)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <Label className="text-sm">Quality</Label>
            <Select value={quality} onValueChange={(v) => setQuality(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (15fps, faster)</SelectItem>
                <SelectItem value="high">High (30fps, slower)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg space-y-1">
            <p>📐 Output: {config.canvasWidth}×{config.canvasHeight}px</p>
            <p>⏱ Duration: {config.totalDuration}s</p>
            <p>🎞 Layers: {config.layers.length}</p>
            {format === 'gif' && (
              <p className="text-amber-500">⚠ GIF export uses WebM format. Convert to GIF using an online tool for best results.</p>
            )}
          </div>

          {/* Progress */}
          {status !== 'idle' && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex items-center gap-2 text-xs">
                {status === 'recording' && <Loader2 className="w-3 h-3 animate-spin" />}
                {status === 'processing' && <Loader2 className="w-3 h-3 animate-spin" />}
                {status === 'complete' && <CheckCircle className="w-3 h-3 text-primary" />}
                {status === 'error' && <AlertCircle className="w-3 h-3 text-destructive" />}
                <span className="text-muted-foreground">
                  {status === 'recording' && 'Recording frames...'}
                  {status === 'processing' && 'Processing video...'}
                  {status === 'complete' && 'Export complete!'}
                  {status === 'error' && (errorMsg || 'Export failed')}
                </span>
              </div>
            </div>
          )}

          {/* Action */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleExport} 
              disabled={status === 'recording' || status === 'processing'}
              className="gap-2"
            >
              {(status === 'recording' || status === 'processing') ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {status === 'complete' ? 'Export Again' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
