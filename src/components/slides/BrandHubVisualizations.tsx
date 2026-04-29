import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { SlideData } from './slideTypes';

/* ------------------------------------------------------------------ */
/* BrandHub-style Revenue Growth chart                                 */
/* ------------------------------------------------------------------ */
/*
 * Mirrors the BrandHub "Revenue Growth" visualization:
 *  - vertical gradient bars (deep brand blue → light tint at the top)
 *  - dotted grid background, dashed horizontal rules at $0 / 25 / 50 / 75 / 100%
 *  - rotated year-style x-axis ticks
 *  - value-formatted y-axis ($0M / $350M / $700M / $1.05B / $1.4B)
 *  - small 'Tap any bar to view year details' hint in the corner
 */

interface ChartProps {
  slide: SlideData;
  accentColor: string;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  headingFont: string;
  bodyFont: string;
  headingColor: string;
  hSize?: number;
  isDark: boolean;
  align: 'left' | 'center' | 'right';
}

/** Format a numeric value to BrandHub style: $1.4B / $1.05B / $700M / $350M / $0M. */
function formatRevenue(v: number): string {
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(v % 1_000_000_000 === 0 ? 0 : 2)}B`;
  if (v >= 1_000_000) return `$${Math.round(v / 1_000_000)}M`;
  if (v >= 1_000) return `$${Math.round(v / 1_000)}K`;
  return `$${v}`;
}

export const BrandHubGrowthChart: React.FC<ChartProps> = ({
  slide, accentColor, brandColors, headingFont, bodyFont, headingColor, hSize, isDark,
}) => {
  const c = slide.chart!;
  const data = c.data;

  // Build two-stop vertical gradient: deep base → light tint.
  // Deep = brand primary or accent; tint = lighter version of secondary or hard-coded white tint.
  const deep = brandColors?.primary || accentColor || '#1E40AF';
  const tint = brandColors?.secondary || '#7DD3FC';
  const gradientId = `bhGrowthGradient-${slide.id}`;
  const gridStroke = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)';
  const tickColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.55)';

  return (
    <div className="flex flex-col h-full px-[120px] py-[100px]">
      <div className="flex items-baseline justify-between mb-[16px]">
        <h2 className="font-bold" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}>
          {slide.title || 'Revenue Growth'}
        </h2>
        {c.title && (
          <p className="opacity-60 text-right" style={{ fontFamily: bodyFont, fontSize: 28 }}>
            {c.title}
          </p>
        )}
      </div>
      {slide.subtitle && (
        <p className="opacity-70 mb-[24px]" style={{ fontFamily: bodyFont, fontSize: 28 }}>
          {slide.subtitle}
        </p>
      )}
      <div className="opacity-50 mb-[8px]" style={{ fontFamily: bodyFont, fontSize: 22 }}>
        Tap any bar to view year details
      </div>
      <div className="flex-1 min-h-0 rounded-[16px] p-[24px]"
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.04))'
            : 'rgba(0,0,0,0.02)',
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 20, left: 40, bottom: 40 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={tint} stopOpacity={0.95} />
                <stop offset="100%" stopColor={deep} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke={gridStroke}
              strokeDasharray="2 6"
              vertical
              horizontal
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 18, fill: tickColor }}
              tickLine={false}
              axisLine={{ stroke: gridStroke }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 18, fill: tickColor }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => formatRevenue(v)}
              width={80}
            />
            <Tooltip
              cursor={{ fill: 'rgba(125,211,252,0.08)' }}
              contentStyle={{
                background: isDark ? '#0b1024' : '#ffffff',
                border: `1px solid ${gridStroke}`,
                borderRadius: 12,
                fontFamily: bodyFont,
              }}
              formatter={(v: number) => formatRevenue(v)}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={`url(#${gradientId})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* BrandHub-style "By the Numbers" KPI tile grid                       */
/* ------------------------------------------------------------------ */
/*
 * Mirrors the 4-up KPI tile row from BrandHub:
 *  - 4 graduated tint cards (white → light blue → mid blue → deep navy)
 *  - centered icon-in-circle at the top of each card
 *  - huge metric number (140+, 50+, 30+, 200+)
 *  - uppercase tracked label below
 *  - corner sparkle dots at four corners of each card
 */

interface StatsProps {
  slide: SlideData;
  accentColor: string;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  headingFont: string;
  bodyFont: string;
  headingColor: string;
  hSize?: number;
  bSize?: number;
  isDark: boolean;
}

/** Four graduated tints for the BrandHub tile row. */
function tilePalette(brandColors?: { primary?: string; secondary?: string; accent?: string }, isDark = false) {
  const deep = brandColors?.primary || '#1E3A8A';
  const mid = brandColors?.accent || '#3B82F6';
  // Pure cards always go light → deep regardless of theme background, mirroring BrandHub.
  return [
    { bg: 'linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,255,255,0.78))', text: '#1A1A2E', sub: 'rgba(26,26,46,0.7)', icon: 'rgba(26,26,46,0.55)' },
    { bg: `linear-gradient(160deg, rgba(186,213,255,0.92), rgba(186,213,255,0.7))`, text: '#0F1B3D', sub: 'rgba(15,27,61,0.7)', icon: 'rgba(15,27,61,0.55)' },
    { bg: `linear-gradient(160deg, ${mid}E6, ${mid}B3)`, text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)', icon: 'rgba(255,255,255,0.85)' },
    { bg: `linear-gradient(160deg, ${deep}, ${deep}D9)`, text: '#FFFFFF', sub: 'rgba(255,255,255,0.85)', icon: 'rgba(255,255,255,0.85)' },
  ];
  void isDark;
}

/** Tiny sparkle dot at a card corner. */
const CornerDot: React.FC<{ pos: 'tl' | 'tr' | 'bl' | 'br'; color: string }> = ({ pos, color }) => {
  const map: Record<typeof pos, React.CSSProperties> = {
    tl: { top: 16, left: 16 },
    tr: { top: 16, right: 16 },
    bl: { bottom: 16, left: 16 },
    br: { bottom: 16, right: 16 },
  };
  return (
    <span
      className="absolute rounded-full"
      style={{ width: 6, height: 6, background: color, opacity: 0.55, ...map[pos] }}
    />
  );
};

export const BrandHubKpiTiles: React.FC<StatsProps> = ({
  slide, brandColors, headingFont, bodyFont, headingColor, hSize, bSize, isDark,
}) => {
  const stats = (slide.stats || []).slice(0, 4);
  const tints = tilePalette(brandColors, isDark);

  return (
    <div className="flex flex-col h-full px-[100px] py-[80px]">
      {slide.title && (
        <h2
          className="font-bold mb-[16px]"
          style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 56 }}
        >
          {slide.title}
        </h2>
      )}
      {slide.subtitle && (
        <p className="opacity-70 mb-[48px]" style={{ fontFamily: bodyFont, fontSize: bSize || 28 }}>
          {slide.subtitle}
        </p>
      )}
      <div className="flex-1 grid grid-cols-4 gap-[28px] items-stretch">
        {stats.map((s, i) => {
          const t = tints[i % tints.length];
          return (
            <div
              key={i}
              className="relative rounded-[24px] flex flex-col items-center justify-center p-[40px] overflow-hidden"
              style={{ background: t.bg, color: t.text, boxShadow: '0 12px 40px rgba(0,0,0,0.25)' }}
            >
              <CornerDot pos="tl" color={t.icon} />
              <CornerDot pos="tr" color={t.icon} />
              <CornerDot pos="bl" color={t.icon} />
              <CornerDot pos="br" color={t.icon} />
              <div
                className="rounded-full flex items-center justify-center mb-[28px]"
                style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.12)', border: `1px solid ${t.icon}` }}
              >
                {/* Generic icon — circle with line, replaced visually by the metric */}
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={t.icon} strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M3 12a9 9 0 0 1 18 0" />
                </svg>
              </div>
              <div className="font-bold text-center leading-none mb-[20px]" style={{ fontFamily: headingFont, fontSize: 96 }}>
                {s.value}
              </div>
              <div
                className="uppercase tracking-[0.18em] text-center"
                style={{ fontFamily: bodyFont, fontSize: 22, color: t.sub }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
