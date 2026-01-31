import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlowingOrbProps {
  className?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'low' | 'medium' | 'high';
  animated?: boolean;
}

const sizeClasses = {
  sm: 'w-32 h-32',
  md: 'w-64 h-64',
  lg: 'w-96 h-96',
  xl: 'w-[500px] h-[500px]'
};

const blurClasses = {
  low: 'blur-2xl',
  medium: 'blur-3xl',
  high: 'blur-[100px]'
};

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  className,
  color = 'from-primary/30 to-accent/30',
  size = 'lg',
  intensity = 'medium',
  animated = true
}) => {
  return (
    <motion.div
      className={cn(
        'absolute rounded-full bg-gradient-to-br pointer-events-none',
        sizeClasses[size],
        blurClasses[intensity],
        color,
        className
      )}
      animate={animated ? {
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
        x: [0, 30, 0],
        y: [0, -20, 0],
      } : undefined}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Animated gradient background
export const AnimatedGradientBg: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('fixed inset-0 -z-10 overflow-hidden', className)}>
      <GlowingOrb 
        className="top-0 left-0 -translate-x-1/2 -translate-y-1/2"
        color="from-violet-500/20 to-purple-500/20"
        size="xl"
      />
      <GlowingOrb 
        className="bottom-0 right-0 translate-x-1/2 translate-y-1/2"
        color="from-cyan-500/15 to-blue-500/15"
        size="xl"
      />
      <GlowingOrb 
        className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        color="from-pink-500/10 to-rose-500/10"
        size="lg"
      />
    </div>
  );
};

// Particle background effect
interface ParticleProps {
  count?: number;
}

export const ParticleField: React.FC<ParticleProps> = ({ count = 20 }) => {
  const particles = React.useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    })),
    [count]
  );

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export default GlowingOrb;
