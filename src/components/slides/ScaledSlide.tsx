import React, { useRef, useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

export const SLIDE_WIDTH = 1920;
export const SLIDE_HEIGHT = 1080;
export const SLIDE_ASPECT_RATIO = SLIDE_WIDTH / SLIDE_HEIGHT;

export const SlideScaleContext = createContext<number>(1);

export function useSlideScale() {
  return useContext(SlideScaleContext);
}

interface ScaledSlideProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  showGrid?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function ScaledSlide({
  children,
  className,
  containerClassName,
  showGrid = false,
  onClick,
}: ScaledSlideProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      if (!parent) return;

      const availableWidth = parent.clientWidth;
      const availableHeight = parent.clientHeight;
      if (availableWidth === 0 || availableHeight === 0) return;

      const fitScale = Math.min(availableWidth / SLIDE_WIDTH, availableHeight / SLIDE_HEIGHT);
      setScale(fitScale);
      setDimensions({ width: SLIDE_WIDTH * fitScale, height: SLIDE_HEIGHT * fitScale });
    };

    const rafId = requestAnimationFrame(updateScale);
    const observer = new ResizeObserver(() => requestAnimationFrame(updateScale));
    const parent = containerRef.current?.parentElement;
    if (parent) observer.observe(parent);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  return (
    <SlideScaleContext.Provider value={scale}>
      <div
        ref={containerRef}
        className={cn("relative overflow-hidden flex-shrink-0", containerClassName)}
        style={{ width: dimensions.width || '100%', height: dimensions.height || 'auto' }}
      >
        <div
          className={cn("absolute top-0 left-0 rounded-lg shadow-xl overflow-hidden", className)}
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
          onClick={onClick}
        >
          {children}
        </div>
      </div>
    </SlideScaleContext.Provider>
  );
}

export function CenteredScaledSlide({
  children,
  className,
  containerClassName,
  onClick,
  zoom = 100,
}: ScaledSlideProps & { zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [baseScale, setBaseScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.offsetWidth;
      const h = containerRef.current.offsetHeight;
      if (w === 0 || h === 0) return;
      setBaseScale(Math.min(w / SLIDE_WIDTH, h / SLIDE_HEIGHT));
    };

    const rafId = requestAnimationFrame(updateScale);
    const observer = new ResizeObserver(() => requestAnimationFrame(updateScale));
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  const finalScale = baseScale * (zoom / 100);

  return (
    <SlideScaleContext.Provider value={finalScale}>
      <div
        ref={containerRef}
        className={cn("flex items-center justify-center w-full h-full overflow-hidden", containerClassName)}
      >
        <div
          className={cn("relative shadow-2xl rounded-lg overflow-hidden flex-shrink-0 isolate", className)}
          style={{
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            transform: `scale(${finalScale})`,
            transformOrigin: 'center center',
          }}
          onClick={onClick}
        >
          <div className="absolute inset-0">{children}</div>
        </div>
      </div>
    </SlideScaleContext.Provider>
  );
}
