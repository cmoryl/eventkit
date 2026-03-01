import React from 'react';
import { cn } from '@/lib/utils';

interface SlideLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'gradient' | 'minimal' | 'brand' | 'bold';
  className?: string;
  accentColor?: string;
  bgColor?: string;
}

export function SlideLayout({ children, variant = 'default', className, accentColor, bgColor }: SlideLayoutProps) {
  const baseStyles: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : {};

  return (
    <div
      className={cn(
        'w-full h-full relative font-sans slide-content',
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
      <div className="w-full h-full">{children}</div>
      {variant !== 'minimal' && variant !== 'bold' && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
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
            background: accentColor || '#f59e0b',
          }}
        />
      )}
    </div>
  );
}
