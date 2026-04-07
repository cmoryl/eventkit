/** Snap-to-grid and alignment guide utilities for logo placement */

export interface SnapGuide {
  /** 'h' = horizontal line, 'v' = vertical line */
  axis: 'h' | 'v';
  /** Position as fraction 0-1 */
  position: number;
  /** Label for debugging / tooltip */
  label: string;
}

/** All guide lines (center + thirds) */
export const GUIDE_LINES: SnapGuide[] = [
  // Center lines
  { axis: 'v', position: 0.5, label: 'Center' },
  { axis: 'h', position: 0.5, label: 'Middle' },
  // Thirds
  { axis: 'v', position: 1 / 3, label: '⅓' },
  { axis: 'v', position: 2 / 3, label: '⅔' },
  { axis: 'h', position: 1 / 3, label: '⅓' },
  { axis: 'h', position: 2 / 3, label: '⅔' },
  // Edges with margin
  { axis: 'v', position: 0.05, label: 'Left margin' },
  { axis: 'v', position: 0.95, label: 'Right margin' },
  { axis: 'h', position: 0.05, label: 'Top margin' },
  { axis: 'h', position: 0.95, label: 'Bottom margin' },
];

/** Snap threshold as a fraction of the container dimension */
const SNAP_THRESHOLD = 0.015;

export interface SnapResult {
  x: number;
  y: number;
  /** Which guide lines are actively snapped */
  activeGuides: SnapGuide[];
}

/**
 * Snap a logo position to nearby guide lines.
 * We check both the logo's leading edge AND its center against each guide.
 */
export function snapToGuides(
  rawX: number,
  rawY: number,
  logoWidthFrac: number,
  logoHeightFrac: number,
): SnapResult {
  let snappedX = rawX;
  let snappedY = rawY;
  const activeGuides: SnapGuide[] = [];

  const logoCenterX = rawX + logoWidthFrac / 2;
  const logoCenterY = rawY + logoHeightFrac / 2;

  for (const guide of GUIDE_LINES) {
    if (guide.axis === 'v') {
      // Check logo left edge
      if (Math.abs(rawX - guide.position) < SNAP_THRESHOLD) {
        snappedX = guide.position;
        activeGuides.push(guide);
      }
      // Check logo center
      else if (Math.abs(logoCenterX - guide.position) < SNAP_THRESHOLD) {
        snappedX = guide.position - logoWidthFrac / 2;
        activeGuides.push(guide);
      }
      // Check logo right edge
      else if (Math.abs(rawX + logoWidthFrac - guide.position) < SNAP_THRESHOLD) {
        snappedX = guide.position - logoWidthFrac;
        activeGuides.push(guide);
      }
    } else {
      // Check logo top edge
      if (Math.abs(rawY - guide.position) < SNAP_THRESHOLD) {
        snappedY = guide.position;
        activeGuides.push(guide);
      }
      // Check logo center
      else if (Math.abs(logoCenterY - guide.position) < SNAP_THRESHOLD) {
        snappedY = guide.position - logoHeightFrac / 2;
        activeGuides.push(guide);
      }
      // Check logo bottom edge
      else if (Math.abs(rawY + logoHeightFrac - guide.position) < SNAP_THRESHOLD) {
        snappedY = guide.position - logoHeightFrac;
        activeGuides.push(guide);
      }
    }
  }

  return { x: snappedX, y: snappedY, activeGuides };
}
