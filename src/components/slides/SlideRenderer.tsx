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
            boxShadow: variant === 'default'
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

  return (
    <SlideLayout variant={slide.variant} accentColor={accentColor}>
      {slide.layout === 'title' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h1
            className="text-[96px] font-bold leading-tight mb-[40px]"
            style={{ fontFamily: headingFont, color: slide.variant !== 'default' ? 'white' : (brandColors?.primary || '#1e293b') }}
          >
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-[48px] opacity-70" style={{ fontFamily: bodyFont }}>
              {slide.subtitle}
            </p>
          )}
          {slide.images && slide.images.length > 0 && (
            <SlideImages images={slide.images} variant={slide.variant} />
          )}
        </div>
      )}

      {slide.layout === 'content' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2
            className="text-[72px] font-bold mb-[60px]"
            style={{ fontFamily: headingFont, color: slide.variant !== 'default' ? 'white' : (brandColors?.primary || '#1e293b') }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[80px]">
            <div className="flex-1">
              {slide.body && slide.body.split('\n').map((line, i) => (
                <p key={i} className="text-[40px] leading-relaxed mb-[20px]" style={{ fontFamily: bodyFont }}>
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
          <div className="flex-1 flex flex-col justify-center px-[100px] py-[80px]">
            <h2
              className="text-[64px] font-bold mb-[40px]"
              style={{ fontFamily: headingFont, color: slide.variant !== 'default' ? 'white' : (brandColors?.primary || '#1e293b') }}
            >
              {slide.title}
            </h2>
            {slide.body && (
              <div>
                {slide.body.split('\n').map((line, i) => (
                  <p key={i} className="text-[36px] leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont }}>
                    {line}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="w-[45%] bg-muted/30 flex items-center justify-center overflow-hidden">
            {slide.imageUrl ? (
              <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : slide.images && slide.images.length > 0 ? (
              <ImageGallery images={slide.images} />
            ) : (
              <div className="text-[32px] text-muted-foreground/50">Drop image here</div>
            )}
          </div>
        </div>
      )}

      {slide.layout === 'two-column' && (
        <div className="flex flex-col h-full px-[120px] py-[100px]">
          <h2
            className="text-[64px] font-bold mb-[60px]"
            style={{ fontFamily: headingFont, color: slide.variant !== 'default' ? 'white' : (brandColors?.primary || '#1e293b') }}
          >
            {slide.title}
          </h2>
          <div className="flex-1 flex gap-[80px]">
            <div className="flex-1">
              {slide.body && slide.body.split('\n').slice(0, Math.ceil(slide.body.split('\n').length / 2)).map((line, i) => (
                <p key={i} className="text-[36px] leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont }}>{line}</p>
              ))}
            </div>
            <div className="flex-1">
              {slide.images && slide.images.length > 0 ? (
                <ImageGallery images={slide.images} />
              ) : (
                slide.body && slide.body.split('\n').slice(Math.ceil(slide.body.split('\n').length / 2)).map((line, i) => (
                  <p key={i} className="text-[36px] leading-relaxed mb-[16px]" style={{ fontFamily: bodyFont }}>{line}</p>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {slide.layout === 'section' && (
        <div className="flex flex-col items-center justify-center h-full px-[200px] text-center">
          <h2
            className="text-[88px] font-bold mb-[30px]"
            style={{ fontFamily: headingFont, color: slide.variant !== 'default' ? 'white' : (brandColors?.primary || '#1e293b') }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-[44px] opacity-60" style={{ fontFamily: bodyFont }}>{slide.subtitle}</p>
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
            <p className="text-[32px] text-muted-foreground/30">Blank slide</p>
          )}
        </div>
      )}
    </SlideLayout>
  );
}
