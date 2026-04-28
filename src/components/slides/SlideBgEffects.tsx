import React, { useMemo } from 'react';
import type { SlideBgEffect } from './slideTypes';

interface SlideBgEffectRendererProps {
  effect: SlideBgEffect;
  /** Brand accent color used when effect.color is unset. */
  accentColor?: string;
}

const overlayBase: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  overflow: 'hidden',
};

/** Stable RNG seeded by index — keeps particles/orbs in the same place across re-renders. */
function rand(seed: number) {
  const x = Math.sin(seed * 9999.123) * 10000;
  return x - Math.floor(x);
}

function OrbsEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#6366f1';
  const count = Math.max(2, Math.min(6, effect.count ?? 3));
  const size = effect.size ?? 50;
  const blur = effect.blur ?? 80;
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.6;
  const orbs = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: rand(i + 1) * 100,
        y: rand(i + 2) * 100,
        delay: -rand(i + 3) * 16,
        duration: 14 + rand(i + 4) * 8,
        hueShift: i * 40,
      })),
    [count],
  );
  return (
    <div style={{ ...overlayBase, opacity: intensity }}>
      {orbs.map((orb, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: `${size}%`,
            height: `${size}%`,
            background: `radial-gradient(circle, ${color}, transparent 70%)`,
            filter: `blur(${blur}px) hue-rotate(${orb.hueShift}deg)`,
            animation: `slide-orb-orbit ${orb.duration / speed}s ease-in-out ${orb.delay / speed}s infinite`,
            transform: 'translate(-50%, -50%)',
            mixBlendMode: 'screen',
          }}
        />
      ))}
    </div>
  );
}

function ParticlesEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#ffffff';
  const count = Math.max(5, Math.min(80, effect.count ?? 30));
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.6;
  const direction = effect.direction || 'up';
  const animName =
    direction === 'down' ? 'slide-particle-down' : direction === 'float' ? 'slide-particle-float' : 'slide-particle-up';
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 1) * 100,
        top: rand(i + 11) * 100,
        size: 2 + rand(i + 2) * 4,
        duration: 8 + rand(i + 3) * 12,
        delay: -rand(i + 4) * 20,
        drift: (rand(i + 5) - 0.5) * 80,
        opacity: 0.4 + rand(i + 6) * 0.6,
      })),
    [count],
  );
  return (
    <div style={{ ...overlayBase, opacity: intensity }}>
      {particles.map((p, i) => (
        <div
          key={i}
          style={
            {
              position: 'absolute',
              left: `${p.left}%`,
              top: direction === 'float' ? `${p.top}%` : 0,
              width: `${p.size}px`,
              height: `${p.size}px`,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 ${p.size * 2}px ${color}`,
              animation: `${animName} ${p.duration / speed}s linear ${p.delay / speed}s infinite`,
              '--p-drift': `${p.drift}px`,
              '--p-opacity': p.opacity,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function MeshEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#6366f1';
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.6;
  const blur = effect.blur ?? 60;
  const hueRotate = effect.hueRotate ?? 60;
  return (
    <div style={{ ...overlayBase, opacity: intensity }}>
      <div
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `conic-gradient(from 0deg at 50% 50%, ${color}, transparent 25%, ${color}aa 50%, transparent 75%, ${color})`,
          filter: `blur(${blur}px) hue-rotate(${hueRotate}deg) saturate(1.4)`,
          animation: `slide-mesh-rotate ${30 / speed}s linear infinite`,
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
}

function GridEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#6366f1';
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.45;
  const spacing = effect.spacing ?? 50;
  const dotSize = effect.dotSize ?? 2;
  const pulseDepth = Math.max(0, Math.min(1, effect.pulseDepth ?? 0.5));
  const minOpacity = 1 - pulseDepth;
  return (
    <div
      style={
        {
          ...overlayBase,
          backgroundImage: `radial-gradient(${color} ${dotSize}px, transparent ${dotSize + 0.5}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          animation: `slide-grid-pulse ${6 / speed}s ease-in-out infinite`,
          opacity: intensity,
          '--g-min': minOpacity,
          '--g-max': 1,
        } as React.CSSProperties
      }
    />
  );
}

function WavesEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#6366f1';
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.6;
  const amplitude = effect.amplitude ?? 30;
  const layers = Math.max(1, Math.min(4, effect.layers ?? 2));
  const layerOpacities = [0.25, 0.4, 0.55, 0.7];
  const layerDurations = [22, 16, 12, 9];
  return (
    <div style={{ ...overlayBase, opacity: intensity }}>
      {Array.from({ length: layers }).map((_, i) => {
        const a = amplitude * (1 - i * 0.18);
        // Two-period sinusoid (4π) so the looped translateX(-50%) repeats seamlessly
        const path = `M0,${100 - a}
          C 200,${100 - a * 2}  400,${100}  600,${100 - a}
          C 800,${100 - a * 2} 1000,${100} 1200,${100 - a}
          L 1200,160 L 0,160 Z`;
        return (
          <svg
            key={i}
            viewBox="0 0 1200 160"
            preserveAspectRatio="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${i * 8}%`,
              width: '200%',
              height: '40%',
              animation: `slide-wave-drift ${layerDurations[i] / speed}s linear infinite`,
            }}
          >
            <path d={path} fill={color} fillOpacity={layerOpacities[i]} />
          </svg>
        );
      })}
    </div>
  );
}

function GrainEffect({ effect }: SlideBgEffectRendererProps) {
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.35;
  const density = Math.max(0.1, Math.min(1, effect.density ?? 0.6));
  // SVG noise via fractalNoise — deterministic, no canvas
  const seed = Math.floor(density * 100);
  const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='${density * 1.5}' numOctaves='2' stitchTiles='stitch' seed='${seed}'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.7'/></svg>`;
  const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(noiseSvg).replace(/'/g, '%27')}`;
  return (
    <div
      style={{
        ...overlayBase,
        backgroundImage: `url("${dataUrl}")`,
        backgroundSize: '200px 200px',
        animation: `slide-grain-shake ${0.8 / speed}s steps(8) infinite`,
        opacity: intensity,
        mixBlendMode: 'overlay',
      }}
    />
  );
}

function BeamEffect({ effect, accentColor }: SlideBgEffectRendererProps) {
  const color = effect.color || accentColor || '#ffffff';
  const speed = effect.speed ?? 1;
  const intensity = effect.intensity ?? 0.5;
  const angle = effect.angle ?? 30;
  const width = effect.width ?? 200;
  return (
    <div style={{ ...overlayBase, opacity: intensity }}>
      <div
        style={
          {
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: `${width}px`,
            height: '300%',
            background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
            filter: 'blur(20px)',
            mixBlendMode: 'screen',
            animation: `slide-beam-sweep ${10 / speed}s ease-in-out infinite`,
            '--b-angle': `${angle}deg`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}

export function SlideBgEffectRenderer({ effect, accentColor }: SlideBgEffectRendererProps) {
  if (!effect || effect.type === 'none') return null;
  switch (effect.type) {
    case 'orbs':      return <OrbsEffect effect={effect} accentColor={accentColor} />;
    case 'particles': return <ParticlesEffect effect={effect} accentColor={accentColor} />;
    case 'mesh':      return <MeshEffect effect={effect} accentColor={accentColor} />;
    case 'grid':      return <GridEffect effect={effect} accentColor={accentColor} />;
    case 'waves':     return <WavesEffect effect={effect} accentColor={accentColor} />;
    case 'grain':     return <GrainEffect effect={effect} accentColor={accentColor} />;
    case 'beam':      return <BeamEffect effect={effect} accentColor={accentColor} />;
    default:          return null;
  }
}
