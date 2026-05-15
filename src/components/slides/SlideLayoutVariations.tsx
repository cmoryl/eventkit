import React from 'react';
import type { SlideData, ChartData } from './slideTypes';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

export interface VariationContext {
  slide: SlideData;
  headingFont: string;
  bodyFont: string;
  accentColor?: string;
  headingColor: string;
  isDark: boolean;
  hSize: number;
  bSize: number;
  align: 'left' | 'center' | 'right';
}

function parseMagnitude(value: string): number {
  const match = value.match(/(-?\d+\.?\d*)/);
  if (!match) return 1;
  return Math.abs(parseFloat(match[1]));
}

// ── DESIGN HELPERS ──────────────────────────────────────────────────────────
function dotBg(accent: string): React.CSSProperties {
  return {
    backgroundImage: `radial-gradient(circle, ${accent}22 1.5px, transparent 1.5px)`,
    backgroundSize: '36px 36px',
  };
}
function gridBg(isDark: boolean): React.CSSProperties {
  const c = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  return {
    backgroundImage: `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`,
    backgroundSize: '80px 80px',
  };
}
function glass(isDark: boolean, accent?: string): React.CSSProperties {
  return {
    backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
    borderRadius: 24,
    boxShadow: accent
      ? `0 0 60px ${accent}28, 0 16px 48px rgba(0,0,0,${isDark ? 0.35 : 0.08})`
      : `0 16px 48px rgba(0,0,0,${isDark ? 0.35 : 0.08})`,
  };
}
const accentGrad = (a: string, deg = 135) => `linear-gradient(${deg}deg, ${a}, ${a}99)`;

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsGrid({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stats = slide.stats || [];
  const cols = stats.length <= 4 ? 2 : 3;
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={dotBg(accent)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -60, bottom: -80, fontSize: 540, color: accent, opacity: 0.045, lineHeight: 1, fontFamily: headingFont }}>✦</div>
      <h2 className="relative z-10 font-bold mb-[56px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[40px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden flex flex-col justify-center items-center text-center" style={{ ...glass(isDark, accent), padding: '48px 36px' }}>
            <div className="absolute top-0 left-0 right-0 h-[5px]" style={{ background: accentGrad(accent, 90), borderRadius: '24px 24px 0 0' }} />
            <div className="absolute pointer-events-none select-none" style={{ right: -8, bottom: -32, fontSize: 260, color: accent, opacity: 0.05, lineHeight: 1, fontFamily: headingFont }}>{i + 1}</div>
            <div className="absolute pointer-events-none" style={{ top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 120, height: 120, borderRadius: '50%', background: `${accent}28`, filter: 'blur(36px)' }} />
            <div className="relative z-10 font-black" style={{ fontSize: 88, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 48px ${accent}55` }}>
              {stat.value}
            </div>
            <div className="relative z-10 mt-[14px] uppercase tracking-widest font-semibold" style={{ fontSize: bSize || 22, fontFamily: bodyFont, color: headingColor, opacity: 0.65 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsRanked({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const stats = slide.stats || [];
  const max = Math.max(...stats.map(s => parseMagnitude(s.value)), 1);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={gridBg(isDark)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -20, top: '50%', transform: 'translateY(-50%)', fontSize: 500, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>#</div>
      <h2 className="relative z-10 font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex flex-col justify-center gap-[28px]">
        {stats.map((stat, i) => {
          const pct = (parseMagnitude(stat.value) / max) * 100;
          const isTop = i === 0;
          return (
            <div key={i} className="flex items-center gap-[36px]">
              <div className="flex items-center justify-center rounded-full font-black shrink-0" style={{ width: 64, height: 64, background: isTop ? accentGrad(accent) : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'), color: isTop ? '#fff' : headingColor, fontFamily: headingFont, fontSize: 28, boxShadow: isTop ? `0 0 28px ${accent}55` : 'none' }}>
                {i + 1}
              </div>
              <div className="font-semibold shrink-0" style={{ minWidth: 260, fontFamily: bodyFont, fontSize: 30, color: headingColor, opacity: 0.85 }}>
                {stat.label}
              </div>
              <div className="flex-1 h-[44px] rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(8, pct)}%`, background: isTop ? accentGrad(accent, 90) : `linear-gradient(90deg, ${accent}55, ${accent}22)`, boxShadow: isTop ? `0 0 20px ${accent}44` : 'none' }} />
              </div>
              <div className="font-black text-right shrink-0" style={{ fontFamily: headingFont, color: isTop ? accent : headingColor, fontSize: 48, minWidth: 180, textShadow: isTop ? `0 0 32px ${accent}55` : 'none' }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsCards({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stats = slide.stats || [];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[8px] z-20" style={{ background: accentGrad(accent, 90) }} />
      <div className="absolute inset-0" style={dotBg(accent)} />
      <h2 className="relative z-10 font-bold mb-[56px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex items-stretch justify-center gap-[32px] flex-wrap">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden flex flex-col items-center text-center shrink-0" style={{ ...glass(isDark, accent), minWidth: 280, flex: '1 1 280px', maxWidth: 380, padding: '52px 44px' }}>
            <div className="absolute pointer-events-none" style={{ top: '35%', left: '50%', transform: 'translate(-50%,-50%)', width: 140, height: 140, borderRadius: '50%', background: `${accent}25`, filter: 'blur(40px)' }} />
            <div className="relative z-10 font-black" style={{ fontSize: 84, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 50px ${accent}66` }}>
              {stat.value}
            </div>
            <div className="relative z-10 rounded-full my-[20px]" style={{ width: 36, height: 3, background: accentGrad(accent, 90) }} />
            <div className="relative z-10 uppercase tracking-widest font-semibold" style={{ fontSize: bSize || 22, fontFamily: bodyFont, color: headingColor, opacity: 0.68 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TIMELINE ──────────────────────────────────────────────────────────────────
function TimelineVertical({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.timeline || []).slice(0, 6);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <h2 className="relative z-10 font-bold mb-[40px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[18px]" style={{ gridTemplateColumns: '180px 72px 1fr' }}>
        <div className="absolute" style={{ left: 216, top: 20, bottom: 20, width: 4, background: `linear-gradient(180deg, ${accent}, ${accent}44)`, borderRadius: 2 }} />
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <div className="text-right font-bold uppercase tracking-widest pt-[12px]" style={{ fontFamily: bodyFont, color: accent, fontSize: 22, opacity: 0.9 }}>
              {step.date || '—'}
            </div>
            <div className="flex items-start justify-center pt-[10px]">
              <div className="relative flex items-center justify-center rounded-full" style={{ width: 36, height: 36, background: accentGrad(accent), boxShadow: `0 0 0 6px ${isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)'}, 0 0 24px ${accent}55` }}>
                <div className="rounded-full bg-white" style={{ width: 10, height: 10, opacity: 0.9 }} />
              </div>
            </div>
            <div className="flex flex-col" style={{ ...glass(isDark), padding: '16px 28px 20px', marginBottom: 6 }}>
              <div className="font-bold mb-[6px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 30 }}>{step.title}</div>
              {step.description && <div style={{ fontFamily: bodyFont, fontSize: 22, opacity: 0.65, lineHeight: 1.4 }}>{step.description}</div>}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function TimelineZigzag({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.timeline || []).slice(0, 6);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -20, bottom: -40, fontSize: 480, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>{steps.length}</div>
      <h2 className="relative z-10 font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative">
        <div className="absolute" style={{ left: 0, right: 0, height: 4, top: '50%', transform: 'translateY(-50%)', background: `linear-gradient(90deg, ${accent}22, ${accent}, ${accent}22)`, borderRadius: 2 }} />
        <div className="relative z-10 h-full grid" style={{ gridTemplateColumns: `repeat(${Math.max(1, steps.length)}, 1fr)` }}>
          {steps.map((step, i) => {
            const isTop = i % 2 === 0;
            return (
              <div key={i} className="relative flex flex-col items-center justify-center">
                <div className="absolute flex items-center justify-center rounded-full font-black text-white" style={{ width: 80, height: 80, background: accentGrad(accent), top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontFamily: headingFont, fontSize: 30, boxShadow: `0 0 32px ${accent}55, 0 0 0 6px ${isDark ? 'rgba(10,15,30,0.9)' : 'rgba(255,255,255,0.95)'}` }}>
                  {i + 1}
                </div>
                <div className="text-center" style={{ ...glass(isDark), position: 'absolute', left: 12, right: 12, padding: '20px 16px', ...(isTop ? { bottom: 'calc(50% + 58px)' } : { top: 'calc(50% + 58px)' }) }}>
                  {step.date && <div className="uppercase tracking-widest font-bold mb-[6px]" style={{ fontFamily: bodyFont, color: accent, fontSize: 18 }}>{step.date}</div>}
                  <div className="font-bold" style={{ fontFamily: headingFont, color: headingColor, fontSize: 26 }}>{step.title}</div>
                  {step.description && <div style={{ fontFamily: bodyFont, fontSize: 20, opacity: 0.65, lineHeight: 1.4, marginTop: 4 }}>{step.description}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimelineCards({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.timeline || []).slice(0, 4);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <h2 className="relative z-10 font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[28px]" style={{ gridTemplateColumns: `repeat(${Math.max(1, steps.length)}, 1fr)` }}>
        {steps.map((step, i) => (
          <div key={i} className="relative overflow-hidden flex flex-col" style={glass(isDark)}>
            <div className="h-[5px] shrink-0" style={{ background: accentGrad(accent, 90), borderRadius: '24px 24px 0 0' }} />
            <div className="absolute pointer-events-none select-none" style={{ right: -8, bottom: -24, fontSize: 220, color: accent, opacity: 0.06, lineHeight: 1, fontFamily: headingFont }}>{i + 1}</div>
            <div className="relative z-10 flex flex-col flex-1 p-[36px]">
              <div className="font-black uppercase tracking-widest mb-[14px]" style={{ fontFamily: headingFont, color: accent, fontSize: 22 }}>
                {step.date || `Step ${i + 1}`}
              </div>
              <div className="font-bold mb-[12px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 32 }}>{step.title}</div>
              {step.description && <div style={{ fontFamily: bodyFont, fontSize: 24, opacity: 0.68, lineHeight: 1.4 }}>{step.description}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROCESS ───────────────────────────────────────────────────────────────────
function ProcessCircular({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.process || []).slice(0, 6);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const R = 300;
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden">
      <div className="absolute pointer-events-none" style={{ top: '58%', left: '50%', transform: 'translate(-50%,-50%)', width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18, transparent 65%)` }} />
      <h2 className="relative z-10 font-bold mb-[20px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative flex items-center justify-center">
        <div className="absolute rounded-full" style={{ width: R * 2 + 80, height: R * 2 + 80, border: `2px dashed ${accent}33` }} />
        <div className="absolute rounded-full" style={{ width: R * 2 - 20, height: R * 2 - 20, border: `1px solid ${accent}18` }} />
        <div className="absolute flex items-center justify-center rounded-full z-10" style={{ width: 72, height: 72, background: accentGrad(accent), boxShadow: `0 0 48px ${accent}55` }}>
          <div className="rounded-full bg-white" style={{ width: 20, height: 20, opacity: 0.9 }} />
        </div>
        {steps.map((step, i) => {
          const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * R;
          const y = Math.sin(angle) * R;
          return (
            <div key={i} className="absolute flex flex-col items-center text-center z-10" style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%,-50%)', width: 210 }}>
              <div className="flex items-center justify-center rounded-full font-black text-white mb-[12px]" style={{ width: 88, height: 88, background: accentGrad(accent), fontFamily: headingFont, fontSize: 36, boxShadow: `0 0 32px ${accent}55, 0 0 0 7px ${isDark ? 'rgba(10,15,30,0.95)' : 'rgba(255,255,255,0.95)'}` }}>
                {i + 1}
              </div>
              <div className="font-bold" style={{ fontFamily: headingFont, color: headingColor, fontSize: 26 }}>{step.title}</div>
              {step.description && <div style={{ fontFamily: bodyFont, fontSize: 20, opacity: 0.65, lineHeight: 1.4, marginTop: 4 }}>{step.description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessStairs({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.process || []).slice(0, 5);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const opacities = ['44', '66', '88', 'aa', 'ee'];
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
      <h2 className="relative z-10 font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex items-end justify-center gap-[20px]">
        {steps.map((step, i) => {
          const heightPct = 30 + (i / Math.max(1, steps.length - 1)) * 60;
          const op = opacities[Math.min(i, opacities.length - 1)];
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ maxWidth: 260 }}>
              <div className="font-black mb-[12px]" style={{ fontSize: 56, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 28px ${accent}44` }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div className="relative w-full overflow-hidden rounded-t-[20px] flex flex-col justify-center text-center" style={{ height: `${heightPct}%`, background: `linear-gradient(180deg, ${accent}${op}, ${accent}22)`, borderTop: `4px solid ${accent}${op}`, padding: '28px 20px' }}>
                <div className="font-bold mb-[8px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 28 }}>{step.title}</div>
                {step.description && <div style={{ fontFamily: bodyFont, fontSize: 20, color: headingColor, opacity: 0.72, lineHeight: 1.4 }}>{step.description}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProcessCards({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.process || []).slice(0, 6);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const cols = steps.length <= 3 ? 3 : steps.length === 4 ? 2 : 3;
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <h2 className="relative z-10 font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[28px]" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {steps.map((step, i) => (
          <div key={i} className="relative overflow-hidden flex flex-col" style={{ ...glass(isDark), padding: '36px 36px 36px 44px' }}>
            <div className="absolute top-0 left-0 bottom-0 w-[5px]" style={{ background: accentGrad(accent, 180), borderRadius: '24px 0 0 24px' }} />
            <div className="absolute pointer-events-none select-none" style={{ right: -10, bottom: -30, fontSize: 200, color: accent, opacity: 0.05, lineHeight: 1, fontFamily: headingFont }}>{i + 1}</div>
            <div className="relative z-10 font-black mb-[16px]" style={{ fontSize: 64, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 32px ${accent}44` }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="relative z-10 font-bold mb-[10px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 30 }}>{step.title}</div>
            {step.description && <div className="relative z-10" style={{ fontFamily: bodyFont, fontSize: 24, opacity: 0.68, lineHeight: 1.4 }}>{step.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BIG NUMBER ────────────────────────────────────────────────────────────────
function BigNumberSplit({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stat = slide.stats?.[0];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex h-full overflow-hidden">
      <div className="relative w-[45%] flex items-center justify-center overflow-hidden" style={{ background: accentGrad(accent, 160) }}>
        <div className="absolute inset-0" style={dotBg('rgba(255,255,255,0.4)')} />
        <div className="absolute rounded-full" style={{ width: 640, height: 640, border: '1px solid rgba(255,255,255,0.12)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="absolute rounded-full" style={{ width: 420, height: 420, border: '1px solid rgba(255,255,255,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        {stat ? (
          <div className="relative z-10 flex flex-col items-center text-center px-[60px]">
            <div className="absolute pointer-events-none select-none text-white" style={{ fontSize: 380, fontFamily: headingFont, opacity: 0.1, lineHeight: 1, whiteSpace: 'nowrap', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>{stat.value}</div>
            <div className="relative z-10 font-black text-white" style={{ fontSize: 200, fontFamily: headingFont, lineHeight: 0.9, textShadow: '0 0 80px rgba(255,255,255,0.4)' }}>
              {stat.value}
            </div>
            <div className="relative z-10 font-semibold text-white/80 mt-[20px] uppercase tracking-widest text-center" style={{ fontFamily: bodyFont, fontSize: bSize || 32 }}>
              {stat.label}
            </div>
          </div>
        ) : (
          <p className="relative z-10 text-white/40 text-[40px]">Add a stat</p>
        )}
      </div>
      <div className="flex-1 relative flex flex-col justify-center px-[80px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
        <div className="absolute left-0 top-[20%] bottom-[20%] w-[4px]" style={{ background: accentGrad(accent, 180) }} />
        {slide.title && (
          <div className="font-bold uppercase tracking-widest mb-[20px]" style={{ fontFamily: headingFont, fontSize: 28, color: accent, opacity: 0.9 }}>{slide.title}</div>
        )}
        {slide.subtitle && (
          <p className="leading-snug" style={{ fontFamily: bodyFont, fontSize: hSize ? hSize * 0.4 : 42, color: headingColor }}>{slide.subtitle}</p>
        )}
      </div>
    </div>
  );
}

function BigNumberGauge({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stat = slide.stats?.[0];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const pct = stat ? Math.min(100, Math.max(0, parseMagnitude(stat.value))) : 75;
  const r = 270;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative flex flex-col items-center justify-center h-full px-[120px] py-[80px] text-center overflow-hidden" style={dotBg(accent)}>
      {slide.title && (
        <h2 className="relative z-10 font-bold mb-[32px] uppercase tracking-widest" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize ? hSize * 0.45 : 32, opacity: 0.7 }}>
          {slide.title}
        </h2>
      )}
      <div className="relative z-10" style={{ width: 620, height: 620 }}>
        <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, ${accent}22, transparent 70%)`, filter: 'blur(20px)' }} />
        <svg width="620" height="620" viewBox="0 0 620 620" style={{ transform: 'rotate(-90deg)', position: 'relative', zIndex: 1 }}>
          <circle cx="310" cy="310" r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'} strokeWidth="32" />
          <circle cx="310" cy="310" r={r} fill="none" stroke={accent} strokeWidth="32" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} style={{ filter: `drop-shadow(0 0 12px ${accent}88)` }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          {stat ? (
            <>
              <div className="font-black leading-none" style={{ fontSize: 160, color: accent, fontFamily: headingFont, textShadow: `0 0 60px ${accent}55` }}>{stat.value}</div>
              <div className="font-semibold mt-[12px]" style={{ fontFamily: bodyFont, fontSize: bSize || 30, color: headingColor, opacity: 0.75 }}>{stat.label}</div>
            </>
          ) : (
            <p style={{ opacity: 0.3, fontSize: 36 }}>Add a stat</p>
          )}
        </div>
      </div>
      {slide.subtitle && (
        <p className="relative z-10 mt-[16px]" style={{ fontFamily: bodyFont, fontSize: bSize ? bSize * 0.7 : 26, opacity: 0.6 }}>{slide.subtitle}</p>
      )}
    </div>
  );
}

// ── QUOTE ─────────────────────────────────────────────────────────────────────
function QuoteMagazine({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex h-full overflow-hidden">
      <div className="relative w-[38%] flex items-center justify-center overflow-hidden" style={{ background: accentGrad(accent, 160) }}>
        <div className="absolute inset-0" style={dotBg('rgba(255,255,255,0.4)')} />
        <div className="absolute rounded-full" style={{ width: 520, height: 520, border: '1px solid rgba(255,255,255,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div className="relative z-10 text-white" style={{ fontSize: 420, lineHeight: 0.7, opacity: 0.18, fontFamily: 'Georgia,"Times New Roman",serif' }}>❝</div>
      </div>
      <div className="flex-1 relative flex flex-col justify-center px-[90px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
        <div className="absolute" style={{ top: 60, left: 60, width: 40, height: 40, borderTop: `4px solid ${accent}`, borderLeft: `4px solid ${accent}` }} />
        <div className="font-black mb-[16px]" style={{ fontSize: 120, color: accent, lineHeight: 0.6, opacity: 0.6, fontFamily: 'Georgia,"Times New Roman",serif' }}>❝</div>
        <h2 className="relative z-10 font-medium leading-snug mb-[48px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 52, fontStyle: 'italic' }}>
          {slide.title}
        </h2>
        {slide.quoteAuthor && (
          <div className="flex items-center gap-[20px]">
            <div className="rounded-full" style={{ width: 60, height: 3, background: accentGrad(accent, 90) }} />
            <p className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: bodyFont, color: accent, fontSize: bSize || 26 }}>{slide.quoteAuthor}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuotePunch({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col justify-between h-full px-[120px] py-[100px] overflow-hidden" style={dotBg(accent)}>
      <div className="absolute pointer-events-none select-none" style={{ left: 60, top: -40, fontSize: 600, color: accent, opacity: 0.05, lineHeight: 0.7, fontFamily: 'Georgia,"Times New Roman",serif' }}>❝</div>
      <div className="absolute pointer-events-none select-none" style={{ right: 60, bottom: 0, fontSize: 600, color: accent, opacity: 0.05, lineHeight: 0.7, fontFamily: 'Georgia,"Times New Roman",serif' }}>❞</div>
      <div className="absolute pointer-events-none" style={{ top: 0, right: 0, bottom: 0, width: '35%', background: `linear-gradient(135deg, transparent 40%, ${accent}12)` }} />
      <div />
      <h2 className="relative z-10 font-black leading-[0.92]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 110, letterSpacing: '-0.025em', maxWidth: '80%' }}>
        {slide.title}
      </h2>
      <div className="relative z-10 flex items-center justify-end gap-[24px] mt-[40px]">
        {slide.quoteAuthor && (
          <>
            <div className="rounded-full" style={{ width: 100, height: 3, background: accentGrad(accent, 90) }} />
            <p className="font-bold uppercase tracking-[0.15em]" style={{ fontFamily: bodyFont, fontSize: bSize || 30, color: accent }}>{slide.quoteAuthor}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── TITLE ─────────────────────────────────────────────────────────────────────
function TitleSplit({ slide, headingFont, bodyFont, accentColor, headingColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#6366f1';
  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 relative flex flex-col justify-center px-[100px] py-[80px] overflow-hidden" style={gridBg(false)}>
        <div className="rounded-full mb-[40px]" style={{ width: 80, height: 6, background: accentGrad(accent, 90) }} />
        <h1 className="font-black leading-[0.95] mb-[36px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 88, letterSpacing: '-0.025em' }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ fontFamily: bodyFont, fontSize: bSize || 36, maxWidth: '80%', opacity: 0.65, lineHeight: 1.4 }}>{slide.subtitle}</p>
        )}
      </div>
      <div className="relative w-[44%] overflow-hidden" style={{ background: accentGrad(accent, 160) }}>
        <div className="absolute inset-0" style={dotBg('rgba(255,255,255,0.4)')} />
        <div className="absolute rounded-full" style={{ width: 640, height: 640, border: '2px solid rgba(255,255,255,0.15)', top: '50%', right: -220, transform: 'translateY(-50%)' }} />
        <div className="absolute rounded-full" style={{ width: 420, height: 420, border: '1px solid rgba(255,255,255,0.1)', top: '50%', right: -80, transform: 'translateY(-50%)' }} />
        <div className="absolute rounded-full" style={{ width: 200, height: 200, border: '1px solid rgba(255,255,255,0.07)', top: '50%', right: 80, transform: 'translateY(-50%)' }} />
        <div className="absolute" style={{ top: 80, left: 60, width: 50, height: 50, borderTop: '3px solid rgba(255,255,255,0.3)', borderLeft: '3px solid rgba(255,255,255,0.3)' }} />
        <div className="absolute" style={{ bottom: 80, right: 60, width: 50, height: 50, borderBottom: '3px solid rgba(255,255,255,0.3)', borderRight: '3px solid rgba(255,255,255,0.3)' }} />
      </div>
    </div>
  );
}

function TitleAsymmetric({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#6366f1';
  return (
    <div className="relative flex flex-col justify-center h-full px-[140px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -80, top: '50%', transform: 'translateY(-50%)', fontSize: 560, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont, letterSpacing: '-0.05em' }}>01</div>
      <div className="absolute pointer-events-none" style={{ bottom: 60, right: 140, width: 70, height: 70, borderBottom: `3px solid ${accent}66`, borderRight: `3px solid ${accent}66` }} />
      <div className="absolute pointer-events-none" style={{ top: 60, right: 140, width: 50, height: 50, borderTop: `2px solid ${accent}44`, borderRight: `2px solid ${accent}44` }} />
      <div className="relative z-10 flex items-center gap-[32px] mb-[36px]">
        <div className="h-[10px] rounded-full" style={{ width: 180, background: accentGrad(accent, 90) }} />
        <div className="uppercase tracking-widest font-semibold" style={{ fontFamily: bodyFont, fontSize: 26, color: accent, opacity: 0.85 }}>
          {slide.subtitle ? '01 / Introduction' : 'Begin'}
        </div>
      </div>
      <h1
        className="relative z-10 font-black leading-[0.92] mb-[44px]"
        style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 140, letterSpacing: '-0.03em', maxWidth: '88%' }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <div className="relative z-10 flex items-start gap-[28px]" style={{ maxWidth: '62%' }}>
          <div className="shrink-0 mt-[12px] rounded-full" style={{ width: 6, height: 48, background: accentGrad(accent, 180) }} />
          <p className="leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 38, opacity: 0.72 }}>{slide.subtitle}</p>
        </div>
      )}
    </div>
  );
}

// ── TITLE — premium variants used by the demo theme packs ───────────
function TitleHeroImage({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#A1F9F9';
  const img = slide.imageUrl || slide.images?.[0];
  return (
    <div className="relative h-full w-full overflow-hidden">
      {img && (
        <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: img
            ? `linear-gradient(180deg, ${slide.bgColor || '#000'}cc 0%, ${slide.bgColor || '#000'}66 45%, ${slide.bgColor || '#000'}f0 100%)`
            : `linear-gradient(135deg, ${slide.bgColor || '#000'}, ${accent}40)`,
        }}
      />
      <div className="relative z-10 flex flex-col justify-end h-full px-[140px] py-[120px]">
        <div className="flex items-center gap-[24px] mb-[40px]">
          <div className="h-[6px] w-[80px] rounded-full" style={{ backgroundColor: accent }} />
          {slide.subtitle && (
            <span className="uppercase tracking-[0.3em] opacity-80 font-medium" style={{ fontFamily: bodyFont, fontSize: 24, color: '#fff' }}>
              {slide.subtitle}
            </span>
          )}
        </div>
        <h1
          className="font-bold leading-[0.95] max-w-[85%]"
          style={{ fontFamily: headingFont, color: '#fff', fontSize: hSize || 132, letterSpacing: '-0.02em' }}
        >
          {slide.title}
        </h1>
      </div>
    </div>
  );
}

function TitleImageOverlay({ slide, headingFont, bodyFont, accentColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#A1F9F9';
  const img = slide.imageUrl || slide.images?.[0];
  return (
    <div className="relative h-full w-full overflow-hidden">
      {img && <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, ${slide.bgColor || '#000'}80 0%, ${slide.bgColor || '#000'}f0 70%)`,
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center text-center h-full px-[200px]">
        {slide.subtitle && (
          <div className="uppercase tracking-[0.4em] mb-[40px] font-medium" style={{ fontFamily: bodyFont, fontSize: 22, color: accent }}>
            {slide.subtitle}
          </div>
        )}
        <h1
          className="font-bold leading-[0.95] mb-[32px]"
          style={{ fontFamily: headingFont, color: '#fff', fontSize: hSize || 140, letterSpacing: '-0.03em' }}
        >
          {slide.title}
        </h1>
        <div className="h-[4px] w-[120px] rounded-full mt-[20px]" style={{ backgroundColor: accent }} />
      </div>
    </div>
  );
}

function TitleSplitImage({ slide, headingFont, bodyFont, accentColor, headingColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#A1F9F9';
  const img = slide.imageUrl || slide.images?.[0];
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col justify-center px-[100px] py-[100px]">
        {slide.subtitle && (
          <div className="uppercase tracking-[0.3em] mb-[36px] font-medium" style={{ fontFamily: bodyFont, fontSize: 22, color: accent }}>
            {slide.subtitle}
          </div>
        )}
        <h1
          className="font-bold leading-[0.95] mb-[40px]"
          style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 104, letterSpacing: '-0.02em' }}
        >
          {slide.title}
        </h1>
        <div className="h-[6px] w-[80px] rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <div className="w-[50%] relative overflow-hidden">
        {img ? (
          <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}55)` }} />
        )}
      </div>
    </div>
  );
}

function TitleEditorial({ slide, headingFont, bodyFont, accentColor, headingColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#A1F9F9';
  return (
    <div className="flex flex-col justify-between h-full px-[160px] py-[120px]">
      <div className="flex items-center gap-[24px]">
        <div className="font-mono uppercase tracking-[0.4em] opacity-50" style={{ fontFamily: bodyFont, fontSize: 22, color: headingColor }}>
          01 / Section
        </div>
        <div className="flex-1 h-[1px]" style={{ backgroundColor: `${headingColor}33` }} />
        <div className="font-mono uppercase tracking-[0.4em] opacity-50" style={{ fontFamily: bodyFont, fontSize: 22, color: headingColor }}>
          {new Date().getFullYear()}
        </div>
      </div>
      <div>
        <div className="h-[8px] w-[120px] rounded-full mb-[60px]" style={{ backgroundColor: accent }} />
        <h1
          className="font-bold leading-[0.92] mb-[48px]"
          style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 156, letterSpacing: '-0.03em', maxWidth: '95%' }}
        >
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="opacity-70 max-w-[70%] leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 36, color: headingColor }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: bodyFont, fontSize: 20, color: headingColor }}>
          Presented by
        </div>
        <div className="uppercase tracking-[0.3em] opacity-50" style={{ fontFamily: bodyFont, fontSize: 20, color: headingColor }}>
          {slide.subtitle ? '' : 'Begin'}
        </div>
      </div>
    </div>
  );
}

// ── CONTENT ──────────────────────────────────────────────────────
function ContentColumns({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const lines = (slide.body || '').split('\n').filter(Boolean);
  const half = Math.ceil(lines.length / 2);
  const left = lines.slice(0, half);
  const right = lines.slice(half);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={dotBg(accent)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -40, bottom: -60, fontSize: 480, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>≡</div>
      <div className="relative z-10 flex items-center gap-[24px] mb-[56px]">
        <div className="rounded-full" style={{ width: 56, height: 6, background: accentGrad(accent, 90) }} />
        <h2 className="font-bold" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72, textAlign: align }}>
          {slide.title}
        </h2>
      </div>
      <div className="flex-1 relative z-10 grid grid-cols-2 gap-[0]">
        {[left, right].map((col, ci) => (
          <div key={ci} className="relative" style={{ padding: ci === 0 ? '0 60px 0 0' : '0 0 0 60px', borderRight: ci === 0 ? `2px solid ${accent}22` : 'none' }}>
            {ci === 0 && <div className="absolute right-[-1px] top-0 bottom-0 w-[2px]" style={{ background: `linear-gradient(180deg, transparent, ${accent}55, transparent)` }} />}
            {col.map((line, i) => (
              <div key={i} className="flex items-start gap-[16px] mb-[24px]">
                <div className="shrink-0 mt-[14px] rounded-full" style={{ width: 8, height: 8, background: accent, opacity: 0.5 }} />
                <p className="leading-relaxed" style={{ fontFamily: bodyFont, fontSize: bSize || 36, color: headingColor }}>{line}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentIcons({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const lines = (slide.body || '').split('\n').filter(Boolean).map(l => l.replace(/^[•✓✗\-]\s*/, ''));
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={gridBg(isDark)}>
      <h2 className="relative z-10 font-bold mb-[56px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex flex-col justify-center gap-[20px]">
        {lines.map((line, i) => (
          <div key={i} className="relative overflow-hidden flex items-center gap-[32px]" style={{ ...glass(isDark), padding: '20px 36px 20px 28px' }}>
            <div className="absolute pointer-events-none select-none" style={{ right: -8, top: '50%', transform: 'translateY(-50%)', fontSize: 140, color: accent, opacity: 0.05, lineHeight: 1, fontFamily: headingFont }}>{i + 1}</div>
            <div className="relative flex items-center justify-center rounded-full font-black text-white shrink-0" style={{ width: 64, height: 64, background: accentGrad(accent), fontFamily: headingFont, fontSize: 26, boxShadow: `0 0 24px ${accent}44`, flexShrink: 0 }}>
              {i + 1}
            </div>
            <p className="relative z-10 leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 36, color: headingColor }}>
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentCards({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const lines = (slide.body || '').split('\n').filter(Boolean).map(l => l.replace(/^[•✓✗\-]\s*/, ''));
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const cols = lines.length <= 2 ? 2 : lines.length <= 4 ? 2 : 3;
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={dotBg(accent)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -60, bottom: -60, fontSize: 420, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>✦</div>
      <h2 className="relative z-10 font-bold mb-[50px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[24px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {lines.map((line, i) => (
          <div key={i} className="relative overflow-hidden flex items-start gap-[20px]" style={{ ...glass(isDark, accent), padding: '32px 32px 32px 36px' }}>
            <div className="absolute top-0 left-0 right-0 h-[4px]" style={{ background: accentGrad(accent, 90), borderRadius: '24px 24px 0 0' }} />
            <div className="absolute pointer-events-none select-none" style={{ right: -6, bottom: -24, fontSize: 180, color: accent, opacity: 0.06, lineHeight: 1, fontFamily: headingFont }}>{i + 1}</div>
            <div className="relative z-10 font-black shrink-0" style={{ fontSize: 40, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 24px ${accent}44`, minWidth: 52 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <p className="relative z-10 leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 28, color: headingColor }}>
              {line}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── CHART (helper + 3 variations) ───────────────────────────────
function buildChartPalette(accentColor: string | undefined, brandSecondary?: string, brandAccent?: string) {
  return [
    accentColor || '#6366f1',
    brandSecondary || '#a855f7',
    brandAccent || '#ec4899',
    '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  ];
}

function ChartCore({ chart, accentColor, isDark, height = '100%' }: {
  chart: ChartData;
  accentColor?: string;
  isDark: boolean;
  height?: number | string;
}) {
  const palette = buildChartPalette(accentColor);
  const tickColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  if (chart.type === 'pie' || chart.type === 'doughnut') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chart.data}
            dataKey="value"
            nameKey="label"
            cx="50%" cy="50%"
            outerRadius="80%"
            innerRadius={chart.type === 'doughnut' ? '45%' : 0}
            label={{ fontSize: 22, fill: tickColor }}
          >
            {chart.data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 22 }} />
        </PieChart>
      </ResponsiveContainer>
    );
  }
  const merged = chart.data.map((d, i) => ({
    label: d.label,
    [chart.series1Name || 'Value']: d.value,
    ...(chart.series2 && chart.series2[i] ? { [chart.series2Name || 'Series 2']: chart.series2[i].value } : {}),
  }));
  if (chart.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={merged}>
          <CartesianGrid stroke={gridColor} />
          <XAxis dataKey="label" tick={{ fontSize: 20, fill: tickColor }} />
          <YAxis tick={{ fontSize: 20, fill: tickColor }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 22 }} />
          <Line type="monotone" dataKey={chart.series1Name || 'Value'} stroke={palette[0]} strokeWidth={4} dot={{ r: 6 }} />
          {chart.series2 && <Line type="monotone" dataKey={chart.series2Name || 'Series 2'} stroke={palette[1]} strokeWidth={4} dot={{ r: 6 }} />}
        </LineChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={merged}>
        <CartesianGrid stroke={gridColor} />
        <XAxis dataKey="label" tick={{ fontSize: 20, fill: tickColor }} />
        <YAxis tick={{ fontSize: 20, fill: tickColor }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 22 }} />
        <Bar dataKey={chart.series1Name || 'Value'} fill={palette[0]} radius={[8, 8, 0, 0]} />
        {chart.series2 && <Bar dataKey={chart.series2Name || 'Series 2'} fill={palette[1]} radius={[8, 8, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

function ChartCallout({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  if (!slide.chart || !slide.chart.data?.length) {
    return <div className="h-full flex items-center justify-center opacity-30 text-[32px]">No chart data</div>;
  }
  const peak = slide.chart.data.reduce((acc, d) => (d.value > acc.value ? d : acc), slide.chart.data[0]);
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
      <h2 className="relative z-10 font-bold mb-[40px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[60px]" style={{ gridTemplateColumns: '1fr 360px' }}>
        <div className="min-h-0">
          <ChartCore chart={slide.chart} accentColor={accent} isDark={isDark} />
        </div>
        <div className="relative overflow-hidden flex flex-col items-center justify-center text-center" style={{ ...glass(isDark, accent), padding: '48px 36px' }}>
          <div className="absolute top-0 left-0 right-0 h-[5px]" style={{ background: accentGrad(accent, 90), borderRadius: '24px 24px 0 0' }} />
          <div className="absolute pointer-events-none select-none" style={{ bottom: -28, right: -12, fontSize: 220, color: accent, opacity: 0.06, lineHeight: 1, fontFamily: headingFont }}>{peak.value.toLocaleString()}</div>
          <div className="absolute pointer-events-none" style={{ top: '45%', left: '50%', transform: 'translate(-50%,-50%)', width: 180, height: 180, borderRadius: '50%', background: `${accent}1e`, filter: 'blur(28px)' }} />
          <div className="relative z-10 uppercase tracking-widest font-semibold mb-[16px]" style={{ fontFamily: bodyFont, fontSize: 22, color: accent }}>
            Peak
          </div>
          <div className="relative z-10 font-black mb-[12px]" style={{ fontSize: 88, color: accent, fontFamily: headingFont, lineHeight: 1, textShadow: `0 0 40px ${accent}55` }}>
            {peak.value.toLocaleString()}
          </div>
          <div className="relative z-10 font-medium" style={{ fontFamily: bodyFont, fontSize: 26, color: headingColor, opacity: 0.8 }}>
            {peak.label}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartWithStat({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const stat = slide.stats?.[0];
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <h2 className="relative z-10 font-bold mb-[40px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[60px]" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="min-h-0">
          {slide.chart && slide.chart.data?.length ? (
            <ChartCore chart={slide.chart} accentColor={accent} isDark={isDark} />
          ) : (
            <div className="h-full flex items-center justify-center opacity-30 text-[32px]">No chart data</div>
          )}
        </div>
        <div className="relative overflow-hidden flex flex-col items-center justify-center text-center" style={{ ...glass(isDark, accent), padding: '48px 36px' }}>
          <div className="absolute pointer-events-none" style={{ top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', background: `${accent}22`, filter: 'blur(40px)' }} />
          {stat ? (
            <>
              <div className="relative z-10 font-black leading-none mb-[20px]" style={{ fontSize: 140, color: accent, fontFamily: headingFont, lineHeight: 0.88, textShadow: `0 0 60px ${accent}55` }}>
                {stat.value}
              </div>
              <div className="relative z-10 rounded-full mb-[16px]" style={{ width: 48, height: 3, background: accentGrad(accent, 90) }} />
              <div className="relative z-10 leading-snug font-semibold" style={{ fontFamily: bodyFont, fontSize: 30, color: headingColor, opacity: 0.75 }}>
                {stat.label}
              </div>
            </>
          ) : (
            <p className="relative z-10 opacity-30 text-[28px]">Add a stat for the side panel</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChartTakeaway({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const takeaway = slide.notes || slide.body || '';
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[60px] overflow-hidden" style={gridBg(isDark)}>
      <h2 className="relative z-10 font-bold mb-[24px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 56, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 min-h-0 mb-[28px]">
        {slide.chart && slide.chart.data?.length ? (
          <ChartCore chart={slide.chart} accentColor={accent} isDark={isDark} />
        ) : (
          <div className="h-full flex items-center justify-center opacity-30 text-[32px]">No chart data</div>
        )}
      </div>
      {takeaway && (
        <div className="relative z-10 overflow-hidden flex items-start gap-[24px]" style={{ ...glass(isDark, accent), padding: '28px 36px', borderLeft: `6px solid ${accent}` }}>
          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, bottom: 0, width: 120, background: `linear-gradient(90deg, ${accent}10, transparent)` }} />
          <div className="relative z-10 font-black uppercase tracking-widest shrink-0 mt-[4px]" style={{ fontFamily: headingFont, color: accent, fontSize: 22, textShadow: `0 0 20px ${accent}44` }}>
            ↑ Takeaway
          </div>
          <p className="relative z-10 leading-snug" style={{ fontFamily: bodyFont, fontSize: 28, color: headingColor }}>
            {takeaway}
          </p>
        </div>
      )}
    </div>
  );
}

// ── COMPARISON ──────────────────────────────────────────────────
function ComparisonCards({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const [leftRaw = '', rightRaw = ''] = (slide.body || '').split('---');
  const renderPanel = (raw: string, isHero: boolean) => {
    const lines = raw.trim().split('\n').filter(Boolean);
    const heading = lines[0] || (isHero ? 'After' : 'Before');
    const items = lines.slice(1);
    return (
      <div className="relative flex-1 overflow-hidden flex flex-col" style={isHero ? { ...glass(isDark, accent), padding: '0 0 36px' } : { ...glass(isDark), padding: '0 0 36px' }}>
        <div className="h-[6px] shrink-0" style={{ background: isHero ? accentGrad(accent, 90) : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'), borderRadius: '24px 24px 0 0' }} />
        {isHero && <div className="absolute pointer-events-none" style={{ top: '40%', left: '50%', transform: 'translate(-50%,-50%)', width: 200, height: 200, borderRadius: '50%', background: `${accent}1a`, filter: 'blur(40px)' }} />}
        <div className="relative z-10 flex flex-col flex-1 px-[44px] pt-[36px]">
          <div className="uppercase tracking-widest font-black mb-[28px]" style={{ fontFamily: headingFont, color: isHero ? accent : headingColor, fontSize: 24, opacity: isHero ? 1 : 0.55, textShadow: isHero ? `0 0 20px ${accent}44` : 'none' }}>
            {heading}
          </div>
          <div className="flex-1 flex flex-col gap-[18px]">
            {items.map((line, i) => (
              <div key={i} className="flex items-start gap-[16px]">
                <div className="shrink-0 mt-[12px] rounded-full" style={{ width: 8, height: 8, background: isHero ? accent : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)') }} />
                <p className="leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 30, color: headingColor }}>
                  {line.replace(/^[•✓✗\-]\s*/, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <div className="absolute pointer-events-none select-none" style={{ left: '50%', top: '55%', transform: 'translate(-50%,-50%)', fontSize: 440, color: accent, opacity: 0.03, lineHeight: 1, fontFamily: headingFont, letterSpacing: '-0.05em' }}>VS</div>
      <h2 className="relative z-10 font-bold mb-[40px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex gap-[32px] items-stretch">
        {renderPanel(leftRaw, false)}
        <div className="shrink-0 flex items-center justify-center" style={{ width: 72 }}>
          <div className="flex items-center justify-center rounded-full font-black" style={{ width: 72, height: 72, background: accentGrad(accent), color: '#fff', fontFamily: headingFont, fontSize: 22, boxShadow: `0 0 32px ${accent}55` }}>VS</div>
        </div>
        {renderPanel(rightRaw, true)}
      </div>
    </div>
  );
}

function ComparisonStacked({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const [topRaw = '', bottomRaw = ''] = (slide.body || '').split('---');
  const lineToBullet = (line: string) => line.replace(/^[•✓✗\-]\s*/, '');
  const topLines = topRaw.trim().split('\n').filter(Boolean);
  const bottomLines = bottomRaw.trim().split('\n').filter(Boolean);
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={gridBg(isDark)}>
      <h2 className="relative z-10 font-bold mb-[32px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 60 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid grid-rows-2 gap-[28px]">
        <div className="relative overflow-hidden" style={{ ...glass(isDark), padding: '28px 44px' }}>
          <div className="absolute pointer-events-none select-none" style={{ right: -12, top: '50%', transform: 'translateY(-50%)', fontSize: 180, color: accent, opacity: 0.05, lineHeight: 1, fontFamily: headingFont }}>A</div>
          <div className="relative z-10 font-black uppercase tracking-widest mb-[16px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 22, opacity: 0.5 }}>
            Before
          </div>
          <div className="relative z-10 flex flex-wrap gap-x-[36px] gap-y-[10px]">
            {topLines.map((l, i) => (
              <div key={i} className="flex items-center gap-[12px]">
                <div className="rounded-full shrink-0" style={{ width: 7, height: 7, background: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)' }} />
                <p style={{ fontFamily: bodyFont, fontSize: bSize || 30, color: headingColor, opacity: 0.72 }}>{lineToBullet(l)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden" style={{ ...glass(isDark, accent), padding: '28px 44px', borderLeft: `6px solid ${accent}` }}>
          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, bottom: 0, width: 160, background: `linear-gradient(90deg, ${accent}10, transparent)` }} />
          <div className="absolute pointer-events-none select-none" style={{ right: -12, top: '50%', transform: 'translateY(-50%)', fontSize: 180, color: accent, opacity: 0.07, lineHeight: 1, fontFamily: headingFont }}>B</div>
          <div className="relative z-10 font-black uppercase tracking-widest mb-[16px]" style={{ fontFamily: headingFont, color: accent, fontSize: 22, textShadow: `0 0 20px ${accent}44` }}>
            After →
          </div>
          <div className="relative z-10 flex flex-wrap gap-x-[36px] gap-y-[10px]">
            {bottomLines.map((l, i) => (
              <div key={i} className="flex items-center gap-[12px]">
                <div className="rounded-full shrink-0" style={{ width: 8, height: 8, background: accent }} />
                <p style={{ fontFamily: bodyFont, fontSize: bSize || 30, color: headingColor }}>{lineToBullet(l)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComparisonBars({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const muted = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)';
  const [leftRaw = '', rightRaw = ''] = (slide.body || '').split('---');
  const leftLines = leftRaw.trim().split('\n').filter(Boolean);
  const rightLines = rightRaw.trim().split('\n').filter(Boolean);
  const max = Math.max(leftLines.length, rightLines.length);
  const rows = Array.from({ length: max }, (_, i) => ({
    left: leftLines[i] || '',
    right: rightLines[i] || '',
  }));
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={dotBg(accent)}>
      <h2 className="relative z-10 font-bold mb-[40px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 grid gap-[16px]" style={{ gridTemplateRows: `repeat(${max}, 1fr)` }}>
        {rows.map((row, i) => {
          const leftLen = parseMagnitude(row.left.replace(/[^\d.×%$]/g, '')) || row.left.length;
          const rightLen = parseMagnitude(row.right.replace(/[^\d.×%$]/g, '')) || row.right.length;
          const total = Math.max(leftLen + rightLen, 1);
          const lp = (leftLen / total) * 100;
          return (
            <div key={i} className="grid items-center gap-[12px]" style={{ gridTemplateColumns: '1fr 88px 1fr' }}>
              <div className="h-[56px] flex items-center justify-end px-[24px] overflow-hidden" style={{ background: `linear-gradient(90deg, transparent, ${muted})`, width: `${Math.max(25, lp)}%`, marginLeft: 'auto', borderRadius: '12px 0 0 12px', color: headingColor, fontFamily: bodyFont, fontSize: 24, fontWeight: 500 }}>
                {row.left.replace(/^[•✓✗\-]\s*/, '')}
              </div>
              <div className="flex items-center justify-center">
                <div className="flex items-center justify-center rounded-full font-black text-white" style={{ width: 56, height: 56, background: accentGrad(accent), fontFamily: headingFont, fontSize: 18, boxShadow: `0 0 20px ${accent}44` }}>VS</div>
              </div>
              <div className="h-[56px] flex items-center px-[24px] overflow-hidden" style={{ background: accentGrad(accent, 90), width: `${Math.max(25, 100 - lp)}%`, borderRadius: '0 12px 12px 0', color: 'white', fontFamily: bodyFont, fontSize: 24, fontWeight: 600, boxShadow: `0 0 24px ${accent}33` }}>
                {row.right.replace(/^[•✓✗\-]\s*/, '')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TWO-COLUMN ──────────────────────────────────────────────────
function TwoColumnWideLeft({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const [leftRaw = '', rightRaw = ''] = (slide.body || '').split('---');
  const leftLines = leftRaw.trim().split('\n').filter(Boolean);
  const rightLines = rightRaw.trim().split('\n').filter(Boolean);
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[100px] overflow-hidden" style={gridBg(isDark)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -40, bottom: -60, fontSize: 400, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>◈</div>
      <div className="relative z-10 flex items-center gap-[24px] mb-[52px]">
        <div className="rounded-full" style={{ width: 52, height: 6, background: accentGrad(accent, 90) }} />
        <h2 className="font-bold" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
          {slide.title}
        </h2>
      </div>
      <div className="flex-1 relative z-10 grid gap-[48px]" style={{ gridTemplateColumns: '7fr 3fr' }}>
        <div>
          {leftLines.map((line, i) => (
            <p key={i} className="leading-relaxed mb-[22px]" style={{ fontFamily: bodyFont, fontSize: bSize || 38, color: headingColor }}>{line}</p>
          ))}
        </div>
        <div className="relative overflow-hidden flex flex-col gap-[16px]" style={{ ...glass(isDark, accent), padding: '36px 32px', borderLeft: `5px solid ${accent}` }}>
          <div className="absolute pointer-events-none" style={{ left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg, ${accent}0e, transparent)` }} />
          {rightLines.map((line, i) => (
            <div key={i} className="relative z-10 flex items-start gap-[12px]">
              <div className="shrink-0 mt-[10px] rounded-full" style={{ width: 7, height: 7, background: accent, boxShadow: `0 0 8px ${accent}55` }} />
              <p className="leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 28, color: headingColor }}>{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoColumnImageText({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const lines = (slide.body || '').replace(/---/g, '\n').split('\n').filter(Boolean);
  const heroImg = slide.imageUrl || slide.images?.[0];
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-[46%] relative overflow-hidden">
        {heroImg ? (
          <>
            <img src={heroImg} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accent}30 0%, transparent 60%)` }} />
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${accent}, ${accent}77)` }}>
            <div className="absolute inset-0" style={dotBg('rgba(255,255,255,0.35)')} />
            <div className="absolute rounded-full" style={{ width: 480, height: 480, border: '1px solid rgba(255,255,255,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
            <p className="relative z-10 text-white/50 text-[28px]" style={{ fontFamily: bodyFont }}>Add an image</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[4px]" style={{ background: accentGrad(accent, 90) }} />
      </div>
      <div className="flex-1 relative flex flex-col justify-center px-[80px] py-[80px] overflow-hidden" style={{ ...dotBg(accent), textAlign: align }}>
        <div className="absolute pointer-events-none select-none" style={{ right: -40, bottom: -40, fontSize: 360, color: accent, opacity: 0.04, lineHeight: 1, fontFamily: headingFont }}>✦</div>
        <div className="relative z-10 rounded-full mb-[28px]" style={{ width: 60, height: 6, background: accentGrad(accent, 90) }} />
        <h2 className="relative z-10 font-bold mb-[36px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 56 }}>
          {slide.title}
        </h2>
        <div className="relative z-10">
          {lines.map((line, i) => (
            <div key={i} className="flex items-start gap-[16px] mb-[20px]">
              <div className="shrink-0 mt-[14px] rounded-full" style={{ width: 7, height: 7, background: accent, opacity: 0.7 }} />
              <p className="leading-relaxed" style={{ fontFamily: bodyFont, fontSize: bSize || 32, color: headingColor }}>{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TwoColumnStacked({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const [topRaw = '', bottomRaw = ''] = (slide.body || '').split('---');
  const splitInTwo = (raw: string) => {
    const lines = raw.trim().split('\n').filter(Boolean);
    const half = Math.ceil(lines.length / 2);
    return [lines.slice(0, half), lines.slice(half)];
  };
  const [topL, topR] = splitInTwo(topRaw);
  const [botL, botR] = splitInTwo(bottomRaw);
  const renderRow = (left: string[], right: string[], label: string, hero: boolean) => (
    <div className="relative flex-1 overflow-hidden" style={hero ? { ...glass(isDark, accent), borderLeft: `6px solid ${accent}` } : glass(isDark)}>
      <div className="absolute pointer-events-none select-none" style={{ right: -8, top: '50%', transform: 'translateY(-50%)', fontSize: 180, color: accent, opacity: hero ? 0.07 : 0.04, lineHeight: 1, fontFamily: headingFont }}>{label.slice(-1)}</div>
      {hero && <div className="absolute pointer-events-none" style={{ left: 0, top: 0, bottom: 0, width: 140, background: `linear-gradient(90deg, ${accent}0e, transparent)` }} />}
      <div className="relative z-10 p-[32px] h-full flex flex-col">
        <div className="font-black uppercase tracking-widest mb-[16px]" style={{ fontFamily: headingFont, color: hero ? accent : headingColor, fontSize: 22, opacity: hero ? 1 : 0.55, textShadow: hero ? `0 0 20px ${accent}44` : 'none' }}>
          {label}
        </div>
        <div className="grid grid-cols-2 gap-x-[40px] gap-y-[12px]">
          {[...left, ...right].map((line, i) => (
            <div key={i} className="flex items-start gap-[12px]">
              <div className="shrink-0 mt-[10px] rounded-full" style={{ width: 7, height: 7, background: hero ? accent : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)') }} />
              <p style={{ fontFamily: bodyFont, fontSize: bSize || 26, color: headingColor }}>{line.replace(/^[•✓✗\-]\s*/, '')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  return (
    <div className="relative flex flex-col h-full px-[120px] py-[80px] overflow-hidden" style={{ ...dotBg(accent), textAlign: align }}>
      <h2 className="relative z-10 font-bold mb-[32px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 60 }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative z-10 flex flex-col gap-[24px]">
        {renderRow(topL, topR, 'Section A', false)}
        {renderRow(botL, botR, 'Section B', true)}
      </div>
    </div>
  );
}

// ── DISPATCHER ──────────────────────────────────────────────────
export function renderLayoutVariation(ctx: VariationContext): React.ReactNode | null {
  const { layout, variation } = ctx.slide;
  if (!variation) return null;
  const key = `${layout}:${variation}`;
  switch (key) {
    case 'stats:grid':         return <StatsGrid {...ctx} />;
    case 'stats:ranked':       return <StatsRanked {...ctx} />;
    case 'stats:cards':        return <StatsCards {...ctx} />;
    case 'timeline:vertical':  return <TimelineVertical {...ctx} />;
    case 'timeline:zigzag':    return <TimelineZigzag {...ctx} />;
    case 'timeline:cards':     return <TimelineCards {...ctx} />;
    case 'process:circular':   return <ProcessCircular {...ctx} />;
    case 'process:stairs':     return <ProcessStairs {...ctx} />;
    case 'process:cards':      return <ProcessCards {...ctx} />;
    case 'big-number:split':   return <BigNumberSplit {...ctx} />;
    case 'big-number:gauge':   return <BigNumberGauge {...ctx} />;
    case 'quote:magazine':     return <QuoteMagazine {...ctx} />;
    case 'quote:punch':        return <QuotePunch {...ctx} />;
    case 'title:split':        return <TitleSplit {...ctx} />;
    case 'title:asymmetric':   return <TitleAsymmetric {...ctx} />;
    case 'title:hero-image':    return <TitleHeroImage {...ctx} />;
    case 'title:image-overlay': return <TitleImageOverlay {...ctx} />;
    case 'title:split-image':   return <TitleSplitImage {...ctx} />;
    case 'title:editorial':     return <TitleEditorial {...ctx} />;
    case 'content:columns':    return <ContentColumns {...ctx} />;
    case 'content:icons':      return <ContentIcons {...ctx} />;
    case 'content:cards':      return <ContentCards {...ctx} />;
    case 'chart:callout':      return <ChartCallout {...ctx} />;
    case 'chart:with-stat':    return <ChartWithStat {...ctx} />;
    case 'chart:takeaway':     return <ChartTakeaway {...ctx} />;
    case 'comparison:cards':   return <ComparisonCards {...ctx} />;
    case 'comparison:stacked': return <ComparisonStacked {...ctx} />;
    case 'comparison:bars':    return <ComparisonBars {...ctx} />;
    case 'two-column:wide-left':  return <TwoColumnWideLeft {...ctx} />;
    case 'two-column:image-text': return <TwoColumnImageText {...ctx} />;
    case 'two-column:stacked':    return <TwoColumnStacked {...ctx} />;
    default: return null;
  }
}
