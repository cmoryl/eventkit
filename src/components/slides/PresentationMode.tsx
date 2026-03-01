import React, { useEffect, useCallback } from 'react';
import { ScaledSlide } from './ScaledSlide';

interface PresentationModeProps {
  children: (slideIndex: number) => React.ReactNode;
  slideCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
}

export function PresentationMode({ children, slideCount, activeIndex, onIndexChange, onExit }: PresentationModeProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          if (activeIndex < slideCount - 1) onIndexChange(activeIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (activeIndex > 0) onIndexChange(activeIndex - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'Home':
          e.preventDefault();
          onIndexChange(0);
          break;
        case 'End':
          e.preventDefault();
          onIndexChange(slideCount - 1);
          break;
      }
    },
    [activeIndex, slideCount, onIndexChange, onExit]
  );

  useEffect(() => {
    const enterFullscreen = async () => {
      try { await document.documentElement.requestFullscreen(); } catch {}
    };
    enterFullscreen();
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  useEffect(() => {
    const handler = () => { if (!document.fullscreenElement) onExit(); };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onExit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
      <div className="w-full h-full flex items-center justify-center">
        <ScaledSlide>{children(activeIndex)}</ScaledSlide>
      </div>
      <div className="absolute bottom-4 right-4 text-white/60 text-sm font-medium">
        {activeIndex + 1} / {slideCount}
      </div>
      <div className="absolute bottom-4 left-4 text-white/40 text-xs">
        ← → to navigate • Esc to exit
      </div>
    </div>
  );
}
