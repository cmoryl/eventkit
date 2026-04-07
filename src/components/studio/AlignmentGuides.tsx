import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GUIDE_LINES, type SnapGuide } from './logoSnapping';

interface AlignmentGuidesProps {
  containerWidth: number;
  containerHeight: number;
  activeGuides: SnapGuide[];
  /** Show all guides faintly while dragging */
  showAll: boolean;
}

export const AlignmentGuides: React.FC<AlignmentGuidesProps> = ({
  containerWidth,
  containerHeight,
  activeGuides,
  showAll,
}) => {
  if (!showAll && activeGuides.length === 0) return null;

  const isActive = (guide: SnapGuide) =>
    activeGuides.some(a => a.axis === guide.axis && a.position === guide.position);

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <AnimatePresence>
        {GUIDE_LINES.map((guide) => {
          const active = isActive(guide);
          if (!showAll && !active) return null;

          const key = `${guide.axis}-${guide.position}`;

          if (guide.axis === 'v') {
            const left = guide.position * containerWidth;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 1 : 0.25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute top-0 bottom-0"
                style={{
                  left,
                  width: active ? 2 : 1,
                  background: active
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--primary) / 0.3)',
                }}
              >
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-0.5 left-1 px-1 py-0.5 rounded text-[8px] font-medium whitespace-nowrap"
                    style={{
                      background: 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                    }}
                  >
                    {guide.label}
                  </motion.div>
                )}
              </motion.div>
            );
          }

          // Horizontal guide
          const top = guide.position * containerHeight;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute left-0 right-0"
              style={{
                top,
                height: active ? 2 : 1,
                background: active
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--primary) / 0.3)',
              }}
            >
              {active && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute -top-2.5 left-1 px-1 py-0.5 rounded text-[8px] font-medium whitespace-nowrap"
                  style={{
                    background: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {guide.label}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
