import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  AnimationLayer, AnimatedBannerConfig, getPresetById
} from '@/config/animationPresets';

interface AnimatedBannerPreviewProps {
  config: AnimatedBannerConfig;
  isPlaying: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  scale?: number;
  className?: string;
  canvasRef?: React.RefObject<HTMLDivElement>;
}

/**
 * Renders a live animated banner preview using Framer Motion.
 * Each layer gets its own animation based on the assigned preset.
 */
export const AnimatedBannerPreview: React.FC<AnimatedBannerPreviewProps> = ({
  config,
  isPlaying,
  scale = 1,
  className = '',
  canvasRef,
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  // Replay animation from start
  const replay = useCallback(() => {
    setAnimationKey(k => k + 1);
  }, []);

  // Replay when play state changes to true
  useEffect(() => {
    if (isPlaying) {
      replay();
    }
  }, [isPlaying, replay]);

  const scaledWidth = config.canvasWidth * scale;
  const scaledHeight = config.canvasHeight * scale;

  const backgroundStyle: React.CSSProperties = {
    width: config.canvasWidth,
    height: config.canvasHeight,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'relative',
    overflow: 'hidden',
  };

  if (config.backgroundGradient) {
    backgroundStyle.background = config.backgroundGradient;
  } else if (config.backgroundImage) {
    backgroundStyle.backgroundImage = `url(${config.backgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  } else {
    backgroundStyle.backgroundColor = config.backgroundColor;
  }

  return (
    <div 
      className={className}
      style={{ width: scaledWidth, height: scaledHeight, overflow: 'hidden' }}
    >
      <div ref={canvasRef} style={backgroundStyle} key={animationKey}>
        {config.layers
          .sort((a, b) => (a.style.zIndex || 0) - (b.style.zIndex || 0))
          .map((layer) => (
            <AnimatedLayer 
              key={layer.id} 
              layer={layer} 
              isPlaying={isPlaying}
              canvasWidth={config.canvasWidth}
              canvasHeight={config.canvasHeight}
            />
          ))}
      </div>
    </div>
  );
};

interface AnimatedLayerProps {
  layer: AnimationLayer;
  isPlaying: boolean;
  canvasWidth: number;
  canvasHeight: number;
}

const AnimatedLayer: React.FC<AnimatedLayerProps> = ({ 
  layer, isPlaying, canvasWidth, canvasHeight 
}) => {
  const preset = getPresetById(layer.preset);
  
  if (!preset) {
    return <StaticLayer layer={layer} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />;
  }

  const posStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.style.x}%`,
    top: `${layer.style.y}%`,
    width: `${layer.style.width}%`,
    height: `${layer.style.height}%`,
    zIndex: layer.style.zIndex || 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: layer.style.textAlign === 'center' ? 'center' : 
                     layer.style.textAlign === 'right' ? 'flex-end' : 'flex-start',
  };

  const contentStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (layer.style.backgroundColor) {
    contentStyle.backgroundColor = layer.style.backgroundColor;
  }
  if (layer.style.borderRadius) {
    contentStyle.borderRadius = layer.style.borderRadius;
    contentStyle.padding = '8px 24px';
  }

  const motionTransition = {
    ...preset.transition,
    delay: (preset.transition.delay || 0) + layer.delay,
  };

  return (
    <div style={posStyle}>
      <motion.div
        initial={isPlaying ? (preset.initial as any) : (preset.animate as any)}
        animate={isPlaying ? (preset.animate as any) : (preset.animate as any)}
        transition={motionTransition as any}
        style={contentStyle}
      >
        <LayerContent layer={layer} />
      </motion.div>
    </div>
  );
};

const StaticLayer: React.FC<{ layer: AnimationLayer; canvasWidth: number; canvasHeight: number }> = ({ 
  layer 
}) => {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.style.x}%`,
    top: `${layer.style.y}%`,
    width: `${layer.style.width}%`,
    height: `${layer.style.height}%`,
    zIndex: layer.style.zIndex || 1,
    backgroundColor: layer.style.backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={style}>
      <LayerContent layer={layer} />
    </div>
  );
};

const LayerContent: React.FC<{ layer: AnimationLayer }> = ({ layer }) => {
  switch (layer.type) {
    case 'text':
      return (
        <span
          style={{
            fontSize: layer.style.fontSize || 16,
            fontWeight: layer.style.fontWeight || '400',
            fontFamily: layer.style.fontFamily || 'inherit',
            color: layer.style.color || '#FFFFFF',
            textAlign: layer.style.textAlign || 'center',
            width: '100%',
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {layer.content}
        </span>
      );
    case 'image':
      return layer.content ? (
        <img
          src={layer.content}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: layer.style.objectFit || 'cover',
            borderRadius: layer.style.borderRadius,
          }}
        />
      ) : null;
    case 'logo':
      return layer.content ? (
        layer.content.startsWith('http') || layer.content.startsWith('data:') ? (
          <img src={layer.content} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
        ) : (
          <span style={{ fontSize: layer.style.fontSize || 14, color: layer.style.color || '#FFFFFF', fontWeight: '700' }}>
            {layer.content}
          </span>
        )
      ) : null;
    case 'overlay':
    case 'shape':
      return null;
    default:
      return null;
  }
};
