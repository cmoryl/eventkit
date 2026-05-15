/**
 * Curated decorative graphic library for the slide "Swap Graphic" toolbar.
 *
 * Each entry is a self-contained SVG using `currentColor` so it inherits the
 * accent color of whatever shape it replaces. The viewBox is square; the host
 * shape's width/height already constrain rendering.
 *
 * IDs are stable — they're stored in `slide.demoOverrides[shapeId].svg` (the
 * raw markup) so library updates remain referentially safe.
 */
export interface CuratedGraphic {
  id: string;
  label: string;
  /** Two-line description used as tooltip / search keywords. */
  description: string;
  /** Inline SVG markup. Must use viewBox + currentColor + no width/height attrs. */
  svg: string;
}

const wrap = (inner: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;color:inherit">${inner}</svg>`;

const radar = wrap(`
  <circle cx="100" cy="100" r="90" opacity="0.35"/>
  <circle cx="100" cy="100" r="65" opacity="0.55"/>
  <circle cx="100" cy="100" r="40" opacity="0.75"/>
  <circle cx="100" cy="100" r="15"/>
  <line x1="100" y1="10" x2="100" y2="190" opacity="0.3"/>
  <line x1="10" y1="100" x2="190" y2="100" opacity="0.3"/>
  <circle cx="148" cy="62" r="3.5" fill="currentColor"/>
  <circle cx="62" cy="138" r="2.5" fill="currentColor"/>
  <circle cx="160" cy="120" r="2" fill="currentColor"/>
`);

const orbit = wrap(`
  <ellipse cx="100" cy="100" rx="90" ry="30" opacity="0.35"/>
  <ellipse cx="100" cy="100" rx="90" ry="30" opacity="0.55" transform="rotate(60 100 100)"/>
  <ellipse cx="100" cy="100" rx="90" ry="30" opacity="0.55" transform="rotate(-60 100 100)"/>
  <circle cx="100" cy="100" r="14" fill="currentColor"/>
  <circle cx="190" cy="100" r="4" fill="currentColor"/>
  <circle cx="55" cy="55" r="3" fill="currentColor"/>
`);

const hexGrid = wrap(`
  ${[0, 1, 2].flatMap((row) =>
    [0, 1, 2, 3].map((col) => {
      const cx = 35 + col * 45 + (row % 2) * 22;
      const cy = 40 + row * 55;
      const pts = Array.from({ length: 6 })
        .map((_, i) => {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          return `${cx + Math.cos(a) * 22},${cy + Math.sin(a) * 22}`;
        })
        .join(' ');
      return `<polygon points="${pts}" opacity="${0.25 + ((row + col) % 3) * 0.2}"/>`;
    }),
  ).join('')}
`);

const waveform = wrap(`
  ${Array.from({ length: 18 })
    .map((_, i) => {
      const x = 12 + i * 10.5;
      const h = 20 + Math.abs(Math.sin(i * 0.7)) * 110;
      return `<rect x="${x}" y="${100 - h / 2}" width="6" height="${h}" rx="2" opacity="${0.4 + (i % 4) * 0.15}" fill="currentColor" stroke="none"/>`;
    })
    .join('')}
`);

const particleField = wrap(`
  ${Array.from({ length: 36 })
    .map(() => {
      const cx = 10 + Math.random() * 180;
      const cy = 10 + Math.random() * 180;
      const r = 1 + Math.random() * 3;
      const o = (0.3 + Math.random() * 0.7).toFixed(2);
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="currentColor" opacity="${o}" stroke="none"/>`;
    })
    .join('')}
  <circle cx="100" cy="100" r="35" opacity="0.4"/>
`);

const isobars = wrap(`
  ${Array.from({ length: 8 })
    .map((_, i) => {
      const r = 18 + i * 11;
      return `<circle cx="80" cy="115" r="${r}" opacity="${0.7 - i * 0.07}"/>`;
    })
    .join('')}
  <circle cx="80" cy="115" r="6" fill="currentColor" stroke="none"/>
`);

const sphereWire = wrap(`
  <circle cx="100" cy="100" r="80"/>
  ${Array.from({ length: 5 })
    .map((_, i) => {
      const ry = 80 - i * 18;
      return `<ellipse cx="100" cy="100" rx="80" ry="${ry}" opacity="${0.35 + i * 0.08}"/>`;
    })
    .join('')}
  ${Array.from({ length: 6 })
    .map((_, i) => {
      const a = (i * 30) - 90;
      return `<ellipse cx="100" cy="100" rx="14" ry="80" opacity="0.3" transform="rotate(${a} 100 100)"/>`;
    })
    .join('')}
`);

const scatter = wrap(`
  <line x1="20" y1="180" x2="180" y2="180" opacity="0.4"/>
  <line x1="20" y1="20" x2="20" y2="180" opacity="0.4"/>
  ${Array.from({ length: 22 })
    .map((_, i) => {
      const x = 25 + (i * 7) % 150;
      const y = 170 - (Math.sin(i * 0.9) * 60 + 70);
      const r = 2 + (i % 4);
      return `<circle cx="${x}" cy="${y.toFixed(1)}" r="${r}" fill="currentColor" stroke="none" opacity="${0.5 + (i % 3) * 0.2}"/>`;
    })
    .join('')}
`);

const contour = wrap(`
  ${Array.from({ length: 9 })
    .map((_, i) => {
      const offset = 5 + i * 9;
      return `<path d="M${10 + offset},${190 - offset / 2} Q ${100},${50 + offset} ${190 - offset},${190 - offset / 2}" opacity="${0.4 + (i % 4) * 0.15}"/>`;
    })
    .join('')}
`);

const barMesh = wrap(`
  ${Array.from({ length: 8 })
    .flatMap((_, col) =>
      Array.from({ length: 8 }).map((__, row) => {
        const h = 4 + Math.abs(Math.sin(col * 0.6 + row * 0.4)) * 16;
        return `<rect x="${15 + col * 22}" y="${100 - h / 2 + row * 12}" width="14" height="${h.toFixed(1)}" fill="currentColor" stroke="none" opacity="${0.3 + (row % 4) * 0.15}" rx="1"/>`;
      }),
    )
    .join('')}
`);

const polarGrid = wrap(`
  <circle cx="100" cy="100" r="30" opacity="0.3"/>
  <circle cx="100" cy="100" r="60" opacity="0.4"/>
  <circle cx="100" cy="100" r="88" opacity="0.5"/>
  ${Array.from({ length: 12 })
    .map((_, i) => {
      const a = ((i * 30) * Math.PI) / 180;
      const x = 100 + Math.cos(a) * 88;
      const y = 100 + Math.sin(a) * 88;
      return `<line x1="100" y1="100" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" opacity="0.3"/>`;
    })
    .join('')}
  <polygon points="100,55 130,90 122,135 78,135 70,90" fill="currentColor" opacity="0.35" stroke="none"/>
  <polygon points="100,55 130,90 122,135 78,135 70,90" opacity="0.8"/>
`);

const geoArcs = wrap(`
  <path d="M20 140 Q 100 20 180 140" opacity="0.6"/>
  <path d="M20 140 Q 100 60 180 140" opacity="0.45"/>
  <path d="M20 140 Q 100 100 180 140" opacity="0.3"/>
  <circle cx="20" cy="140" r="4" fill="currentColor" stroke="none"/>
  <circle cx="180" cy="140" r="4" fill="currentColor" stroke="none"/>
  <circle cx="100" cy="60" r="3.5" fill="currentColor" stroke="none"/>
  <line x1="20" y1="140" x2="180" y2="140" opacity="0.25"/>
`);

export const CURATED_GRAPHICS: CuratedGraphic[] = [
  { id: 'radar',         label: 'Radar Sweep',     description: 'Concentric rings, scan lines, signal pings.', svg: radar },
  { id: 'orbit',         label: 'Orbit Rings',     description: 'Three rotated ellipses around a core node.',  svg: orbit },
  { id: 'hex-grid',      label: 'Hex Grid',        description: 'Honeycomb mesh of hexagons.',                 svg: hexGrid },
  { id: 'waveform',      label: 'Waveform',        description: 'Vertical bars forming an audio wave.',        svg: waveform },
  { id: 'particle-field',label: 'Particle Field',  description: 'Scattered glowing points with focal ring.',   svg: particleField },
  { id: 'isobars',       label: 'Isobars',         description: 'Topographic ripple rings from a focal point.',svg: isobars },
  { id: 'sphere-wire',   label: 'Sphere Wireframe',description: 'Latitude/longitude wire globe.',              svg: sphereWire },
  { id: 'scatter',       label: 'Scatter Plot',    description: 'XY chart of plotted data points.',            svg: scatter },
  { id: 'contour',       label: 'Contour Lines',   description: 'Stacked arcs forming an elevation map.',      svg: contour },
  { id: 'bar-mesh',      label: 'Bar Mesh',        description: 'Grid of small bars — data density.',          svg: barMesh },
  { id: 'polar-grid',    label: 'Polar Grid',      description: 'Radial chart with pentagon overlay.',         svg: polarGrid },
  { id: 'geo-arcs',      label: 'Geo Arcs',        description: 'Connecting arcs between two endpoints.',      svg: geoArcs },
];
