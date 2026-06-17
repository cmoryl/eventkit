import React, { useMemo, useState } from 'react';
import { CURATED_GRAPHICS } from './graphicLibrary';
import { supabase } from '@/integrations/supabase/client';
import { safeSvgMarkup } from '@/utils/svgUtils';

interface Props {
  /** Bounds of the toolbar in wrapper-local coords — popover anchors below it */
  anchorX: number;
  anchorY: number;
  /** Current accent for AI palette context (hex). */
  accent?: string;
  bg?: string;
  secondary?: string;
  onApply: (
    payload: { svg?: string; imageUrl?: string },
    scope: 'this' | 'all',
  ) => void;
  onClose: () => void;
}

/**
 * Tabbed popover that lets the user replace one or all decorative graphics
 * on the active demo slide. Tab 1 = curated SVG library. Tab 2 = AI prompt
 * (Lovable AI / Nano Banana) returning a base64 PNG.
 */
export function GraphicSwapPopover({
  anchorX,
  anchorY,
  accent,
  bg,
  secondary,
  onApply,
  onClose,
}: Props) {
  const [tab, setTab] = useState<'library' | 'ai'>('library');
  const [scope, setScope] = useState<'this' | 'all'>('this');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

  // Pre-sanitize every curated SVG once. Anything that fails sanitization
  // is dropped from the picker so we never mount unsafe markup.
  const safeGraphics = useMemo(
    () =>
      CURATED_GRAPHICS
        .map((g) => ({ ...g, svg: safeSvgMarkup(g.svg) }))
        .filter((g) => g.svg.length > 0),
    [],
  );

  const generate = async () => {
    if (!aiPrompt.trim()) return;
    setAiBusy(true);
    setAiError(null);
    setAiResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-slide-graphic', {
        body: {
          prompt: aiPrompt.trim(),
          palette: { bg, accent, secondary },
          style: 'icon',
        },
      });
      if (error) {
        setAiError(error.message || 'Generation failed');
        return;
      }
      const url: string | undefined = (data as any)?.imageUrl;
      const errMsg: string | undefined = (data as any)?.error;
      if (errMsg) {
        setAiError(errMsg);
        return;
      }
      if (!url) {
        setAiError('No image returned. Try a more specific prompt.');
        return;
      }
      setAiResult(url);
    } catch (e: any) {
      setAiError(e?.message || 'Unexpected error');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div
      className="absolute z-[60] w-[360px] rounded-xl border border-border bg-popover/95 backdrop-blur shadow-2xl text-popover-foreground"
      style={{ left: anchorX, top: anchorY + 4, transform: 'translateX(-50%)' }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex gap-1">
          <button
            type="button"
            className={`text-xs px-2 py-1 rounded ${tab === 'library' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setTab('library')}
          >
            Library
          </button>
          <button
            type="button"
            className={`text-xs px-2 py-1 rounded ${tab === 'ai' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setTab('ai')}
          >
            ✦ AI Generate
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Apply to:
          </label>
          <select
            className="text-[11px] bg-transparent border border-border rounded px-1 py-0.5 outline-none"
            value={scope}
            onChange={(e) => setScope(e.target.value as 'this' | 'all')}
          >
            <option value="this">This graphic</option>
            <option value="all">All on slide</option>
          </select>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground text-sm"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body */}
      {tab === 'library' && (
        <div className="p-2 max-h-[280px] overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {safeGraphics.map((g) => (
              <button
                key={g.id}
                type="button"
                className="group flex flex-col items-center gap-1 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition p-2"
                title={g.description}
                onClick={() => onApply({ svg: g.svg }, scope)}
              >
                <div
                  className="w-full aspect-square rounded bg-background/40 flex items-center justify-center overflow-hidden"
                  style={{ color: accent || 'hsl(var(--primary))' }}
                  // g.svg has been sanitized via safeSvgMarkup above.
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: g.svg }}
                />
                <span className="text-[10px] text-muted-foreground group-hover:text-foreground truncate w-full text-center">
                  {g.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground px-1 pt-2">
            All graphics inherit the slide's accent color automatically.
          </p>
        </div>
      )}

      {tab === 'ai' && (
        <div className="p-3 space-y-2">
          <label className="block text-[11px] font-medium text-muted-foreground">
            Describe the graphic
          </label>
          <textarea
            className="w-full text-xs rounded border border-border bg-background/60 px-2 py-1.5 outline-none focus:border-primary resize-none"
            rows={3}
            placeholder="e.g. an isometric data cube with glowing edges"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            disabled={aiBusy}
          />
          <button
            type="button"
            className="w-full text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
            disabled={!aiPrompt.trim() || aiBusy}
            onClick={generate}
          >
            {aiBusy ? 'Generating…' : 'Generate'}
          </button>
          {aiError && (
            <div className="text-[11px] rounded border border-destructive/40 bg-destructive/10 text-destructive px-2 py-1.5">
              {aiError}
            </div>
          )}
          {aiResult && (
            <div className="space-y-1.5">
              <img
                src={aiResult}
                alt="AI graphic preview"
                className="w-full aspect-square rounded border border-border object-contain bg-background/40"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 text-xs px-2 py-1.5 rounded border border-border hover:bg-muted"
                  onClick={() => setAiResult(null)}
                >
                  Try again
                </button>
                <button
                  type="button"
                  className="flex-1 text-xs px-2 py-1.5 rounded bg-primary text-primary-foreground hover:opacity-90"
                  onClick={() => onApply({ imageUrl: aiResult }, scope)}
                >
                  Use this
                </button>
              </div>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground">
            Powered by Lovable AI · auto-styled to your slide's palette · text/logos blocked.
          </p>
        </div>
      )}
    </div>
  );
}
