import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play, Pause, Plus, Trash2, Edit2, Download, Upload,
  ArrowLeft, X, Loader2, Scissors
} from "lucide-react";
import { useVideoEditor as useVideoStudioEditor } from "@/hooks/useVideoStudioEditor";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VideoTimeline } from "./VideoTimeline";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { formatResolutionString } from "@/lib/videoFormatUtils";

interface Segment {
  id: string;
  start_time: number;
  end_time: number;
}

interface FormatSettings {
  aspectRatio: "16:9" | "9:16" | "1:1";
  cropMode: "fit" | "fill";
  resolution: "480p" | "720p" | "1080p" | "1440p" | "4k";
}

type ExportFormat = "mp4" | "webm" | "gif";

const FORMAT_LABELS: Record<ExportFormat, string> = {
  mp4: "MP4 (H.264)",
  webm: "WebM (VP9)",
  gif: "GIF (Animated)",
};

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  mp4: "mp4",
  webm: "webm",
  gif: "gif",
};

interface VideoStudioEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VideoStudioEditor({ isOpen, onClose }: VideoStudioEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    trimVideo,
    concatenateVideos,
    loadFFmpeg,
    isLoading: isTrimming,
    isFFmpegLoaded,
    progress,
  } = useVideoStudioEditor();

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoName, setVideoName] = useState("");
  const [originalResolution, setOriginalResolution] = useState("");
  const [projectName, setProjectName] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [activeSegmentId, setActiveSegmentId] = useState<string>("");
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    aspectRatio: "16:9",
    cropMode: "fit",
    resolution: "1080p",
  });
  const [exportSpeed, setExportSpeed] = useState<"quality" | "fast">("quality");
  const [exportMode, setExportMode] = useState<"combined" | "separate">("separate");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("mp4");
  const [videoPlayerWidth, setVideoPlayerWidth] = useState(50);
  const [exporting, setExporting] = useState(false);

  const activeSegment = segments.find((s) => s.id === activeSegmentId) || segments[0];

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file (MP4, WebM)");
      return;
    }
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Video must be under 200MB");
      return;
    }

    videoFileRef.current = file;
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
    setProjectName(file.name.replace(/\.[^/.]+$/, "") + " - Edited");

    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      const dur = video.duration;
      setVideoDuration(dur);
      setOriginalResolution(`${video.videoWidth}x${video.videoHeight}`);
      const seg: Segment = { id: "segment-0", start_time: 0, end_time: dur };
      setSegments([seg]);
      setActiveSegmentId(seg.id);
    };
  }, []);

  // Video time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSegment) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      if (time >= activeSegment.end_time) {
        const idx = segments.findIndex((s) => s.id === activeSegmentId);
        const next = segments[idx + 1];
        if (next && isPlaying) {
          video.currentTime = next.start_time;
          setActiveSegmentId(next.id);
        } else {
          video.currentTime = segments[0].start_time;
          setActiveSegmentId(segments[0].id);
          if (!isPlaying) video.pause();
        }
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [activeSegment, activeSegmentId, segments, isPlaying]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video || !activeSegment) return;
    if (isPlaying) {
      video.pause();
    } else {
      if (video.currentTime >= activeSegment.end_time || video.currentTime < activeSegment.start_time) {
        video.currentTime = activeSegment.start_time;
      }
      video.play();
    }
  };

  const handleSeek = (time: number, segmentId?: string) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = time;
    setCurrentTime(time);
    if (segmentId) setActiveSegmentId(segmentId);
  };

  const handleAddSegment = () => {
    const seg: Segment = {
      id: `segment-${Date.now()}`,
      start_time: 0,
      end_time: Math.min(10, videoDuration),
    };
    setSegments([...segments, seg]);
    setActiveSegmentId(seg.id);
    setEditingSegmentId(seg.id);
    toast.success("Segment added");
  };

  const handleRemoveSegment = (id: string) => {
    if (segments.length === 1) {
      toast.error("At least one segment is required");
      return;
    }
    const newSegments = segments.filter((s) => s.id !== id);
    setSegments(newSegments);
    if (activeSegmentId === id) setActiveSegmentId(newSegments[0].id);
  };

  const handleSegmentTimeChange = (id: string, start: number, end: number) => {
    setSegments(segments.map((s) => (s.id === id ? { ...s, start_time: start, end_time: end } : s)));
  };

  const handleExport = async () => {
    if (!videoFileRef.current || segments.length === 0) return;

    setExporting(true);
    try {
      if (!isFFmpegLoaded) {
        toast.info("Loading video processing engine...");
        const loaded = await loadFFmpeg();
        if (!loaded) throw new Error("Failed to initialize video engine");
      }

      const resolutionStr = formatResolutionString(formatSettings);
      const ext = FORMAT_EXTENSIONS[exportFormat];

      if (exportFormat === "gif" && exportMode === "combined" && segments.length > 1) {
        toast.info("GIF export uses separate mode for multiple segments");
      }

      const useSeparate = exportMode === "separate" || (exportFormat === "gif" && segments.length > 1);

      if (useSeparate) {
        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          toast.info(`Processing segment ${i + 1}/${segments.length}...`);
          const blob = await trimVideo(videoFileRef.current!, seg.start_time, seg.end_time, formatSettings, exportSpeed, exportFormat);
          if (!blob) throw new Error(`Failed segment ${i + 1}`);

          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${projectName}_${resolutionStr}_segment_${i + 1}.${ext}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        toast.success(`${segments.length} ${ext.toUpperCase()} file(s) exported!`);
      } else {
        const blobs: Blob[] = [];
        for (let i = 0; i < segments.length; i++) {
          toast.info(`Processing segment ${i + 1}/${segments.length}...`);
          const blob = await trimVideo(videoFileRef.current!, segments[i].start_time, segments[i].end_time, formatSettings, exportSpeed, exportFormat);
          if (!blob) throw new Error(`Failed segment ${i + 1}`);
          blobs.push(blob);
        }
        toast.info("Merging segments...");
        const combined = await concatenateVideos(blobs);
        const url = URL.createObjectURL(combined);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName}_${resolutionStr}_combined.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Combined ${ext.toUpperCase()} exported!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = () => segments.reduce((t, s) => t + (s.end_time - s.start_time), 0);

  const getVideoContainerStyle = () => {
    const ratios = { "16:9": 16 / 9, "9:16": 9 / 16, "1:1": 1 };
    return { aspectRatio: (ratios[formatSettings.aspectRatio] || ratios["16:9"]).toString(), maxWidth: "100%", margin: "0 auto" };
  };

  const getVideoStyle = (): React.CSSProperties => ({
    objectFit: formatSettings.cropMode === "fill" ? "cover" : "contain",
  });

  const getAvailableResolutions = () => {
    const all = [
      { value: "480p", label: "480p (854×480)", height: 480 },
      { value: "720p", label: "720p (1280×720)", height: 720 },
      { value: "1080p", label: "1080p (1920×1080)", height: 1080 },
      { value: "1440p", label: "1440p (2560×1440)", height: 1440 },
      { value: "4k", label: "4K (3840×2160)", height: 2160 },
    ];
    if (!originalResolution) return all;
    const match = originalResolution.match(/(\d+)x(\d+)/);
    if (!match) return all;
    const origH = parseInt(match[2]);
    return all.filter((r) => r.height <= origH);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent
        className="max-w-[100vw] w-[100vw] h-[100vh] p-0 overflow-hidden rounded-none border-none"
        hideClose
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full bg-background">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b bg-card shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Video Studio
                </h2>
                {videoUrl && <p className="text-xs text-muted-foreground">{videoName}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!videoUrl && (
                <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Upload Video
                </Button>
              )}
              {videoUrl && (
                <>
                  <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    New Video
                  </Button>
                  <Button size="sm" onClick={handleExport} disabled={exporting || isTrimming}>
                    {exporting || isTrimming ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    Export
                  </Button>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm"
            className="hidden"
            onChange={handleFileUpload}
          />

          {/* Main content */}
          {!videoUrl ? (
            <div className="flex-1 flex items-center justify-center">
              <div
                className="border-2 border-dashed border-primary/40 rounded-xl p-16 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload your video</h3>
                <p className="text-sm text-muted-foreground">Supports MP4 and WebM • Max 200MB</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Export progress */}
              {(isTrimming || exporting) && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Exporting Video</h3>
                      <Badge variant="secondary">{Math.round(progress)}%</Badge>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">Do not close this window.</p>
                  </div>
                </Card>
              )}

              {/* Project name */}
              <div className="space-y-2 max-w-md">
                <Label>Project Name</Label>
                <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
              </div>

              {/* Format settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Format Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Aspect Ratio</Label>
                    <Select value={formatSettings.aspectRatio} onValueChange={(v: FormatSettings["aspectRatio"]) => setFormatSettings({ ...formatSettings, aspectRatio: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                        <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Crop Mode</Label>
                    <Select value={formatSettings.cropMode} onValueChange={(v: FormatSettings["cropMode"]) => setFormatSettings({ ...formatSettings, cropMode: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fit">Fit (Add Bars)</SelectItem>
                        <SelectItem value="fill">Fill (Crop Edges)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Resolution</Label>
                    <Select value={formatSettings.resolution} onValueChange={(v: FormatSettings["resolution"]) => setFormatSettings({ ...formatSettings, resolution: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {getAvailableResolutions().map((r) => (
                          <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {originalResolution && <p className="text-xs text-muted-foreground">Original: {originalResolution}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select value={exportFormat} onValueChange={(v: ExportFormat) => setExportFormat(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FORMAT_LABELS) as ExportFormat[]).map((fmt) => (
                          <SelectItem key={fmt} value={fmt}>{FORMAT_LABELS[fmt]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {exportFormat === "gif" && (
                      <p className="text-xs text-muted-foreground">15 fps, palette-optimized</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Export Speed</Label>
                    <Select value={exportSpeed} onValueChange={(v: "quality" | "fast") => setExportSpeed(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quality">Quality</SelectItem>
                        <SelectItem value="fast">Fast (2× faster)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Export Mode</Label>
                    <Select
                      value={exportFormat === "gif" && segments.length > 1 ? "separate" : exportMode}
                      onValueChange={(v: "combined" | "separate") => setExportMode(v)}
                      disabled={exportFormat === "gif" && segments.length > 1}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="separate">Separate Files</SelectItem>
                        <SelectItem value="combined">One Combined File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Video Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Video Preview</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Size</span>
                    <Slider
                      value={[videoPlayerWidth]}
                      onValueChange={(v) => setVideoPlayerWidth(v[0])}
                      min={30} max={80} step={5}
                      className="w-28"
                    />
                  </div>
                </div>

                <div
                  className="relative bg-black rounded-lg overflow-hidden mx-auto"
                  style={{ width: `${videoPlayerWidth}%`, ...getVideoContainerStyle() }}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full"
                    style={getVideoStyle()}
                    onLoadedMetadata={() => {
                      if (videoRef.current && segments.length > 0) {
                        videoRef.current.currentTime = segments[0].start_time;
                      }
                    }}
                  />
                </div>

                {/* Overview timeline */}
                <div className="space-y-2 px-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0:00</span>
                    <span>Timeline Overview</span>
                    <span>{formatTime(videoDuration)}</span>
                  </div>
                  <div className="relative h-8 bg-muted rounded-md overflow-hidden">
                    {segments.map((seg, i) => {
                      const startPct = (seg.start_time / videoDuration) * 100;
                      const widthPct = ((seg.end_time - seg.start_time) / videoDuration) * 100;
                      return (
                        <div
                          key={seg.id}
                          className="absolute top-0 bottom-0 bg-primary/60 hover:bg-primary/80 transition-colors cursor-pointer border-l border-r border-primary-foreground/20"
                          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                          title={`Segment ${i + 1}: ${formatTime(seg.start_time)} – ${formatTime(seg.end_time)}`}
                          onClick={() => setActiveSegmentId(seg.id)}
                        >
                          <div className="flex items-center justify-center h-full text-[10px] font-semibold text-primary-foreground">
                            {i + 1}
                          </div>
                        </div>
                      );
                    })}
                    {currentTime > 0 && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10"
                        style={{ left: `${(currentTime / videoDuration) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-primary/60 rounded-sm" />
                      <span>Kept</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-muted rounded-sm border border-border" />
                      <span>Trimmed</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button size="lg" variant="secondary" onClick={handlePlayPause} className="gap-2">
                    {isPlaying ? <><Pause className="h-5 w-5" /> Pause</> : <><Play className="h-5 w-5" /> Play Preview</>}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Segments */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Segments</h3>
                  <Button onClick={handleAddSegment} size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Segment
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click a segment to select it, then use the timeline below to adjust start/end times.
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {segments.map((seg, i) => (
                    <div
                      key={seg.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        activeSegmentId === seg.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => {
                        setActiveSegmentId(seg.id);
                        handleSeek(seg.start_time, seg.id);
                      }}
                    >
                      <Badge variant={activeSegmentId === seg.id ? "default" : "secondary"}>
                        #{i + 1}
                      </Badge>
                      <div className="flex-1 text-sm">
                        <span className="font-medium">{formatTime(seg.start_time)} – {formatTime(seg.end_time)}</span>
                        <span className="text-muted-foreground ml-2">({formatTime(seg.end_time - seg.start_time)})</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSegmentId(seg.id === editingSegmentId ? null : seg.id);
                            setActiveSegmentId(seg.id);
                          }}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSegment(seg.id);
                          }}
                          disabled={segments.length === 1}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed timeline for active segment */}
              {editingSegmentId && activeSegment && (
                <VideoTimeline
                  duration={videoDuration}
                  currentTime={currentTime}
                  startTime={activeSegment.start_time}
                  endTime={activeSegment.end_time}
                  onStartTimeChange={(t) => handleSegmentTimeChange(activeSegmentId, t, activeSegment.end_time)}
                  onEndTimeChange={(t) => handleSegmentTimeChange(activeSegmentId, activeSegment.start_time, t)}
                  onSeek={(t) => handleSeek(t, activeSegmentId)}
                  videoElement={videoRef.current}
                />
              )}

              {/* Stats */}
              <div className="flex gap-4 text-sm text-muted-foreground pb-4">
                <div><span className="font-medium">Original:</span> {formatTime(videoDuration)}</div>
                <div><span className="font-medium">Output:</span> {formatTime(getTotalDuration())}</div>
                <div><span className="font-medium">Segments:</span> {segments.length}</div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
