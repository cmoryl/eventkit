import React from 'react';
import type { SlideData } from './slideTypes';

interface Props {
  chrome: NonNullable<SlideData['masterChrome']>;
}

/**
 * Paints the look-and-feel chrome (background fill, decorative shapes, master
 * imagery) parsed from an imported PPTX master/layout beneath a slide's
 * generated content. Renders inside the absolutely-positioned slide canvas
 * (1920x1080) so all percentage coordinates map directly to slide space.
 */
export function MasterChromeLayer({ chrome }: Props) {
  const shapes = chrome.shapes ?? [];
  const assets = chrome.assets ?? [];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {chrome.bgFill && (
        <div className="absolute inset-0" style={{ background: chrome.bgFill }} />
      )}
      {shapes.map((sh, i) => {
        const borderRadius =
          sh.geom === 'ellipse' || sh.geom === 'oval' ? '9999px'
          : sh.geom === 'roundRect' ? '12px'
          : '0';
        const isLine = sh.geom === 'line' || (sh.hPct < 0.5 && !sh.fill);
        return (
          <div
            key={`shape-${i}`}
            className="absolute"
            style={{
              left: `${sh.xPct}%`,
              top: `${sh.yPct}%`,
              width: `${sh.wPct}%`,
              height: `${sh.hPct}%`,
              background: sh.fill && !isLine ? sh.fill : 'transparent',
              border: sh.line ? `1px solid ${sh.line}` : undefined,
              borderRadius,
            }}
          />
        );
      })}
      {assets.map((a, i) => (
        <img
          key={`asset-${i}`}
          src={a.dataUrl}
          alt=""
          className="absolute object-contain"
          style={{
            left: `${a.xPct}%`,
            top: `${a.yPct}%`,
            width: `${a.wPct}%`,
            height: `${a.hPct}%`,
          }}
        />
      ))}
    </div>
  );
}
