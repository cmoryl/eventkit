import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, RectangleVertical } from 'lucide-react';

type FrameType = 'phone' | 'desktop' | 'story';

interface SocialDeviceFrameProps {
  assetType: string;
  imageUrl: string;
  className?: string;
}

const FRAME_CONFIG: Record<string, FrameType[]> = {
  SOCIAL_POST: ['phone', 'desktop'],
  SOCIAL_STORY: ['phone', 'story'],
  EMAIL_HEADER: ['desktop', 'phone'],
  LINKEDIN_BANNER: ['desktop', 'phone'],
  TWITTER_HEADER: ['desktop', 'phone'],
  YOUTUBE_THUMBNAIL: ['desktop', 'phone'],
  PODCAST_COVER: ['phone', 'desktop'],
  ZOOM_BACKGROUND: ['desktop'],
  EVENT_APP_SPLASH: ['phone'],
};

export const SOCIAL_FRAME_TYPES = new Set(Object.keys(FRAME_CONFIG));

const FrameIcon: React.FC<{ type: FrameType; className?: string }> = ({ type, className }) => {
  switch (type) {
    case 'phone': return <Smartphone className={className} />;
    case 'desktop': return <Monitor className={className} />;
    case 'story': return <RectangleVertical className={className} />;
  }
};

const PhoneFrame: React.FC<{ imageUrl: string; isStory?: boolean }> = ({ imageUrl, isStory }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/60 p-3">
    <div className={cn(
      "relative bg-background rounded-[1.2rem] border-[3px] border-foreground/20 shadow-xl overflow-hidden",
      isStory ? "w-[55%] h-[92%]" : "w-[60%] h-[85%]"
    )}>
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[3%] bg-foreground/20 rounded-b-lg z-10" />
      {/* Status bar */}
      <div className="h-[5%] bg-foreground/5 flex items-center justify-between px-3">
        <span className="text-[5px] text-muted-foreground font-medium">9:41</span>
        <div className="flex gap-0.5">
          <div className="w-1.5 h-1 rounded-sm bg-muted-foreground/40" />
          <div className="w-1.5 h-1 rounded-sm bg-muted-foreground/40" />
          <div className="w-2 h-1 rounded-sm bg-muted-foreground/40" />
        </div>
      </div>
      {/* App bar */}
      {!isStory && (
        <div className="h-[6%] bg-foreground/5 border-b border-border/40 flex items-center px-2 gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          <div className="w-10 h-1.5 rounded bg-muted-foreground/15" />
        </div>
      )}
      {/* Content */}
      <div className={cn("w-full overflow-hidden", isStory ? "h-[95%]" : "h-[89%]")}>
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
    </div>
  </div>
);

const DesktopFrame: React.FC<{ imageUrl: string }> = ({ imageUrl }) => (
  <div className="w-full h-full flex items-center justify-center bg-muted/60 p-3">
    <div className="relative w-[88%] h-[82%] bg-background rounded-lg border-[3px] border-foreground/20 shadow-xl overflow-hidden flex flex-col">
      {/* Browser bar */}
      <div className="h-[10%] min-h-[14px] bg-foreground/5 border-b border-border/40 flex items-center px-2 gap-1.5">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 mx-2 h-[55%] rounded bg-muted/80 flex items-center px-1.5">
          <span className="text-[4px] text-muted-foreground truncate">https://platform.com/feed</span>
        </div>
      </div>
      {/* Page content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-[18%] bg-foreground/[0.03] border-r border-border/30 p-1.5 space-y-1.5 hidden sm:block">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full h-1.5 rounded bg-muted-foreground/10" />
          ))}
        </div>
        {/* Main feed */}
        <div className="flex-1 p-1.5">
          <div className="w-full h-full rounded overflow-hidden">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SocialDeviceFrame: React.FC<SocialDeviceFrameProps> = ({ assetType, imageUrl, className }) => {
  const frames = FRAME_CONFIG[assetType] ?? ['phone'];
  const [activeFrame, setActiveFrame] = useState<FrameType>(frames[0]);

  return (
    <div className={cn("w-full h-full relative", className)}>
      {activeFrame === 'phone' && <PhoneFrame imageUrl={imageUrl} />}
      {activeFrame === 'story' && <PhoneFrame imageUrl={imageUrl} isStory />}
      {activeFrame === 'desktop' && <DesktopFrame imageUrl={imageUrl} />}

      {/* Frame switcher */}
      {frames.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1 bg-background/80 backdrop-blur-sm rounded-full p-0.5 border border-border/50 shadow-sm">
          {frames.map(frame => (
            <button
              key={frame}
              onClick={(e) => { e.stopPropagation(); setActiveFrame(frame); }}
              className={cn(
                "p-1.5 rounded-full transition-all",
                activeFrame === frame
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title={frame.charAt(0).toUpperCase() + frame.slice(1)}
            >
              <FrameIcon type={frame} className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SocialDeviceFrame;
