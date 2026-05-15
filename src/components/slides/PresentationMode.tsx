import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ScaledSlide } from './ScaledSlide';

export type SlideTransition = 'none' | 'fade' | 'slide' | 'zoom' | 'flip' | 'cube' | 'dissolve' | 'push' | 'cover';

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
  cube: {
    initial: { rotateY: 90, x: '50%', opacity: 0, transformOrigin: 'left center' },
    animate: { rotateY: 0, x: 0, opacity: 1 },
    exit: { rotateY: -90, x: '-50%', opacity: 0, transformOrigin: 'right center' },
  },
  dissolve: {
    initial: { opacity: 0, filter: 'blur(24px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(24px)' },
  },
  push: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  cover: {
    initial: { x: '100%', scale: 1, opacity: 1 },
    animate: { x: 0, scale: 1, opacity: 1 },
    exit: { x: 0, scale: 0.92, opacity: 0.4 },
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
  let slideInitial = tv.initial;
  let slideExit = tv.exit;
  if (transition === 'slide' || transition === 'cover') {
    slideInitial = { x: direction > 0 ? '100%' : '-100%', opacity: transition === 'cover' ? 1 : 0 };
    slideExit = transition === 'cover'
      ? { x: 0, scale: 0.92, opacity: 0.4 }
      : { x: direction > 0 ? '-100%' : '100%', opacity: 0 };
  } else if (transition === 'push') {
    slideInitial = { y: direction > 0 ? '100%' : '-100%', opacity: 0 };
    slideExit = { y: direction > 0 ? '-100%' : '100%', opacity: 0 };
  } else if (transition === 'cube') {
    slideInitial = {
      rotateY: direction > 0 ? 90 : -90,
      x: direction > 0 ? '50%' : '-50%',
      opacity: 0,
      transformOrigin: direction > 0 ? 'left center' : 'right center',
    };
    slideExit = {
      rotateY: direction > 0 ? -90 : 90,
      x: direction > 0 ? '-50%' : '50%',
      opacity: 0,
      transformOrigin: direction > 0 ? 'right center' : 'left center',
    };
  }

  const needsPerspective = transition === 'flip' || transition === 'cube';

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden" style={{ perspective: needsPerspective ? 1400 : undefined }}>
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
