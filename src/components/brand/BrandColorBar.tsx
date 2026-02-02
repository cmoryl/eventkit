// Brand Color Bar - A subtle visual indicator showing the active brand's colors
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BrandColorBarProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  position?: 'top' | 'bottom';
  animated?: boolean;
  className?: string;
}

export const BrandColorBar: React.FC<BrandColorBarProps> = ({
  primaryColor,
  secondaryColor,
  accentColor,
  position = 'top',
  animated = true,
  className
}) => {
  // If no brand colors, show default gradient
  const hasColors = primaryColor || secondaryColor || accentColor;
  
  const gradientStyle = hasColors
    ? {
        background: `linear-gradient(90deg, ${primaryColor || 'hsl(var(--primary))'} 0%, ${secondaryColor || primaryColor || 'hsl(var(--primary))'} 50%, ${accentColor || primaryColor || 'hsl(var(--accent))'} 100%)`
      }
    : undefined;

  return (
    <motion.div
      className={cn(
        "absolute left-0 right-0 h-0.5",
        position === 'top' ? 'top-0' : 'bottom-0',
        !hasColors && "bg-gradient-to-r from-violet-500 via-primary to-cyan-500",
        className
      )}
      style={gradientStyle}
      initial={animated ? { scaleX: 0, opacity: 0 } : undefined}
      animate={animated ? { scaleX: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  );
};
