import React, { useState, useCallback } from 'react';
import { Video, Loader2, MapPin, Ruler, Eye, CheckCircle2, AlertCircle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { extractVideoFrames, analyzeVenueVideo, VenueAnalysis } from '@/services/venueVideoService';
import { cn } from '@/lib/utils';

interface VenueVideoUploaderProps {
  eventName: string;
  eventDescription?: string;
  onAnalysisComplete: (analysis: VenueAnalysis) => void;
  onFrameSelect?: (frameData: string) => void;
  className?: string;
}

type ProcessingStage = 'idle' | 'extracting' | 'analyzing' | 'complete' | 'error';

export const VenueVideoUploader: React.FC<VenueVideoUploaderProps> = ({
  eventName,
  eventDescription,
  onAnalysisComplete,
  onFrameSelect,
  className,
}) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<ProcessingStage>('idle');
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<VenueAnalysis | null>(null);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVideoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('Please upload a video file');
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError('Video must be under 100MB');
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setAnalysis(null);
    setSelectedFrameIndex(null);
    setStage('idle');
    setProgress(0);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!videoFile) return;

    try {
      setStage('extracting');
      setProgress(10);
      setError(null);

      // Extract frames from video
      const frames = await extractVideoFrames(videoFile, 8);
      setProgress(40);

      setStage('analyzing');
      setProgress(50);

      // Analyze frames with AI
      const result = await analyzeVenueVideo(frames, eventName, eventDescription);
      setProgress(100);

      setAnalysis(result);
      setStage('complete');
      onAnalysisComplete(result);

    } catch (err) {
      console.error('Video analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze video');
      setStage('error');
    }
  }, [videoFile, eventName, eventDescription, onAnalysisComplete]);

  const handleFrameSelect = useCallback((index: number) => {
    setSelectedFrameIndex(index);
    if (analysis?.extractedFrames[index] && onFrameSelect) {
      onFrameSelect(analysis.extractedFrames[index]);
    }
  }, [analysis, onFrameSelect]);

  const getStageMessage = () => {
    switch (stage) {
      case 'extracting':
        return 'Extracting key frames from walkthrough...';
      case 'analyzing':
        return 'AI analyzing spatial dimensions & branding opportunities...';
      case 'complete':
        return 'Analysis complete!';
      case 'error':
        return 'Analysis failed';
      default:
        return 'Upload a venue walkthrough video';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Section */}
      <div className="relative">
        <label 
          className={cn(
            "flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all",
            "bg-muted/30 hover:bg-muted/50",
            videoPreviewUrl ? "border-primary/50" : "border-muted-foreground/30 hover:border-primary/50"
          )}
        >
          {videoPreviewUrl ? (
            <video 
              src={videoPreviewUrl} 
              className="w-full h-full object-cover rounded-xl"
              muted
              playsInline
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <Video className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold text-foreground">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">MP4, MOV, WebM (max 100MB)</p>
            </div>
          )}
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </label>

        {/* Badge */}
        <Badge 
          variant="secondary" 
          className="absolute -top-2 left-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0"
        >
          <Camera className="w-3 h-3 mr-1" />
          VENUE WALKTHROUGH
        </Badge>
      </div>

      {/* Video Info & Analyze Button */}
      {videoFile && stage === 'idle' && (
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium truncate max-w-[200px]">{videoFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button onClick={handleAnalyze} size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Analyze Venue
          </Button>
        </div>
      )}

      {/* Processing Status */}
      {(stage === 'extracting' || stage === 'analyzing') && (
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm">{getStageMessage()}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Error State */}
      {stage === 'error' && error && (
        <div className="p-4 bg-destructive/10 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Analysis Failed</p>
            <p className="text-xs text-muted-foreground">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleAnalyze} className="ml-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && stage === 'complete' && (
        <div className="space-y-4">
          {/* Success Banner */}
          <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Venue analysis complete!</span>
          </div>

          {/* Overall Assessment */}
          <div className="p-4 bg-muted/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium">{analysis.overallAssessment.venueType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Ruler className="w-4 h-4" />
              <span>Estimated Area: {analysis.overallAssessment.totalEstimatedArea}</span>
            </div>
            
            {/* Branding Opportunities */}
            {analysis.overallAssessment.brandingOpportunities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {analysis.overallAssessment.brandingOpportunities.slice(0, 4).map((opp, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {opp}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Extracted Frames Grid */}
          <div>
            <p className="text-sm font-medium mb-2">Key Frames (click to use as venue background)</p>
            <div className="grid grid-cols-4 gap-2">
              {analysis.keyFrames.slice(0, 8).map((frame, index) => (
                <button
                  key={index}
                  onClick={() => handleFrameSelect(index)}
                  className={cn(
                    "relative aspect-video rounded-lg overflow-hidden border-2 transition-all",
                    selectedFrameIndex === index 
                      ? "border-primary ring-2 ring-primary/30" 
                      : "border-transparent hover:border-primary/50"
                  )}
                >
                  <img 
                    src={frame.imageData} 
                    alt={frame.description}
                    className="w-full h-full object-cover"
                  />
                  {selectedFrameIndex === index && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Recommendations */}
          {analysis.assetRecommendations.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-3">Recommended Assets</p>
              <div className="space-y-2">
                {analysis.assetRecommendations.slice(0, 5).map((rec, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={rec.priority === 'high' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                      <span>{rec.assetType.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {rec.recommendedQuantity}x • {rec.suggestedSizes[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas Identified */}
          {analysis.areas.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-3">Areas Identified ({analysis.areas.length})</p>
              <div className="space-y-2">
                {analysis.areas.slice(0, 4).map((area, i) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{area.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ~{area.dimensions.estimated_width} × {area.dimensions.estimated_height}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{area.lightingConditions}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueVideoUploader;
