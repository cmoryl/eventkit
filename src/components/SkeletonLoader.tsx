import React, { forwardRef } from 'react';

interface SkeletonLoaderProps {
  style?: React.CSSProperties;
  className?: string;
}

const SkeletonLoader = forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ style, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-secondary/50 rounded-lg animate-pulse ${className}`}
        style={style}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      </div>
    );
  }
);

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;
