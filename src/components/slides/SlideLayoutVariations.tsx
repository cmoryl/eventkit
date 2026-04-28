import React from 'react';
import type { SlideData } from './slideTypes';

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

/** Pull the first numeric portion out of a stat value so we can size relative bars. */
function parseMagnitude(value: string): number {
  const match = value.match(/(-?\d+\.?\d*)/);
  if (!match) return 1;
  return Math.abs(parseFloat(match[1]));
}

// ── STATS ────────────────────────────────────────────────────────
function StatsGrid({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stats = slide.stats || [];
  const cols = stats.length <= 4 ? 2 : 3;
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex flex-col h-full px-[120px] py-[100px]">
      <h2 className="font-bold mb-[60px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}>
        {slide.title}
      </h2>
      <div className="flex-1 grid gap-[60px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {stats.map((stat, i) => (
          <div key={i} className="flex flex-col justify-center items-center text-center rounded-[24px] p-[40px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}>
            <div className="font-bold mb-[16px]" style={{ fontSize: 84, color: accent, fontFamily: headingFont, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div className="opacity-70 uppercase tracking-widest" style={{ fontSize: bSize || 24, fontFamily: bodyFont }}>
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
    <div className="flex flex-col h-full px-[120px] py-[100px]">
      <h2 className="font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 flex flex-col justify-center gap-[28px]">
        {stats.map((stat, i) => {
          const pct = (parseMagnitude(stat.value) / max) * 100;
          return (
            <div key={i} className="flex items-center gap-[40px]">
              <div className="font-medium" style={{ minWidth: 280, fontFamily: bodyFont, fontSize: 32, color: headingColor, opacity: 0.85 }}>
                {stat.label}
              </div>
              <div className="flex-1 h-[40px] rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                <div className="h-full rounded-full" style={{ width: `${Math.max(8, pct)}%`, background: `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />
              </div>
              <div className="font-bold" style={{ fontFamily: headingFont, color: accent, fontSize: 44, minWidth: 200, textAlign: 'right' }}>
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
    <div className="flex flex-col h-full px-[120px] py-[100px]">
      <h2 className="font-bold mb-[60px] text-center" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}>
        {slide.title}
      </h2>
      <div className="flex-1 flex items-center justify-center gap-[32px] flex-wrap">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center rounded-[20px] px-[48px] py-[40px]"
            style={{
              minWidth: 280,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
              border: `2px solid ${accent}40`,
              boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div className="w-[40px] h-[4px] rounded-full mb-[20px]" style={{ backgroundColor: accent }} />
            <div className="font-bold mb-[12px]" style={{ fontSize: 80, color: accent, fontFamily: headingFont, lineHeight: 1 }}>
              {stat.value}
            </div>
            <div className="opacity-70 uppercase tracking-widest" style={{ fontSize: bSize || 22, fontFamily: bodyFont }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TIMELINE ─────────────────────────────────────────────────────
function TimelineVertical({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = slide.timeline || [];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[40px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative grid gap-[20px]" style={{ gridTemplateColumns: '180px 60px 1fr' }}>
        <div className="absolute" style={{ left: 209, top: 16, bottom: 16, width: 4, backgroundColor: accent, opacity: 0.25, borderRadius: 2 }} />
        {steps.slice(0, 6).map((step, i) => (
          <React.Fragment key={i}>
            <div className="text-right uppercase tracking-widest font-semibold pt-[8px]" style={{ fontFamily: bodyFont, color: accent, fontSize: 28 }}>
              {step.date || '—'}
            </div>
            <div className="flex items-start justify-center pt-[8px]">
              <div className="rounded-full" style={{ width: 28, height: 28, backgroundColor: accent, boxShadow: `0 0 0 6px ${isDark ? 'rgba(15,23,42,1)' : 'white'}` }} />
            </div>
            <div className="pb-[20px]">
              <div className="font-semibold mb-[6px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 36 }}>{step.title}</div>
              {step.description && (
                <div className="opacity-70 leading-snug" style={{ fontFamily: bodyFont, fontSize: 26 }}>{step.description}</div>
              )}
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
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative">
        <div className="absolute left-0 right-0 h-[6px] rounded-full" style={{ top: '50%', transform: 'translateY(-50%)', backgroundColor: accent, opacity: 0.25 }} />
        <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${Math.max(1, steps.length)}, minmax(0, 1fr))` }}>
          {steps.map((step, i) => {
            const isTop = i % 2 === 0;
            return (
              <div key={i} className="relative flex flex-col items-center justify-center px-[12px]">
                <div
                  className="rounded-full flex items-center justify-center font-bold text-white absolute"
                  style={{ width: 80, height: 80, backgroundColor: accent, fontFamily: headingFont, fontSize: 32, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}
                >
                  {i + 1}
                </div>
                <div
                  className="text-center px-[12px]"
                  style={{ position: 'absolute', left: 0, right: 0, [isTop ? 'bottom' : 'top']: 'calc(50% + 60px)' }}
                >
                  {step.date && (
                    <div className="uppercase tracking-widest opacity-60 mb-[8px]" style={{ fontFamily: bodyFont, fontSize: 22 }}>{step.date}</div>
                  )}
                  <div className="font-semibold" style={{ fontFamily: headingFont, color: headingColor, fontSize: 30 }}>{step.title}</div>
                  {step.description && (
                    <div className="opacity-70 leading-snug mt-[4px]" style={{ fontFamily: bodyFont, fontSize: 22 }}>{step.description}</div>
                  )}
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
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 grid gap-[24px]" style={{ gridTemplateColumns: `repeat(${Math.max(1, steps.length)}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[20px] p-[36px] flex flex-col"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'white',
              border: `2px solid ${accent}33`,
              boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div className="font-bold uppercase tracking-widest mb-[16px]" style={{ fontFamily: headingFont, color: accent, fontSize: 24 }}>
              {step.date || `Step ${i + 1}`}
            </div>
            <div className="font-semibold mb-[12px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 32 }}>{step.title}</div>
            {step.description && (
              <div className="opacity-75 leading-snug" style={{ fontFamily: bodyFont, fontSize: 24 }}>{step.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── PROCESS ──────────────────────────────────────────────────────
function ProcessCircular({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, align }: VariationContext) {
  const steps = (slide.process || []).slice(0, 6);
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  const radius = 320;
  return (
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[40px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 relative flex items-center justify-center">
        <div
          className="rounded-full"
          style={{
            width: radius * 2 + 60,
            height: radius * 2 + 60,
            border: `3px dashed ${accent}40`,
          }}
        />
        {steps.map((step, i) => {
          const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center text-center"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
                width: 220,
              }}
            >
              <div
                className="rounded-full flex items-center justify-center font-bold text-white mb-[16px]"
                style={{ width: 96, height: 96, backgroundColor: accent, fontFamily: headingFont, fontSize: 40, boxShadow: `0 0 0 8px ${isDark ? 'rgba(15,23,42,1)' : 'white'}` }}
              >
                {i + 1}
              </div>
              <div className="font-semibold" style={{ fontFamily: headingFont, color: headingColor, fontSize: 28 }}>{step.title}</div>
              {step.description && (
                <div className="opacity-70 leading-snug mt-[6px]" style={{ fontFamily: bodyFont, fontSize: 20 }}>{step.description}</div>
              )}
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
  return (
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 flex items-end justify-center gap-[16px]">
        {steps.map((step, i) => {
          const heightPct = 35 + (i / Math.max(1, steps.length - 1)) * 55;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end" style={{ maxWidth: 240 }}>
              <div className="font-bold mb-[16px]" style={{ fontSize: 56, color: accent, fontFamily: headingFont, lineHeight: 1 }}>
                {String(i + 1).padStart(2, '0')}
              </div>
              <div
                className="w-full rounded-t-[16px] flex flex-col items-center justify-center text-center px-[24px] py-[28px]"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  borderTop: `4px solid ${accent}`,
                }}
              >
                <div className="font-semibold mb-[8px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 28 }}>{step.title}</div>
                {step.description && (
                  <div className="opacity-70 leading-snug" style={{ fontFamily: bodyFont, fontSize: 20 }}>{step.description}</div>
                )}
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
    <div className="flex flex-col h-full px-[120px] py-[80px]">
      <h2 className="font-bold mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}>
        {slide.title}
      </h2>
      <div className="flex-1 grid gap-[28px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => (
          <div
            key={i}
            className="rounded-[20px] p-[40px] flex flex-col"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
              border: `2px solid ${accent}33`,
              boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.08)',
            }}
          >
            <div className="font-bold mb-[20px]" style={{ fontSize: 64, color: accent, fontFamily: headingFont, lineHeight: 1 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div className="font-semibold mb-[12px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 32 }}>{step.title}</div>
            {step.description && (
              <div className="opacity-75 leading-snug" style={{ fontFamily: bodyFont, fontSize: 24 }}>{step.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BIG NUMBER ──────────────────────────────────────────────────
function BigNumberSplit({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stat = slide.stats?.[0];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex h-full px-[120px] py-[100px] gap-[80px] items-center">
      <div className="flex-1 flex flex-col items-end justify-center pr-[40px]" style={{ borderRight: `4px solid ${accent}40` }}>
        {stat ? (
          <>
            <div className="font-bold leading-none" style={{ fontSize: 240, color: accent, fontFamily: headingFont }}>
              {stat.value}
            </div>
            <div className="font-medium opacity-80 mt-[24px] text-right" style={{ fontFamily: bodyFont, fontSize: bSize || 36, color: headingColor }}>
              {stat.label}
            </div>
          </>
        ) : (
          <p className="opacity-30 text-[40px]">Add a stat in the editor</p>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center pl-[40px]">
        {slide.title && (
          <div className="font-semibold uppercase tracking-widest opacity-60 mb-[24px]" style={{ fontFamily: headingFont, fontSize: 28 }}>
            {slide.title}
          </div>
        )}
        {slide.subtitle && (
          <p className="leading-snug" style={{ fontFamily: bodyFont, fontSize: hSize ? hSize * 0.4 : 38, color: headingColor }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function BigNumberGauge({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const stat = slide.stats?.[0];
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  // Try to interpret stat as a percent (0-100); fall back to 75%
  const pct = stat ? Math.min(100, Math.max(0, parseMagnitude(stat.value))) : 75;
  const r = 280;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="flex flex-col items-center justify-center h-full px-[120px] py-[80px] text-center gap-[24px]">
      {slide.title && (
        <h2 className="font-semibold opacity-70 uppercase tracking-widest" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize ? hSize * 0.45 : 32 }}>
          {slide.title}
        </h2>
      )}
      <div className="relative" style={{ width: 640, height: 640 }}>
        <svg width="640" height="640" viewBox="0 0 640 640" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="320" cy="320" r={r} fill="none" stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'} strokeWidth="36" />
          <circle
            cx="320" cy="320" r={r}
            fill="none" stroke={accent} strokeWidth="36" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {stat ? (
            <>
              <div className="font-bold leading-none" style={{ fontSize: 180, color: accent, fontFamily: headingFont }}>
                {stat.value}
              </div>
              <div className="font-medium opacity-80 mt-[16px]" style={{ fontFamily: bodyFont, fontSize: bSize || 32, color: headingColor }}>
                {stat.label}
              </div>
            </>
          ) : (
            <p className="opacity-30 text-[40px]">Add a stat</p>
          )}
        </div>
      </div>
      {slide.subtitle && (
        <p className="opacity-60" style={{ fontFamily: bodyFont, fontSize: bSize ? bSize * 0.7 : 26 }}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

// ── QUOTE ───────────────────────────────────────────────────────
function QuoteMagazine({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex h-full">
      <div
        className="w-[40%] flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
        }}
      >
        <div className="font-bold text-white opacity-80" style={{ fontSize: 320, fontFamily: 'Georgia, serif', lineHeight: 0.8 }}>
          "
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center px-[100px] py-[80px]">
        <h2 className="font-medium leading-snug mb-[60px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 56 }}>
          {slide.title}
        </h2>
        {slide.quoteAuthor && (
          <div className="flex items-center gap-[20px]">
            <div className="w-[60px] h-[4px] rounded-full" style={{ backgroundColor: accent }} />
            <p className="font-semibold uppercase tracking-widest opacity-80" style={{ fontFamily: bodyFont, fontSize: bSize || 28 }}>
              {slide.quoteAuthor}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function QuotePunch({ slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize }: VariationContext) {
  const accent = accentColor || (isDark ? '#a78bfa' : '#6366f1');
  return (
    <div className="flex flex-col justify-between h-full px-[120px] py-[100px]">
      <div className="font-bold opacity-15" style={{ fontSize: 280, color: accent, fontFamily: 'Georgia, serif', lineHeight: 0.7 }}>
        "
      </div>
      <h2
        className="font-bold leading-none -mt-[120px]"
        style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 120, letterSpacing: '-0.02em' }}
      >
        {slide.title}
      </h2>
      <div className="flex items-center justify-end gap-[24px]">
        {slide.quoteAuthor && (
          <>
            <div className="w-[120px] h-[3px]" style={{ backgroundColor: accent }} />
            <p className="font-semibold uppercase tracking-widest" style={{ fontFamily: bodyFont, fontSize: bSize || 32, color: accent }}>
              {slide.quoteAuthor}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ── TITLE ───────────────────────────────────────────────────────
function TitleSplit({ slide, headingFont, bodyFont, accentColor, headingColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#6366f1';
  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col justify-center px-[100px] py-[80px]">
        <div className="w-[80px] h-[6px] rounded-full mb-[40px]" style={{ backgroundColor: accent }} />
        <h1 className="font-bold leading-tight mb-[32px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 84 }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="opacity-70" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div
        className="w-[45%]"
        style={{
          background: `linear-gradient(135deg, ${accent}, ${accent}aa, ${accent}66)`,
        }}
      />
    </div>
  );
}

function TitleAsymmetric({ slide, headingFont, bodyFont, accentColor, headingColor, hSize, bSize }: VariationContext) {
  const accent = accentColor || '#6366f1';
  return (
    <div className="flex flex-col justify-center h-full px-[140px] py-[80px]">
      <div className="flex items-center gap-[40px] mb-[24px]">
        <div className="h-[12px] rounded-full" style={{ width: 200, backgroundColor: accent }} />
        <div className="uppercase tracking-widest font-semibold opacity-60" style={{ fontFamily: bodyFont, fontSize: 28 }}>
          {slide.subtitle ? '01 / Introduction' : 'Begin'}
        </div>
      </div>
      <h1
        className="font-bold leading-[0.95] mb-[40px]"
        style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 140, letterSpacing: '-0.03em', maxWidth: '90%' }}
      >
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className="opacity-75 max-w-[60%] leading-snug" style={{ fontFamily: bodyFont, fontSize: bSize || 38 }}>
          {slide.subtitle}
        </p>
      )}
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
    default: return null;
  }
}
