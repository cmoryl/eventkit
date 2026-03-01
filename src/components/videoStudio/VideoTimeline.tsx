import { useEffect, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";
import { extractVideoFrames } from "@/lib/videoFrameUtils";

interface VideoTimelineProps {
  duration: number;
  currentTime: number;
  startTime: number;
  endTime: number;
  onStartTimeChange: (time: number) => void;
  onEndTimeChange: (time: number) => void;
  onSeek: (time: number) => void;
  videoElement?: HTMLVideoElement | null;
}

export const VideoTimeline = ({
  duration,
  currentTime,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  onSeek,
  videoElement,
}: VideoTimelineProps) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | 'playhead' | null>(null);
  const [frameThumbnails, setFrameThumbnails] = useState<string[]>([]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getTimeFromPosition = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    return Math.max(0, Math.min(1, x / rect.width)) * duration;
  };

  const handleMouseDown = (type: 'start' | 'end' | 'playhead') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(type);
  };

  useEffect(() => {
    if (!videoElement || duration <= 0) return;
    const extract = async () => {
      try {
        const frames = await extractVideoFrames(videoElement, 10);
        setFrameThumbnails(frames);
      } catch (error) {
        console.error('Failed to extract video frames:', error);
      }
    };
    extract();
  }, [videoElement, duration]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const time = getTimeFromPosition(e.clientX);
      if (dragging === 'start') onStartTimeChange(Math.min(time, endTime - 0.1));
      else if (dragging === 'end') onEndTimeChange(Math.max(time, startTime + 0.1));
      else if (dragging === 'playhead') onSeek(Math.max(startTime, Math.min(time, endTime)));
    };
    const handleMouseUp = () => setDragging(null);

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, duration, startTime, endTime, onStartTimeChange, onEndTimeChange, onSeek]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (dragging) return;
    const time = getTimeFromPosition(e.clientX);
    onSeek(Math.max(startTime, Math.min(time, endTime)));
  };

  const startPct = (startTime / duration) * 100;
  const endPct = (endTime / duration) * 100;
  const currentPct = (currentTime / duration) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>In: {formatTime(startTime)}</span>
        <span>Duration: {formatTime(endTime - startTime)}</span>
        <span>Out: {formatTime(endTime)}</span>
      </div>

      <div
        ref={timelineRef}
        className="relative h-16 bg-muted rounded-lg cursor-pointer select-none overflow-hidden"
        onClick={handleTimelineClick}
      >
        {frameThumbnails.length > 0 && (
          <div className="absolute inset-0 flex pointer-events-none opacity-40">
            {frameThumbnails.map((frame, i) => (
              <img key={i} src={frame} alt="" className="flex-1 object-cover border-r border-border/20" />
            ))}
          </div>
        )}

        {/* Selected region */}
        <div
          className="absolute top-0 bottom-0 bg-primary/20 border-x-2 border-primary"
          style={{ left: `${startPct}%`, right: `${100 - endPct}%` }}
        />

        {/* Start handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize group"
          style={{ left: `${startPct}%` }}
          onMouseDown={handleMouseDown('start')}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-3 w-3 rotate-180" />
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(startTime)}
          </div>
        </div>

        {/* End handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize group"
          style={{ left: `${endPct}%` }}
          onMouseDown={handleMouseDown('end')}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 bg-primary text-primary-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="h-3 w-3" />
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(endTime)}
          </div>
        </div>

        {/* Playhead */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-foreground cursor-ew-resize z-10"
          style={{ left: `${currentPct}%` }}
          onMouseDown={handleMouseDown('playhead')}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground rounded-full" />
        </div>

        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 text-xs text-muted-foreground">
          <span>0:00</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};
