import React from 'react';

interface SkeletonLoaderProps {
  style?: React.CSSProperties;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ style, className = '' }) => {
  return (
    <div
      className={`bg-white/10 rounded-lg animate-pulse ${className}`}
      style={style}
    ></div>
  );
};

export default SkeletonLoader;
