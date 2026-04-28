import React from 'react';
import { cn } from '@/lib/utils';
import type { SlideBgEffect } from './slideTypes';
import { SlideBgEffectRenderer } from './SlideBgEffects';

interface SlideLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'gradient' | 'minimal' | 'brand' | 'bold';
  className?: string;
  accentColor?: string;
  bgColor?: string;
  animated?: boolean;
  bgEffect?: SlideBgEffect;
}

function getAnimatedOverlayStyle(
  variant: NonNullable<SlideLayoutProps['variant']>,
  accentColor?: string,
): React.CSSProperties | null {
  const accent = accentColor || '#6366f1';
  switch (variant) {
    case 'gradient':
      return {
        background: `linear-gradient(120deg, transparent 0%, ${accent}33 30%, #a855f733 60%, transparent 100%)`,
        backgroundSize: '200% 200%',
        animation: 'slide-aurora 14s ease-in-out infinite',
      };
    case 'brand':
      return {
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), transparent 55%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.10), transparent 55%)',
        backgroundSize: '180% 180%',
        animation: 'slide-aurora 16s ease-in-out infinite',
      };
    case 'dark':
      return {
        background: `radial-gradient(circle at 20% 80%, ${accent}33, transparent 55%), radial-gradient(circle at 80% 20%, ${accent}22, transparent 55%)`,
        backgroundSize: '200% 200%',
        animation: 'slide-aurora 18s ease-in-out infinite',
      };
    case 'bold':
      return {
        background: `linear-gradient(120deg, transparent 35%, ${accent}1f 50%, transparent 65%)`,
        backgroundSize: '250% 250%',
        animation: 'slide-shimmer 10s linear infinite',
      };
    default:
      return null;
  }
}

export function SlideLayout({ children, variant = 'default', className, accentColor, bgColor, animated, bgEffect }: SlideLayoutProps) {
  const baseStyles: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : {};
  const overlayStyle = animated && !bgColor ? getAnimatedOverlayStyle(variant, accentColor) : null;
  const showBgEffect = bgEffect && bgEffect.type !== 'none';

  return (
    <div
      className={cn(
        'w-full h-full relative font-sans slide-content overflow-hidden',
        !bgColor && variant === 'default' && 'bg-white text-slate-900',
        !bgColor && variant === 'dark' && 'bg-slate-900 text-white',
        !bgColor && variant === 'gradient' && 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white',
        !bgColor && variant === 'minimal' && 'bg-slate-50 text-slate-800',
        !bgColor && variant === 'brand' && 'text-white',
        !bgColor && variant === 'bold' && 'bg-black text-white',
        bgColor && 'text-white',
        className
      )}
      style={{
        ...baseStyles,
        ...(variant === 'brand' && !bgColor
          ? { background: accentColor ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` : 'linear-gradient(135deg, #6366f1, #a855f7)' }
          : {}),
      }}
    >
      {overlayStyle && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ ...overlayStyle, zIndex: 0, mixBlendMode: variant === 'bold' ? 'screen' : 'overlay' }}
        />
      )}
      {showBgEffect && (
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <SlideBgEffectRenderer effect={bgEffect!} accentColor={accentColor} />
        </div>
      )}
      <div className="relative w-full h-full" style={{ zIndex: 1 }}>{children}</div>
      {variant !== 'minimal' && variant !== 'bold' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            zIndex: 2,
            background: accentColor
              ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`
              : 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
          }}
        />
      )}
      {variant === 'bold' && (
        <div
          className="absolute top-0 left-0 bottom-0 w-2"
          style={{
            zIndex: 2,
            background: accentColor || '#f59e0b',
          }}
        />
      )}
    </div>
  );
}
