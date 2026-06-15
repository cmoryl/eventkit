import React from 'react';
import { SlideData } from './slideTypes';
import { SlideLayout } from './SlideLayout';
import { renderLayoutVariation } from './SlideLayoutVariations';
import { ParallaxRenderer } from './ParallaxRenderer';
import { BrandHubGrowthChart, BrandHubKpiTiles } from './BrandHubVisualizations';
import { SlideMock } from '@/components/powerpoint/composer/TemplatePreviewDialog';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface SlideRendererProps {
  slide: SlideData;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
  animated?: boolean;
  /** How parallax slides should animate. Defaults to 'mouse' (editor). */
  parallaxMotion?: 'mouse' | 'time' | 'dolly' | 'static';
  /** 0-1 progress for dolly mode (used by MP4 export). */
  parallaxProgress?: number;
  /** When true, demo-mock slides become inline-editable (contentEditable). */
  editable?: boolean;
  /** Called when a demo-mock slide's content is edited inline. */
  onDemoContentChange?: (next: any) => void;
}

function ImageGallery({ images }: { images: string[] }) {
  if (images.length === 1) {
    return <img src={images[0]} alt="" data-slide-image="images.0" className="w-full h-full object-contain" />;
  }
  return (
    <div className="grid grid-cols-2 gap-[16px] w-full h-full p-[16px]">
      {images.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt="" data-slide-image={`images.${i}`} className="w-full h-full object-contain rounded-[8px]" />
      ))}
    </div>
  );
}

function SlideImages({ images, variant }: { images: string[]; variant: SlideData['variant'] }) {
  if (images.length === 0) return null;
  return (
    <div className="mt-[40px] flex justify-center gap-[32px] max-h-[500px]">
      {images.slice(0, 3).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          data-slide-image={`images.${i}`}
          className="max-h-[500px] object-contain rounded-[12px]"
          style={{
            boxShadow: variant === 'default' || variant === 'minimal'
              ? '0 8px 30px rgba(0,0,0,0.12)'
              : '0 8px 30px rgba(0,0,0,0.4)',
          }}
        />
      ))}
    </div>
  );
}

function chartHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return hash;
}

export function SlideRenderer({ slide, brandColors, brandFonts, animated, parallaxMotion = 'mouse', parallaxProgress, editable, onDemoContentChange }: SlideRendererProps) {
  const headingFont = brandFonts?.heading || 'inherit';
  const bodyFont = brandFonts?.body || 'inherit';
  const accentColor = brandColors?.primary;
  const contentImages = slide.images?.filter(img => img !== slide.imageUrl) || [];
  const isDark = slide.variant !== 'default' && slide.variant !== 'minimal';
  const headingColor = isDark ? 'white' : (brandColors?.primary || '#1e293b');
  const hSize = slide.headingSize || 0;
  const bSize = slide.bodySize || 0;
  const align = slide.textAlign || 'left';

  // Parallax slides own their own background + composition — bypass SlideLayout.
  if (slide.layout === 'parallax') {
    return <ParallaxRenderer slide={slide} motion={parallaxMotion} progress={parallaxProgress} />;
  }

  // Demo-mock slides render the exact template preview component (pixel-identical to gallery preview).
  if (slide.layout === 'demo-mock' && slide.demoContent && slide.demoTemplate && slide.demoKind) {
    const setContentShim = (updater: any) => {
      const next = typeof updater === 'function' ? updater(slide.demoContent) : updater;
      if (next && onDemoContentChange) onDemoContentChange(next);
    };
    const bgImage = (slide as any).bgImage as string | undefined;
    const bgTint = (slide as any).bgTint as string | undefined;
    const bgTintOpacity = ((slide as any).bgTintOpacity ?? 0) as number;
    return (
      <div className="absolute inset-0 demo-mock-fill">
        {bgImage && (
          <>
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("${bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: (slide as any).bgImageOpacity ?? 0.35,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))' }}
            />
          </>
        )}
        {bgTint && bgTintOpacity > 0 && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundColor: bgTint, opacity: bgTintOpacity, mixBlendMode: 'multiply' }}
          />
        )}
        <SlideMock
          template={slide.demoTemplate}
          content={slide.demoContent}
          setContent={setContentShim}
          editing={!!editable}
          kind={slide.demoKind as any}
          index={0}
          total={1}
        />
      </div>
    );
  }

  const variationNode = renderLayoutVariation({
    slide, headingFont, bodyFont, accentColor, headingColor, isDark, hSize, bSize, align,
  });

  return (
    <SlideLayout variant={slide.variant} accentColor={accentColor} bgColor={slide.bgColor} animated={animated} bgEffect={animated ? slide.bgEffect : undefined}>
      {variationNode || <>
      {slide.layout === 'title' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h1 data-slide-field="title"
            className="font-bold leading-tight mb-[40px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 96, textAlign: 'center' }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p data-slide-field="subtitle" className="opacity-70" style={{ fontFamily: bodyFont, fontSize: bSize || 48 }}>
              {slide.subtitle}
            </p>
          )}
          {slide.images && slide.images.length > 0 && (
            <SlideImages images={slide.images} variant={slide.variant} />
          )}
        </div>
      )}

      {slide.layout === 'content' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]" style={{ textAlign: align }}>
          <h2 data-slide-field="title"
            className="font-bold mb-[60px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[80px]">
            <div className="flex-1" data-slide-field="body" data-slide-multiline="true">
              {slide.body && slide.body.split('\n').map((line, i) => (
                <p key={i} className="leading-relaxed mb-[20px]" style={{ fontFamily: bodyFont, fontSize: bSize || 40 }}>
                  {line}
                </p>
              ))}
            </div>
            {slide.images && slide.images.length > 0 && (
              <div className="w-[40%] flex items-center">
                <ImageGallery images={slide.images} />
              </div>
            )}
          </div>
        </div>
      )}

      {(slide.layout === 'image-left' || slide.layout === 'image-right') && (
        <div className={`flex h-full ${slide.layout === 'image-right' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex-1 flex flex-col justify-center px-[100px] py-[80px]" style={{ textAlign: align }}>
            <h2 data-slide-field="title"
              className="font-bold mb-[40px]"
              style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <div data-slide-field="body" data-slide-multiline="true">
                {slide.body.split('\n').map((line, i) => (
                  <p key={i} className="leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="w-[45%] bg-black/5 flex items-center justify-center overflow-hidden">
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt="" data-slide-image="hero" className="w-full h-full object-cover" />
            ) : slide.images && slide.images.length > 0 ? (
              <ImageGallery images={slide.images} />
            ) : (
              <div className="text-[32px] opacity-30">Drop image here</div>
            )}
          </div>
        </div>
      )}

      {slide.layout === 'two-column' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]" style={{ textAlign: align }}>
          <h2 data-slide-field="title"
            className="font-bold mb-[60px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[80px]">
            {(() => {
              const parts = (slide.body || '').split('---');
              const left = parts[0]?.trim().split('\n') || [];
              const right = parts[1]?.trim().split('\n') || (slide.images && slide.images.length > 0 ? null : left.splice(Math.ceil(left.length / 2)));
              return (
                <>
                  <div className="flex-1">
                    {left.map((line, i) => (
                      <p key={i} className="leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>{line}</p>
                    ))}
                  </div>
                  <div className="flex-1">
                    {right ? right.map((line, i) => (
                      <p key={i} className="leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>{line}</p>
                    )) : slide.images && (
                      <ImageGallery images={slide.images} />
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {slide.layout === 'quote' && (
        <div className="flex flex-col items-center justify-center h-full px-[240px] text-center">
          <div className="mb-[40px] opacity-20" style={{ fontSize: 160, lineHeight: '1', fontFamily: 'Georgia, serif' }}>"</div>
          <h2 data-slide-field="title"
            className="font-medium italic leading-snug mb-[60px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, marginTop: -100 }}
          >
            {slide.title}
          </h2>
          {slide.quoteAuthor && (
            <p data-slide-field="quoteAuthor" className="opacity-60 tracking-wide uppercase" style={{ fontFamily: bodyFont, fontSize: bSize || 32 }}>
              — {slide.quoteAuthor}
            </p>
          )}
        </div>
      )}

      {slide.layout === 'stats' && slide.variation === 'brandhub-tiles' && (
        <BrandHubKpiTiles
          slide={slide}
          accentColor={accentColor}
          brandColors={brandColors}
          headingFont={headingFont}
          bodyFont={bodyFont}
          headingColor={headingColor}
          hSize={hSize}
          bSize={bSize}
          isDark={isDark}
        />
      )}

      {slide.layout === 'stats' && slide.variation !== 'brandhub-tiles' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2 data-slide-field="title"
            className="font-bold mb-[80px] text-center"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex items-center justify-center">
            {!(slide.stats?.length) && (
              <p className="opacity-30 text-[32px]">No stats yet — add some in the editor</p>
            )}
            <div className="flex gap-[100px]">
              {(slide.stats || []).map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    data-slide-field={`stats.${i}.value`}
                    className="font-bold mb-[16px]"
                    style={{ fontSize: 96, color: accentColor || (isDark ? '#a78bfa' : '#6366f1'), fontFamily: headingFont }}
                  >
                    {stat.value}
                  </div>
                  <div data-slide-field={`stats.${i}.label`} className="opacity-60 uppercase tracking-widest" style={{ fontSize: bSize || 28, fontFamily: bodyFont }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {slide.layout === 'full-image' && (
        <div className="relative w-full h-full">
          {slide.imageUrl || (slide.images && slide.images.length > 0) ? (
            <>
              <img
                src={slide.imageUrl || slide.images![0]}
                alt=""
                data-slide-image={slide.imageUrl ? 'hero' : 'images.0'}
                className="w-full h-full object-cover"
              />
              {slide.title && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[120px] bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <h2 data-slide-field="title" className="font-bold text-white text-center px-[120px]" style={{ fontFamily: headingFont, fontSize: hSize || 72 }}>
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p data-slide-field="subtitle" className="text-white/70 mt-[20px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-black/5">
              <p className="text-[32px] opacity-30">Add an image</p>
            </div>
          )}
        </div>
      )}

      {slide.layout === 'comparison' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2 data-slide-field="title"
            className="font-bold mb-[60px] text-center"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[40px]">
            {(() => {
              const parts = (slide.body || 'Left side\n---\nRight side').split('---');
              const leftLines = parts[0]?.trim().split('\n') || [];
              const rightLines = parts[1]?.trim().split('\n') || [];
              return (
                <>
                  <div className="flex-1 rounded-[24px] p-[60px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                    {leftLines.map((line, i) => (
                      <p key={i} className="leading-relaxed mb-[20px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>{line}</p>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <div className="w-[4px] h-[60%] rounded-full" style={{ backgroundColor: accentColor || '#6366f1' }} />
                  </div>
                  <div className="flex-1 rounded-[24px] p-[60px]" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
                    {rightLines.map((line, i) => (
                      <p key={i} className="leading-relaxed mb-[20px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>{line}</p>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {slide.layout === 'timeline' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2 data-slide-field="title"
            className="font-bold mb-[80px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 relative">
            {/* Horizontal timeline rail */}
            <div className="absolute top-[60px] left-0 right-0 h-[6px] rounded-full" style={{ backgroundColor: accentColor || '#6366f1', opacity: 0.25 }} />
            <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${Math.max(1, (slide.timeline?.length || 1))}, minmax(0, 1fr))`, gap: 32 }}>
              {(slide.timeline || []).slice(0, 6).map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center px-[16px]">
                  <div
                    className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
                    style={{ width: 120, height: 120, backgroundColor: accentColor || '#6366f1', fontFamily: headingFont, fontSize: 48 }}
                  >
                    {i + 1}
                  </div>
                  {step.date && (
                    <div data-slide-field={`timeline.${i}.date`} className="mt-[24px] uppercase tracking-widest opacity-60" style={{ fontFamily: bodyFont, fontSize: 24 }}>
                      {step.date}
                    </div>
                  )}
                  <div data-slide-field={`timeline.${i}.title`} className="mt-[12px] font-semibold" style={{ fontFamily: headingFont, color: headingColor, fontSize: 36 }}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div data-slide-field={`timeline.${i}.description`} data-slide-multiline="true" className="mt-[16px] opacity-70 leading-snug" style={{ fontFamily: bodyFont, fontSize: 26 }}>
                      {step.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {slide.layout === 'process' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2 data-slide-field="title"
            className="font-bold mb-[80px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex items-center justify-center gap-[24px] flex-wrap">
            {(slide.process || []).slice(0, 5).map((step, i, arr) => (
              <React.Fragment key={i}>
                <div
                  className="flex flex-col items-center justify-center text-center rounded-[24px] p-[32px]"
                  style={{
                    width: 280, height: 280,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    border: `3px solid ${accentColor || '#6366f1'}`,
                  }}
                >
                  <div className="font-bold mb-[12px]" style={{ fontSize: 56, color: accentColor || '#6366f1', fontFamily: headingFont }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div data-slide-field={`process.${i}.title`} className="font-semibold mb-[8px]" style={{ fontFamily: headingFont, color: headingColor, fontSize: 30 }}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div data-slide-field={`process.${i}.description`} data-slide-multiline="true" className="opacity-70 leading-snug" style={{ fontFamily: bodyFont, fontSize: 22 }}>
                      {step.description}
                    </div>
                  )}
                </div>
                {i < arr.length - 1 && (
                  <div className="font-bold opacity-50" style={{ fontSize: 64, color: accentColor || '#6366f1' }}>→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {slide.layout === 'chart' && slide.variation === 'growth-bars' && slide.chart?.data?.length && (
        <BrandHubGrowthChart
          slide={slide}
          accentColor={accentColor}
          brandColors={brandColors}
          headingFont={headingFont}
          bodyFont={bodyFont}
          headingColor={headingColor}
          hSize={hSize}
          isDark={isDark}
          align={align}
        />
      )}

      {slide.layout === 'chart' && slide.variation !== 'growth-bars' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2 data-slide-field="title"
            className="font-bold mb-[40px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, textAlign: align }}
          >
            {slide.title}
          </h2>
          {slide.chart?.title && (
            <p className="mb-[40px] opacity-70" style={{ fontFamily: bodyFont, fontSize: 32, textAlign: align }}>
              {slide.chart.title}
            </p>
          )}
          <div className="flex-1 min-h-0">
            {(() => {
              const c = slide.chart;
              if (!c || !c.data?.length) {
                return <div className="h-full flex items-center justify-center opacity-30 text-[32px]">No chart data</div>;
              }
              const palette = [
                accentColor || '#6366f1',
                brandColors?.secondary || '#a855f7',
                brandColors?.accent || '#ec4899',
                '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
              ];
              const tickColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
              const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
              const chartSeed = chartHash(`${slide.id}:${slide.title}:${c.type}:${c.title || ''}`);
              const chartMode = chartSeed % 4;
              const axisStyle = { fontSize: chartMode === 2 ? 20 : 22, fill: tickColor, fontFamily: bodyFont };
              const gridDash = chartMode === 0 ? '3 6' : chartMode === 1 ? '1 8' : chartMode === 2 ? '8 4' : undefined;

              if (c.type === 'pie' || c.type === 'doughnut') {
                const innerRadius = c.type === 'doughnut' ? `${38 + (chartSeed % 14)}%` : chartMode === 3 ? '24%' : 0;
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={c.data}
                        dataKey="value"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        outerRadius={`${74 + (chartSeed % 12)}%`}
                        innerRadius={innerRadius}
                        startAngle={chartMode % 2 ? 90 : 220}
                        endAngle={chartMode % 2 ? -270 : -140}
                        paddingAngle={chartMode === 1 ? 3 : chartMode === 2 ? 1 : 0}
                        cornerRadius={chartMode === 1 ? 10 : chartMode === 3 ? 3 : 0}
                        label={{ fontSize: 22, fill: tickColor, fontFamily: bodyFont }}
                      >
                        {c.data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 22, fontFamily: bodyFont }} layout={chartMode === 2 ? 'vertical' : 'horizontal'} align={chartMode === 2 ? 'right' : 'center'} />
                    </PieChart>
                  </ResponsiveContainer>
                );
              }

              const merged = c.data.map((d, i) => ({
                label: d.label,
                [c.series1Name || 'Value']: d.value,
                ...(c.series2 && c.series2[i] ? { [c.series2Name || 'Series 2']: c.series2[i].value } : {}),
              }));

              if (c.type === 'line') {
                const lineType: 'stepAfter' | 'linear' | 'monotone' = chartMode === 1 ? 'stepAfter' : chartMode === 2 ? 'linear' : 'monotone';
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={merged}>
                      <CartesianGrid stroke={gridColor} strokeDasharray={gridDash} vertical={chartMode !== 1} />
                      <XAxis dataKey="label" tick={axisStyle} axisLine={chartMode !== 1} />
                      <YAxis tick={axisStyle} axisLine={chartMode !== 1} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 22, fontFamily: bodyFont }} />
                      <Line type={lineType} dataKey={c.series1Name || 'Value'} stroke={palette[0]} strokeWidth={chartMode === 2 ? 6 : 4} strokeDasharray={chartMode === 3 ? '10 6' : undefined} dot={{ r: chartMode === 1 ? 0 : 6, strokeWidth: 3, fill: isDark ? '#0B0F19' : '#FFFFFF' }} />
                      {c.series2 && <Line type={lineType} dataKey={c.series2Name || 'Series 2'} stroke={palette[1]} strokeWidth={4} strokeDasharray={chartMode === 2 ? '4 7' : undefined} dot={{ r: chartMode === 1 ? 0 : 6, strokeWidth: 3, fill: isDark ? '#0B0F19' : '#FFFFFF' }} />}
                    </LineChart>
                  </ResponsiveContainer>
                );
              }

              // bar (default)
              if (chartMode === 1 || chartMode === 3) {
                return (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={merged} layout="vertical" margin={{ top: 12, right: 36, left: 42, bottom: 12 }}>
                      <CartesianGrid stroke={gridColor} strokeDasharray={gridDash} horizontal={false} />
                      <XAxis type="number" tick={axisStyle} axisLine={false} />
                      <YAxis type="category" dataKey="label" tick={axisStyle} width={92} axisLine={false} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 22, fontFamily: bodyFont }} />
                      <Bar dataKey={c.series1Name || 'Value'} fill={palette[0]} radius={[0, 12, 12, 0]} barSize={chartMode === 3 ? 34 : 26} />
                      {c.series2 && <Bar dataKey={c.series2Name || 'Series 2'} fill={palette[1]} radius={[0, 12, 12, 0]} barSize={chartMode === 3 ? 34 : 26} />}
                    </BarChart>
                  </ResponsiveContainer>
                );
              }

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={merged} barCategoryGap={chartMode === 2 ? "22%" : "12%"}>
                    <CartesianGrid stroke={gridColor} strokeDasharray={gridDash} vertical={chartMode === 2} />
                    <XAxis dataKey="label" tick={axisStyle} axisLine={chartMode !== 2} />
                    <YAxis tick={axisStyle} axisLine={chartMode !== 2} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 22, fontFamily: bodyFont }} />
                    <Bar dataKey={c.series1Name || 'Value'} fill={palette[0]} radius={chartMode === 2 ? [0, 0, 0, 0] : [12, 12, 0, 0]} barSize={chartMode === 2 ? 42 : undefined} />
                    {c.series2 && <Bar dataKey={c.series2Name || 'Series 2'} fill={palette[1]} radius={chartMode === 2 ? [0, 0, 0, 0] : [12, 12, 0, 0]} barSize={chartMode === 2 ? 42 : undefined} />}
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      )}

      {slide.layout === 'section' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h2 data-slide-field="title"
            className="font-bold mb-[30px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 88 }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="opacity-60" style={{ fontFamily: bodyFont, fontSize: bSize || 44 }}>{slide.subtitle}</p>
          )}
          {slide.images && slide.images.length > 0 && (
            <SlideImages images={slide.images} variant={slide.variant} />
          )}
        </div>
      )}

      {slide.layout === 'agenda' && (
        <div className="flex h-full px-[120px] py-[100px] gap-[120px]">
          <div className="flex flex-col justify-center" style={{ minWidth: 320 }}>
            <h2 data-slide-field="title"
              className="font-bold leading-tight"
              style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 80 }}
            >
              {slide.title}
            </h2>
            <div className="mt-[40px] w-[80px] h-[8px] rounded-full" style={{ backgroundColor: accentColor || '#6366f1' }} />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-[24px]">
            {(() => {
              const allLines = (slide.body || '').split('\n');
              return allLines
                .map((item, originalIdx) => ({ item, originalIdx }))
                .filter(({ item }) => Boolean(item))
                .map(({ item, originalIdx }, i) => (
                  <div key={originalIdx} className="flex items-center gap-[32px]">
                    <div
                      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ width: 64, height: 64, backgroundColor: accentColor || '#6366f1', fontFamily: headingFont, fontSize: 28 }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <span data-slide-field={`agenda.${originalIdx}`} className="font-medium" style={{ fontFamily: bodyFont, fontSize: bSize || 40, color: headingColor }}>
                      {item}
                    </span>
                  </div>
                ));
            })()}
            {!(slide.body?.trim()) && (
              <p className="opacity-30 text-[32px]">Add agenda items in the editor</p>
            )}
          </div>
        </div>
      )}

      {slide.layout === 'big-number' && (
        <div className="flex flex-col items-center justify-center h-full px-[160px] text-center gap-[32px]">
          {slide.title && (
            <h2 data-slide-field="title"
              className="font-semibold opacity-70 uppercase tracking-widest"
              style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize ? hSize * 0.45 : 36 }}
            >
              {slide.title}
            </h2>
          )}
          {slide.stats?.[0] ? (
            <>
              <div
                data-slide-field="stats.0.value"
                className="font-bold leading-none"
                style={{ fontSize: 200, color: accentColor || (isDark ? '#a78bfa' : '#6366f1'), fontFamily: headingFont }}
              >
                {slide.stats[0].value}
              </div>
              <div
                data-slide-field="stats.0.label"
                className="font-medium opacity-80"
                style={{ fontFamily: bodyFont, fontSize: bSize || 40, color: headingColor }}
              >
                {slide.stats[0].label}
              </div>
            </>
          ) : (
            <p className="opacity-30 text-[40px]">Add a stat in the editor</p>
          )}
          {slide.subtitle && (
            <p data-slide-field="subtitle" className="opacity-50 mt-[8px]" style={{ fontFamily: bodyFont, fontSize: bSize ? bSize * 0.7 : 28 }}>
              {slide.subtitle}
            </p>
          )}
        </div>
      )}

      {slide.layout === 'blank' && (
        <div className="flex items-center justify-center h-full">
          {slide.images && slide.images.length > 0 ? (
            <ImageGallery images={slide.images} />
          ) : (
            <p className="text-[32px] opacity-20">Blank slide</p>
          )}
        </div>
      )}
      </>}
    </SlideLayout>
  );
}
