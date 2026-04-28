import React from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Type as TypeIcon, Square as ShapeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import type { ParallaxLayer, SlideData } from './slideTypes';

interface Props {
  slide: SlideData;
  onChange: (updates: Partial<SlideData>) => void;
}

const KIND_ICON = { image: ImageIcon, text: TypeIcon, shape: ShapeIcon } as const;

/**
 * Sidebar panel for editing a parallax slide.
 * - Camera intensity slider (global)
 * - Per-layer: kind, depth, content, position, scale + delete/reorder/add
 */
export function ParallaxLayerEditor({ slide, onChange }: Props) {
  const layers = slide.parallaxLayers || [];
  const intensity = slide.parallaxIntensity ?? 1;

  const setLayers = (next: ParallaxLayer[]) => onChange({ parallaxLayers: next });

  const updateLayer = (idx: number, patch: Partial<ParallaxLayer>) => {
    setLayers(layers.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const ni = idx + dir;
    if (ni < 0 || ni >= layers.length) return;
    const next = layers.slice();
    [next[idx], next[ni]] = [next[ni], next[idx]];
    setLayers(next);
  };

  const remove = (idx: number) => {
    if (layers.length <= 1) return;
    setLayers(layers.filter((_, i) => i !== idx));
  };

  const add = (kind: ParallaxLayer['kind']) => {
    const seed: ParallaxLayer = {
      id: `layer-${Date.now()}`,
      kind,
      depth: 0,
      content:
        kind === 'text' ? 'New layer' :
        kind === 'image' ? '' :
        'radial-gradient(circle, rgba(99,102,241,0.5), transparent 60%)',
      x: 50, y: 50, scale: 1,
      ...(kind === 'text' ? { fontSize: 64, fontWeight: 700, color: '#ffffff' } : {}),
    };
    setLayers([...layers, seed]);
  };

  return (
    <div className="space-y-4">
      {/* Global controls */}
      <div className="space-y-2 p-3 rounded-lg border border-border bg-muted/20">
        <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Camera Intensity
        </label>
        <div className="flex items-center gap-3">
          <Slider
            value={[intensity * 100]}
            min={0} max={200} step={10}
            onValueChange={([v]) => onChange({ parallaxIntensity: v / 100 })}
            className="flex-1"
          />
          <span className="text-xs font-mono tabular-nums w-10 text-right">{Math.round(intensity * 100)}%</span>
        </div>
      </div>

      {/* Layer list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Depth Layers ({layers.length})
          </label>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => add('text')} title="Add text">
              <TypeIcon className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => add('image')} title="Add image">
              <ImageIcon className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => add('shape')} title="Add shape">
              <ShapeIcon className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {layers.map((layer, idx) => {
          const Icon = KIND_ICON[layer.kind];
          const depthLabel = layer.depth < -33 ? 'Background' : layer.depth > 33 ? 'Foreground' : 'Mid plane';
          return (
            <div key={layer.id} className="p-3 rounded-lg border border-border bg-card/40 space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-xs font-medium flex-1 truncate">
                  {layer.kind === 'text' ? layer.content.slice(0, 24) : `${layer.kind} layer`}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{depthLabel}</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === 0} onClick={() => move(idx, -1)}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6" disabled={idx === layers.length - 1} onClick={() => move(idx, 1)}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" disabled={layers.length <= 1} onClick={() => remove(idx)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Depth slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] w-10 text-muted-foreground">Depth</span>
                <Slider
                  value={[layer.depth]}
                  min={-100} max={100} step={5}
                  onValueChange={([v]) => updateLayer(idx, { depth: v })}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono tabular-nums w-8 text-right">{layer.depth > 0 ? `+${layer.depth}` : layer.depth}</span>
              </div>

              {/* Content */}
              {layer.kind === 'text' && (
                <Textarea
                  value={layer.content}
                  onChange={(e) => updateLayer(idx, { content: e.target.value })}
                  rows={2}
                  className="text-xs"
                  placeholder="Layer text"
                />
              )}
              {layer.kind === 'image' && (
                <Input
                  value={layer.content}
                  onChange={(e) => updateLayer(idx, { content: e.target.value })}
                  placeholder="Image URL or paste data URI"
                  className="text-xs h-8"
                />
              )}
              {layer.kind === 'shape' && (
                <Input
                  value={layer.content}
                  onChange={(e) => updateLayer(idx, { content: e.target.value })}
                  placeholder="CSS background (gradient or color)"
                  className="text-xs h-8"
                />
              )}

              {/* Position grid */}
              <div className="grid grid-cols-3 gap-2">
                <NumberField label="X %" value={layer.x ?? 50} min={0} max={100} step={1} onChange={(v) => updateLayer(idx, { x: v })} />
                <NumberField label="Y %" value={layer.y ?? 50} min={0} max={100} step={1} onChange={(v) => updateLayer(idx, { y: v })} />
                <NumberField label="Scale" value={layer.scale ?? 1} min={0.1} max={3} step={0.1} onChange={(v) => updateLayer(idx, { scale: v })} />
              </div>

              {layer.kind === 'text' && (
                <div className="grid grid-cols-3 gap-2">
                  <NumberField label="Size" value={layer.fontSize ?? 64} min={12} max={400} step={2} onChange={(v) => updateLayer(idx, { fontSize: v })} />
                  <NumberField label="Weight" value={layer.fontWeight ?? 700} min={100} max={900} step={100} onChange={(v) => updateLayer(idx, { fontWeight: v })} />
                  <div>
                    <label className="text-[10px] text-muted-foreground block mb-1">Color</label>
                    <input
                      type="color"
                      value={layer.color || '#ffffff'}
                      onChange={(e) => updateLayer(idx, { color: e.target.value })}
                      className="h-7 w-full rounded border border-border bg-transparent cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground leading-snug">
        Negative depth pushes a layer further behind the camera; positive depth pulls it closer.
        Move your cursor across the slide to preview the parallax effect — it auto-drifts during presentation
        and dollies through the scene during MP4 export.
      </p>
    </div>
  );
}

function NumberField({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground block mb-1">{label}</label>
      <Input
        type="number"
        value={value}
        min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-7 text-xs"
      />
    </div>
  );
}
