import React, { forwardRef } from 'react';

interface SkeletonLoaderProps {
  style?: React.CSSProperties;
  className?: string;
  variant?: 'default' | 'card' | 'text' | 'circle' | 'image';
  lines?: number;
}

const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ style, className = '', variant = 'default', lines = 1 }, ref) => {
    if (variant === 'card') {
      return (
        <div ref={ref} className={`rounded-2xl overflow-hidden ${className}`} style={style}>
          <div className="aspect-square shimmer" />
          <div className="p-4 space-y-2 bg-card">
            <div className="h-4 w-3/4 shimmer rounded" />
            <div className="h-3 w-1/2 shimmer rounded" />
          </div>
        </div>
      );
    }

    if (variant === 'text') {
      return (
        <div ref={ref} className={`space-y-2 ${className}`} style={style}>
          {Array.from({ length: lines }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 shimmer rounded"
              style={{ width: i === lines - 1 ? '60%' : '100%' }}
            />
          ))}
        </div>
      );
    }

    if (variant === 'circle') {
      return (
        <div 
          ref={ref} 
          className={`rounded-full shimmer ${className}`} 
          style={style}
        />
      );
    }

    if (variant === 'image') {
      return (
        <div ref={ref} className={`relative overflow-hidden rounded-xl ${className}`} style={style}>
          <div className="absolute inset-0 shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`relative overflow-hidden bg-secondary/50 rounded-lg ${className}`}
        style={style}
      >
        <div className="absolute inset-0 shimmer" />
      </div>
    );
  }
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
