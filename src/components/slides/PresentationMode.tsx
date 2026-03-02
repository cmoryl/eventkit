import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScaledSlide } from './ScaledSlide';

export type SlideTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'flip';

const transitionVariants: Record<SlideTransition, { initial: any; animate: any; exit: any }> = {
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  zoom: {
    initial: { scale: 0.6, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.4, opacity: 0 },
  },
  flip: {
    initial: { rotateY: 90, opacity: 0 },
    animate: { rotateY: 0, opacity: 1 },
    exit: { rotateY: -90, opacity: 0 },
  },
};

interface PresentationModeProps {
  children: (slideIndex: number) => React.ReactNode;
  slideCount: number;
  activeIndex: number;
  onIndexChange: (index: number) => void;
  onExit: () => void;
  transition?: SlideTransition;
}

export function PresentationMode({ children, slideCount, activeIndex, onIndexChange, onExit, transition = 'fade' }: PresentationModeProps) {
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx: number) => {
    setDirection(idx > activeIndex ? 1 : -1);
    onIndexChange(idx);
  }, [activeIndex, onIndexChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          if (activeIndex < slideCount - 1) goTo(activeIndex + 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          if (activeIndex > 0) goTo(activeIndex - 1);
          break;
        case 'Escape':
          e.preventDefault();
          onExit();
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(slideCount - 1);
          break;
      }
    },
    [activeIndex, slideCount, goTo, onExit]
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

  const tv = transitionVariants[transition];
  const slideInitial = transition === 'slide'
    ? { x: direction > 0 ? '100%' : '-100%', opacity: 0 }
    : tv.initial;
  const slideExit = transition === 'slide'
    ? { x: direction > 0 ? '-100%' : '100%', opacity: 0 }
    : tv.exit;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden" style={{ perspective: transition === 'flip' ? 1200 : undefined }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeIndex}
          initial={slideInitial}
          animate={tv.animate}
          exit={slideExit}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full flex items-center justify-center"
        >
          <ScaledSlide>{children(activeIndex)}</ScaledSlide>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 text-white/60 text-sm font-medium">
        {activeIndex + 1} / {slideCount}
      </div>
      <div className="absolute bottom-4 left-4 text-white/40 text-xs">
        ← → to navigate • Esc to exit
      </div>
    </div>
  );
}
