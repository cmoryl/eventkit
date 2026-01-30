import React from 'react';

interface SkeletonLoaderProps {
  style?: React.CSSProperties;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ style, className = '' }) => {
  return (
    <div
      className={`bg-secondary/50 rounded-lg animate-pulse ${className}`}
      style={style}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
    </div>
  );
};

export default SkeletonLoader;
