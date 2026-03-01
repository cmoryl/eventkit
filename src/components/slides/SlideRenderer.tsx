import React from 'react';
import { SlideData } from './slideTypes';
import { SlideLayout } from './SlideLayout';

interface SlideRendererProps {
  slide: SlideData;
  brandColors?: { primary?: string; secondary?: string; accent?: string };
  brandFonts?: { heading?: string; body?: string };
}

function ImageGallery({ images }: { images: string[] }) {
  if (images.length === 1) {
    return <img src={images[0]} alt="" className="w-full h-full object-contain" />;
  }
  return (
    <div className="grid grid-cols-2 gap-[16px] w-full h-full p-[16px]">
      {images.slice(0, 4).map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-contain rounded-[8px]" />
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

export function SlideRenderer({ slide, brandColors, brandFonts }: SlideRendererProps) {
  const headingFont = brandFonts?.heading || 'inherit';
  const bodyFont = brandFonts?.body || 'inherit';
  const accentColor = brandColors?.primary;
  const contentImages = slide.images?.filter(img => img !== slide.imageUrl) || [];
  const isDark = slide.variant !== 'default' && slide.variant !== 'minimal';
  const headingColor = isDark ? 'white' : (brandColors?.primary || '#1e293b');
  const hSize = slide.headingSize || 0;
  const bSize = slide.bodySize || 0;
  const align = slide.textAlign || 'left';

  return (
    <SlideLayout variant={slide.variant} accentColor={accentColor} bgColor={slide.bgColor}>
      {slide.layout === 'title' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h1
            className="font-bold leading-tight mb-[40px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 96, textAlign: 'center' }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="opacity-70" style={{ fontFamily: bodyFont, fontSize: bSize || 48 }}>
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
          <h2
            className="font-bold mb-[60px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[80px]">
            <div className="flex-1">
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
            <h2
              className="font-bold mb-[40px]"
              style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64 }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <div>
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
              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
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
          <h2
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
          <h2
            className="font-medium italic leading-snug mb-[60px]"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 64, marginTop: -100 }}
          >
            {slide.title}
          </h2>
          {slide.quoteAuthor && (
            <p className="opacity-60 tracking-wide uppercase" style={{ fontFamily: bodyFont, fontSize: bSize || 32 }}>
              — {slide.quoteAuthor}
            </p>
          )}
        </div>
      )}

      {slide.layout === 'stats' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2
            className="font-bold mb-[80px] text-center"
            style={{ fontFamily: headingFont, color: headingColor, fontSize: hSize || 72 }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex items-center justify-center">
            <div className="flex gap-[100px]">
              {(slide.stats || [{ value: '—', label: 'Metric' }]).map((stat, i) => (
                <div key={i} className="text-center">
                  <div
                    className="font-bold mb-[16px]"
                    style={{ fontSize: 96, color: accentColor || (isDark ? '#a78bfa' : '#6366f1'), fontFamily: headingFont }}
                  >
                    {stat.value}
                  </div>
                  <div className="opacity-60 uppercase tracking-widest" style={{ fontSize: bSize || 28, fontFamily: bodyFont }}>
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
                className="w-full h-full object-cover"
              />
              {slide.title && (
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-[120px] bg-gradient-to-t from-black/70 via-transparent to-transparent">
                  <h2 className="font-bold text-white text-center px-[120px]" style={{ fontFamily: headingFont, fontSize: hSize || 72 }}>
                    {slide.title}
                  </h2>
                  {slide.subtitle && (
                    <p className="text-white/70 mt-[20px]" style={{ fontFamily: bodyFont, fontSize: bSize || 36 }}>
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
          <h2
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

      {slide.layout === 'section' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h2
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

      {slide.layout === 'blank' && (
        <div className="flex items-center justify-center h-full">
          {slide.images && slide.images.length > 0 ? (
            <ImageGallery images={slide.images} />
          ) : (
            <p className="text-[32px] opacity-20">Blank slide</p>
          )}
        </div>
      )}
    </SlideLayout>
  );
}
