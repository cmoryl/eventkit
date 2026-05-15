import React, { useEffect, useRef, useState } from 'react';
import type { ParallaxLayer, SlideData } from './slideTypes';
import { DEFAULT_PARALLAX_LAYERS } from './slideTypes';

interface Props {
  slide: SlideData;
  /**
   * 'mouse'   – pointer-driven (in editor)
   * 'time'    – auto-drift sine wave (in presentation)
   * 'dolly'   – progress-driven push-in for MP4 export. Pass `progress` 0→1.
   * 'static'  – frozen at neutral (PPTX export, thumbnails)
   */
  motion?: 'mouse' | 'time' | 'dolly' | 'static';
  progress?: number;
  className?: string;
}

/**
 * Depth-aware renderer. Each ParallaxLayer is positioned with CSS perspective
 * and translateZ so that planes farther away (negative depth) appear deeper,
 * planes closer (positive depth) appear in front. The "camera" then translates
 * subtly on X/Y based on `motion`, producing real depth-of-field parallax.
 */
export function ParallaxRenderer({ slide, motion = 'time', progress = 0, className = '' }: Props) {
  const layers = slide.parallaxLayers && slide.parallaxLayers.length > 0
    ? slide.parallaxLayers
    : DEFAULT_PARALLAX_LAYERS;
  const intensity = slide.parallaxIntensity ?? 1;
  const variation = slide.variation || 'cinematic';

  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 }); // -1..1
  const [tick, setTick] = useState(0);

  // Mouse tracking — only when in editor
  useEffect(() => {
    if (motion !== 'mouse') return;
    const node = containerRef.current;
    if (!node) return;
    const onMove = (e: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setPointer({ x: nx, y: ny });
    };
    const onLeave = () => setPointer({ x: 0, y: 0 });
    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [motion]);

  // Time-based drift
  useEffect(() => {
    if (motion !== 'time') return;
    let raf = 0;
    const start = performance.now();
    const loop = (t: number) => {
      setTick((t - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [motion]);

  // Compute camera offset (-1..1 range) based on motion mode
  const camera = (() => {
    if (motion === 'mouse')   return { x: pointer.x, y: pointer.y, push: 0 };
    if (motion === 'dolly')   return { x: 0, y: 0, push: progress }; // 0..1
    if (motion === 'time') {
      return {
        x: Math.sin(tick * 0.4) * 0.6,
        y: Math.cos(tick * 0.3) * 0.4,
        push: (Math.sin(tick * 0.2) + 1) / 2 * 0.3, // gentle 0..0.3 breath
      };
    }
    return { x: 0, y: 0, push: 0 };
  })();

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{
        perspective: '1400px',
        perspectiveOrigin: '50% 50%',
        backgroundColor: slide.bgColor || '#0b1024',
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${camera.push * 80 * intensity}px)`,
          transition: motion === 'mouse' ? 'transform 220ms cubic-bezier(.22,.61,.36,1)' : 'none',
        }}
      >
        {layers.map((layer, i) => (
          <ParallaxPlane
            key={layer.id || i}
            layer={layer}
            cameraX={camera.x}
            cameraY={camera.y}
            intensity={intensity}
            variation={variation}
            motion={motion}
          />
        ))}
      </div>
    </div>
  );
}

function ParallaxPlane({
  layer, cameraX, cameraY, intensity, variation, motion,
}: {
  layer: ParallaxLayer;
  cameraX: number;
  cameraY: number;
  intensity: number;
  variation: string;
  motion: 'mouse' | 'time' | 'dolly' | 'static';
}) {
  // Normalize depth -100..+100 to a smooth z-translation in px and parallax weight.
  const z = layer.depth * 4;                    // -400..+400 px in 3D space
  const parallaxStrength = (layer.depth / 100); // 1 at front, -1 at back
  const camStrength = variation === 'tilt' ? 1.4 : variation === 'dolly' ? 0.4 : 1.0;
  const offsetX = cameraX * parallaxStrength * 60 * intensity * camStrength;
  const offsetY = cameraY * parallaxStrength * 40 * intensity * camStrength;

  // Depth-of-field blur — extreme planes get softer
  const dofBlur = (() => {
    if (typeof layer.blur === 'number') return layer.blur;
    const distance = Math.abs(layer.depth) / 100;     // 0..1
    if (distance < 0.3) return 0;
    if (layer.depth < 0) return Math.round(distance * 14); // far planes
    return Math.round(distance * 6);                       // foreground subtle
  })();

  const x = layer.x ?? 50;
  const y = layer.y ?? 50;
  const scale = layer.scale ?? 1;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    transform: `translate3d(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px), ${z}px) scale(${scale})`,
    transition: motion === 'mouse' ? 'transform 220ms cubic-bezier(.22,.61,.36,1)' : 'none',
    filter: dofBlur > 0 ? `blur(${dofBlur}px)` : undefined,
    opacity: layer.opacity ?? 1,
    willChange: 'transform',
  };

  if (layer.kind === 'image') {
    return (
      <img
        src={layer.content}
        alt=""
        draggable={false}
        style={{
          ...baseStyle,
          width: `${100 * scale}%`,
          height: `${100 * scale}%`,
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
    );
  }

  if (layer.kind === 'text') {
    return (
      <div
        style={{
          ...baseStyle,
          fontSize: layer.fontSize ?? 64,
          fontWeight: layer.fontWeight ?? 700,
          color: layer.color ?? '#ffffff',
          fontFamily: layer.fontFamily ?? 'inherit',
          whiteSpace: 'pre-wrap',
          textAlign: 'center',
          lineHeight: 1.05,
          letterSpacing: '-0.01em',
          textShadow: layer.depth > 0 ? '0 8px 30px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {layer.content}
      </div>
    );
  }

  // shape: gradient/color fill
  return (
    <div
      style={{
        ...baseStyle,
        width: `${80 * scale}%`,
        height: `${80 * scale}%`,
        background: layer.content,
        borderRadius: '50%',
      }}
    />
  );
}
