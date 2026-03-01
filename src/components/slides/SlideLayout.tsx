import React from 'react';
import { cn } from '@/lib/utils';

interface SlideLayoutProps {
  children: React.ReactNode;
  variant?: 'default' | 'dark' | 'gradient';
  className?: string;
  accentColor?: string;
}

export function SlideLayout({ children, variant = 'default', className, accentColor }: SlideLayoutProps) {
  return (
    <div
      className={cn(
        'w-full h-full relative font-sans slide-content',
        variant === 'default' && 'bg-white text-slate-900',
        variant === 'dark' && 'bg-slate-900 text-white',
        variant === 'gradient' && 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white',
        className
      )}
    >
      <div className="w-full h-full">{children}</div>
      <div
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{
          background: accentColor
            ? `linear-gradient(90deg, ${accentColor}, ${accentColor}80)`
            : 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
        }}
      />
    </div>
  );
}
