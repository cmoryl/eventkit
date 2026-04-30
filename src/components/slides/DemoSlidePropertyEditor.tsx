/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ImagePlus, Palette, Plus, Replace, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import type { SlideData } from './slideTypes';

type Props = {
  slide: SlideData;
  onContentChange: (nextOrUpdater: any) => void;
  onTemplateChange: (nextOrUpdater: any) => void;
  onSlideChange?: (patch: Partial<SlideData>) => void;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-2.5">
    <div className="text-xs font-semibold text-foreground">{title}</div>
    {children}
  </div>
);

const MiniInput = (props: React.ComponentProps<typeof Input>) => <Input {...props} className="h-7 text-xs" />;
const MiniText = (props: React.ComponentProps<typeof Textarea>) => <Textarea {...props} className="min-h-[68px] text-xs" />;

export function DemoSlidePropertyEditor({ slide, onContentChange, onTemplateChange, onSlideChange }: Props) {
  const content = slide.demoContent as any;
  const template = slide.demoTemplate as any;
  const kind = slide.demoKind;

  const update = (fn: (current: any) => any) => onContentChange((current: any) => fn(current));
  const updateTemplate = (fn: (current: any) => any) => onTemplateChange((current: any) => fn(current));
  const updateArrayItem = (key: string, index: number, patch: Record<string, any>) => {
    update((c) => ({
      ...c,
      [key]: (c[key] || []).map((item: any, i: number) => (i === index ? { ...item, ...patch } : item)),
    }));
  };
  const slideHeadingLabel = kind ? kind.replace(/-/g, ' ') : 'slide';
  const removeArrayItem = (key: string, index: number) => {
    update((c) => ({ ...c, [key]: (c[key] || []).filter((_: any, i: number) => i !== index) }));
  };
  const addArrayItem = (key: string, item: any) => {
    update((c) => ({ ...c, [key]: [...(c[key] || []), item] }));
  };
  const readImage = (file: File, cb: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (!content || !template) return null;

  const renderSharedText = () => (
    <Section title="Deck text">
      <Field label={`${slideHeadingLabel} heading`}>
        <MiniInput
          value={content.slideHeadings?.[kind || ''] || ''}
          placeholder="Slide-specific heading"
          onChange={(e) => update((c) => ({
            ...c,
            slideHeadings: { ...(c.slideHeadings || {}), [kind || 'slide']: e.target.value },
          }))}
        />
      </Field>
      <Field label="Eyebrow">
        <MiniInput value={content.eyebrow || ''} onChange={(e) => update((c) => ({ ...c, eyebrow: e.target.value }))} />
      </Field>
      <Field label="Title">
        <MiniText value={content.title || ''} onChange={(e) => update((c) => ({ ...c, title: e.target.value }))} />
      </Field>
      <Field label="Subtitle">
        <MiniText value={content.subtitle || ''} onChange={(e) => update((c) => ({ ...c, subtitle: e.target.value }))} />
      </Field>
    </Section>
  );

  const renderPalette = () => (
    <Section title="Template palette">
      <div className="grid grid-cols-2 gap-2">
        {(['bg', 'text', 'accent', 'secondary'] as const).map((key) => (
          <Field key={key} label={key}>
            <div className="flex gap-1.5">
              <input
                type="color"
                value={template.palette?.[key] || '#000000'}
                onChange={(e) => updateTemplate((t) => ({ ...t, palette: { ...t.palette, [key]: e.target.value } }))}
                className="h-7 w-8 rounded border border-border bg-background"
              />
              <MiniInput
                value={template.palette?.[key] || ''}
                onChange={(e) => updateTemplate((t) => ({ ...t, palette: { ...t.palette, [key]: e.target.value } }))}
              />
            </div>
          </Field>
        ))}
      </div>
    </Section>
  );

  const renderImagery = () => (
    <Section title="Slide assets">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">Images used by title, gallery, cards, quote, and feature slides.</span>
        <label className="shrink-0 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              e.target.value = '';
              readImage(file, (dataUrl) => update((c) => ({ ...c, imagery: [...(c.imagery || []), dataUrl] })));
            }}
          />
          <Button size="sm" variant="outline" className="h-7 px-2 text-xs gap-1" asChild>
            <span><ImagePlus className="h-3 w-3" /> Add</span>
          </Button>
        </label>
      </div>
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {(content.imagery || []).map((src: string, index: number) => (
          <div key={`${src}-${index}`} className="rounded-md border border-border bg-background/60 overflow-hidden">
            <img src={src} alt={`Demo asset ${index + 1}`} className="h-20 w-full object-cover" />
            <div className="flex items-center justify-between gap-1 p-1.5">
              <span className="text-[10px] text-muted-foreground">Image {index + 1}</span>
              <div className="flex gap-1">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      e.target.value = '';
                      readImage(file, (dataUrl) => update((c) => {
                        const imagery = [...(c.imagery || [])];
                        imagery[index] = dataUrl;
                        return { ...c, imagery };
                      }));
                    }}
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                    <span><Replace className="h-3 w-3" /></span>
                  </Button>
                </label>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => update((c) => ({ ...c, imagery: (c.imagery || []).filter((_: any, i: number) => i !== index) }))}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  const renderCards = () => (
    <Section title="Cards / feature copy">
      {(content.cards || []).map((card: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground">Card {index + 1}</span>
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeArrayItem('cards', index)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <MiniInput value={card.tag || ''} placeholder="Tag" onChange={(e) => updateArrayItem('cards', index, { tag: e.target.value })} />
          <MiniInput value={card.title || ''} placeholder="Title" onChange={(e) => updateArrayItem('cards', index, { title: e.target.value })} />
          <MiniText value={card.body || ''} placeholder="Body" onChange={(e) => updateArrayItem('cards', index, { body: e.target.value })} />
          <MiniText value={(card.subPoints || []).join('\n')} placeholder="Sub-points" onChange={(e) => updateArrayItem('cards', index, { subPoints: e.target.value.split('\n').filter(Boolean) })} />
          <MiniInput value={card.footnote || ''} placeholder="Footnote" onChange={(e) => updateArrayItem('cards', index, { footnote: e.target.value })} />
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 w-full text-xs gap-1" onClick={() => addArrayItem('cards', { title: 'New card', body: 'Add supporting detail.', tag: 'New' })}>
        <Plus className="h-3 w-3" /> Add card
      </Button>
    </Section>
  );

  const renderAgenda = () => (
    <Section title="Agenda items">
      {(content.agenda || []).map((item: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <div className="flex gap-1.5">
            <MiniInput value={item.step || ''} onChange={(e) => updateArrayItem('agenda', index, { step: e.target.value })} placeholder="Step" />
            <MiniInput value={item.duration || ''} onChange={(e) => updateArrayItem('agenda', index, { duration: e.target.value })} placeholder="Duration" />
          </div>
          <MiniInput value={item.title || ''} onChange={(e) => updateArrayItem('agenda', index, { title: e.target.value })} placeholder="Title" />
          <MiniText value={item.body || ''} onChange={(e) => updateArrayItem('agenda', index, { body: e.target.value })} placeholder="Body" />
          <MiniInput value={item.owner || ''} onChange={(e) => updateArrayItem('agenda', index, { owner: e.target.value })} placeholder="Owner" />
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 w-full text-xs gap-1" onClick={() => addArrayItem('agenda', { step: String((content.agenda || []).length + 1).padStart(2, '0'), title: 'New topic', body: 'Details' })}>
        <Plus className="h-3 w-3" /> Add agenda item
      </Button>
    </Section>
  );

  const renderMetrics = () => (
    <Section title="Metrics">
      {(content.metrics || []).map((metric: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <div className="flex gap-1.5">
            <MiniInput value={metric.value || ''} onChange={(e) => updateArrayItem('metrics', index, { value: e.target.value })} placeholder="Value" />
            <MiniInput value={metric.trend || ''} onChange={(e) => updateArrayItem('metrics', index, { trend: e.target.value })} placeholder="Trend" />
          </div>
          <MiniInput value={metric.label || ''} onChange={(e) => updateArrayItem('metrics', index, { label: e.target.value })} placeholder="Label" />
          <MiniInput value={metric.sublabel || ''} onChange={(e) => updateArrayItem('metrics', index, { sublabel: e.target.value })} placeholder="Sublabel" />
        </div>
      ))}
      <Button size="sm" variant="outline" className="h-7 w-full text-xs gap-1" onClick={() => addArrayItem('metrics', { value: '0', label: 'New metric', trend: '+0%' })}>
        <Plus className="h-3 w-3" /> Add metric
      </Button>
    </Section>
  );

  const renderKpi = () => (
    <Section title="KPI hero">
      <MiniInput value={content.kpi?.big || ''} onChange={(e) => update((c) => ({ ...c, kpi: { ...c.kpi, big: e.target.value } }))} placeholder="Big KPI" />
      <MiniInput value={content.kpi?.bigLabel || ''} onChange={(e) => update((c) => ({ ...c, kpi: { ...c.kpi, bigLabel: e.target.value } }))} placeholder="Label" />
      <MiniText value={content.kpi?.headline || ''} onChange={(e) => update((c) => ({ ...c, kpi: { ...c.kpi, headline: e.target.value } }))} placeholder="Headline" />
      {(content.kpi?.supporting || []).map((item: any, index: number) => (
        <div key={index} className="flex gap-1.5">
          <MiniInput value={item.value || ''} onChange={(e) => update((c) => ({ ...c, kpi: { ...c.kpi, supporting: c.kpi.supporting.map((s: any, i: number) => i === index ? { ...s, value: e.target.value } : s) } }))} placeholder="Value" />
          <MiniInput value={item.label || ''} onChange={(e) => update((c) => ({ ...c, kpi: { ...c.kpi, supporting: c.kpi.supporting.map((s: any, i: number) => i === index ? { ...s, label: e.target.value } : s) } }))} placeholder="Label" />
        </div>
      ))}
    </Section>
  );

  const renderStatQuote = () => (
    <Section title="Stat / quote">
      <MiniInput value={content.stat?.value || ''} onChange={(e) => update((c) => ({ ...c, stat: { ...c.stat, value: e.target.value } }))} placeholder="Stat value" />
      <MiniInput value={content.stat?.label || ''} onChange={(e) => update((c) => ({ ...c, stat: { ...c.stat, label: e.target.value } }))} placeholder="Stat label" />
      <MiniText value={content.quote?.text || ''} onChange={(e) => update((c) => ({ ...c, quote: { ...c.quote, text: e.target.value } }))} placeholder="Quote" />
      <MiniInput value={content.quote?.by || ''} onChange={(e) => update((c) => ({ ...c, quote: { ...c.quote, by: e.target.value } }))} placeholder="Attribution" />
    </Section>
  );

  const renderChart = () => (
    <Section title="Chart data">
      <MiniInput value={content.chart?.title || ''} onChange={(e) => update((c) => ({ ...c, chart: { ...c.chart, title: e.target.value } }))} placeholder="Chart title" />
      <MiniInput value={content.chart?.unit || ''} onChange={(e) => update((c) => ({ ...c, chart: { ...c.chart, unit: e.target.value } }))} placeholder="Unit" />
      {(content.chart?.series || []).map((point: any, index: number) => (
        <div key={index} className="flex gap-1.5">
          <MiniInput value={point.label || ''} onChange={(e) => update((c) => ({ ...c, chart: { ...c.chart, series: c.chart.series.map((p: any, i: number) => i === index ? { ...p, label: e.target.value } : p) } }))} placeholder="Label" />
          <MiniInput type="number" value={point.value ?? ''} onChange={(e) => update((c) => ({ ...c, chart: { ...c.chart, series: c.chart.series.map((p: any, i: number) => i === index ? { ...p, value: Number(e.target.value) } : p) } }))} placeholder="Value" />
        </div>
      ))}
    </Section>
  );

  const renderTimeline = () => (
    <Section title="Timeline">
      {(content.timeline || []).map((item: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <div className="flex gap-1.5">
            <MiniInput value={item.when || ''} onChange={(e) => updateArrayItem('timeline', index, { when: e.target.value })} placeholder="When" />
            <MiniInput value={item.owner || ''} onChange={(e) => updateArrayItem('timeline', index, { owner: e.target.value })} placeholder="Owner" />
          </div>
          <MiniInput value={item.title || ''} onChange={(e) => updateArrayItem('timeline', index, { title: e.target.value })} placeholder="Title" />
          <MiniText value={item.body || ''} onChange={(e) => updateArrayItem('timeline', index, { body: e.target.value })} placeholder="Body" />
          <MiniText value={(item.deliverables || []).join('\n')} onChange={(e) => updateArrayItem('timeline', index, { deliverables: e.target.value.split('\n').filter(Boolean) })} placeholder="Deliverables" />
        </div>
      ))}
    </Section>
  );

  const renderCompare = () => (
    <Section title="Comparison">
      <MiniInput value={content.compare?.heading || ''} onChange={(e) => update((c) => ({ ...c, compare: { ...c.compare, heading: e.target.value } }))} placeholder="Heading" />
      {(['before', 'after'] as const).map((side) => (
        <div key={side} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <MiniInput value={content.compare?.[side]?.title || ''} onChange={(e) => update((c) => ({ ...c, compare: { ...c.compare, [side]: { ...c.compare[side], title: e.target.value } } }))} placeholder={`${side} title`} />
          <MiniText value={(content.compare?.[side]?.points || []).join('\n')} onChange={(e) => update((c) => ({ ...c, compare: { ...c.compare, [side]: { ...c.compare[side], points: e.target.value.split('\n').filter(Boolean) } } }))} placeholder={`${side} points`} />
        </div>
      ))}
    </Section>
  );

  const renderProcess = () => (
    <Section title="Process">
      {(content.process || []).map((item: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <div className="flex gap-1.5">
            <MiniInput value={item.step || ''} onChange={(e) => updateArrayItem('process', index, { step: e.target.value })} placeholder="Step" />
            <MiniInput value={item.duration || ''} onChange={(e) => updateArrayItem('process', index, { duration: e.target.value })} placeholder="Time" />
          </div>
          <MiniInput value={item.title || ''} onChange={(e) => updateArrayItem('process', index, { title: e.target.value })} placeholder="Title" />
          <MiniText value={item.body || ''} onChange={(e) => updateArrayItem('process', index, { body: e.target.value })} placeholder="Body" />
          <MiniInput value={item.output || ''} onChange={(e) => updateArrayItem('process', index, { output: e.target.value })} placeholder="Output" />
        </div>
      ))}
    </Section>
  );

  const renderPeoplePricingBento = () => (
    <Section title="Advanced layout items">
      {kind === 'team' && (content.team || []).map((m: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <MiniInput value={m.name || ''} onChange={(e) => updateArrayItem('team', index, { name: e.target.value })} placeholder="Name" />
          <MiniInput value={m.role || ''} onChange={(e) => updateArrayItem('team', index, { role: e.target.value })} placeholder="Role" />
          <MiniInput value={m.initials || ''} onChange={(e) => updateArrayItem('team', index, { initials: e.target.value })} placeholder="Initials" />
          <MiniInput value={m.focus || ''} onChange={(e) => updateArrayItem('team', index, { focus: e.target.value })} placeholder="Focus" />
        </div>
      ))}
      {kind === 'pricing' && (content.pricing || []).map((p: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <MiniInput value={p.name || ''} onChange={(e) => updateArrayItem('pricing', index, { name: e.target.value })} placeholder="Plan" />
          <MiniInput value={p.price || ''} onChange={(e) => updateArrayItem('pricing', index, { price: e.target.value })} placeholder="Price" />
          <MiniInput value={p.cadence || ''} onChange={(e) => updateArrayItem('pricing', index, { cadence: e.target.value })} placeholder="Cadence" />
          <MiniText value={(p.features || []).join('\n')} onChange={(e) => updateArrayItem('pricing', index, { features: e.target.value.split('\n').filter(Boolean) })} placeholder="Features" />
        </div>
      ))}
      {kind === 'bento' && (content.bento || []).map((b: any, index: number) => (
        <div key={index} className="space-y-1.5 rounded-md border border-border bg-background/50 p-2">
          <MiniInput value={b.title || ''} onChange={(e) => updateArrayItem('bento', index, { title: e.target.value })} placeholder="Title" />
          <MiniText value={b.body || ''} onChange={(e) => updateArrayItem('bento', index, { body: e.target.value })} placeholder="Body" />
          <MiniInput value={b.metric || ''} onChange={(e) => updateArrayItem('bento', index, { metric: e.target.value })} placeholder="Metric" />
        </div>
      ))}
    </Section>
  );

  return (
    <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
        <Palette className="h-3.5 w-3.5 text-primary" />
        Demo slide editor
      </div>
      {renderSharedText()}
      {renderPalette()}
      {renderImagery()}
      {['cards', 'section', 'feature-split'].includes(kind || '') && renderCards()}
      {kind === 'agenda' && renderAgenda()}
      {kind === 'metrics' && renderMetrics()}
      {kind === 'kpi-hero' && renderKpi()}
      {['stat', 'quote'].includes(kind || '') && renderStatQuote()}
      {kind === 'chart' && renderChart()}
      {kind === 'timeline' && renderTimeline()}
      {kind === 'compare' && renderCompare()}
      {kind === 'process' && renderProcess()}
      {['team', 'pricing', 'bento'].includes(kind || '') && renderPeoplePricingBento()}
    </div>
  );
}