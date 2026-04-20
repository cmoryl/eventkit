// Admin Template Editor - inline edit DB templates
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Save, RotateCcw, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { invalidateTemplateCache } from '@/services/templateLoader';

interface DBTemplate {
  id: string;
  name: string;
  description: string | null;
  asset_type: string;
  category: string;
  vendor_id: string | null;
  prompt: string | null;
  color_mode: string | null;
  dpi: number | null;
  tags: string[] | null;
  is_premium: boolean | null;
  background: any;
  dimensions: any;
  fields: any;
  default_fonts: any;
  default_colors: any;
}

const AdminTemplateEditor: React.FC = () => {
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DBTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiBrief, setAiBrief] = useState('');
  const [aiRefImages, setAiRefImages] = useState<string[]>([]);
  const [crafting, setCrafting] = useState(false);

  const MAX_REFS = 6;

  const handleRefUpload = (files: FileList | File[]) => {
    const list = Array.from(files);
    const remaining = MAX_REFS - aiRefImages.length;
    if (remaining <= 0) {
      toast.error(`Up to ${MAX_REFS} reference images`);
      return;
    }
    const accepted = list.slice(0, remaining);
    accepted.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is over 5MB — skipped`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        setAiRefImages((prev) =>
          prev.length >= MAX_REFS ? prev : [...prev, reader.result as string]
        );
      reader.readAsDataURL(file);
    });
    if (list.length > accepted.length) {
      toast.message(`Only added ${accepted.length} — limit is ${MAX_REFS}`);
    }
  };

  const removeRefAt = (idx: number) =>
    setAiRefImages((prev) => prev.filter((_, i) => i !== idx));

  const handleCraftPrompt = async () => {
    if (!draft) return;
    if (!aiBrief.trim() && aiRefImages.length === 0) {
      toast.error('Add a direction or upload reference image(s) first');
      return;
    }
    setCrafting(true);
    try {
      const { data, error } = await supabase.functions.invoke('craft-template-prompt', {
        body: {
          templateName: draft.name,
          assetType: draft.asset_type,
          category: draft.category,
          description: draft.description,
          currentPrompt: draft.prompt,
          userBrief: aiBrief.trim() || undefined,
          referenceImages: aiRefImages.length > 0 ? aiRefImages : undefined,
        },
      });
      if (error) throw error;
      if (!data?.prompt) throw new Error('No prompt returned');
      setDraft({ ...draft, prompt: data.prompt });
      toast.success(
        aiRefImages.length > 1
          ? `AI synthesized ${aiRefImages.length} references into a new prompt — review and Save`
          : 'AI crafted a new prompt — review and Save'
      );
    } catch (e: any) {
      toast.error(e?.message || 'Failed to craft prompt');
    } finally {
      setCrafting(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('editable_templates')
      .select('*')
      .order('asset_type')
      .order('name')
      .limit(2000);
    if (error) {
      toast.error('Failed to load templates: ' + error.message);
    } else {
      setTemplates((data ?? []) as DBTemplate[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return templates;
    return templates.filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.asset_type.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
    );
  }, [templates, search]);

  const selected = templates.find(t => t.id === selectedId) ?? null;
  const dirty = draft && selected && JSON.stringify(draft) !== JSON.stringify(selected);

  useEffect(() => {
    setDraft(selected ? { ...selected } : null);
    setAiBrief('');
    setAiRefImage(null);
  }, [selectedId]);

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    const { error } = await supabase
      .from('editable_templates')
      .update({
        name: draft.name,
        description: draft.description,
        prompt: draft.prompt,
        color_mode: draft.color_mode,
        dpi: draft.dpi,
        tags: draft.tags,
        is_premium: draft.is_premium,
        background: draft.background,
        dimensions: draft.dimensions,
        fields: draft.fields,
        default_fonts: draft.default_fonts,
        default_colors: draft.default_colors,
      })
      .eq('id', draft.id);
    setSaving(false);
    if (error) {
      toast.error('Save failed: ' + error.message);
      return;
    }
    toast.success('Template saved');
    invalidateTemplateCache();
    await load();
  };

  const updateJsonField = (key: keyof DBTemplate, value: string) => {
    if (!draft) return;
    try {
      const parsed = JSON.parse(value);
      setDraft({ ...draft, [key]: parsed } as DBTemplate);
    } catch {
      // ignore parse errors while typing
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-[calc(100vh-220px)]">
      {/* List */}
      <div className="border border-border rounded-lg flex flex-col overflow-hidden bg-card">
        <div className="p-3 border-b border-border space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <div className="text-xs text-muted-foreground">
            {loading ? 'Loading…' : `${filtered.length} of ${templates.length}`}
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-1.5 space-y-0.5">
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-2 rounded-md transition-colors ${
                  selectedId === t.id ? 'bg-primary/10 border border-primary/40' : 'hover:bg-muted'
                }`}
              >
                <div className="text-sm font-medium text-foreground truncate">{t.name}</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <span className="truncate">{t.asset_type}</span>
                  <Badge variant="outline" className="h-4 text-[9px] px-1">{t.category}</Badge>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Editor */}
      <div className="border border-border rounded-lg bg-card overflow-hidden flex flex-col">
        {!draft ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a template to edit
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground font-mono truncate">{draft.id}</div>
                <div className="text-sm font-semibold text-foreground truncate">{draft.name}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDraft(selected ? { ...selected } : null)}
                  disabled={!dirty || saving}
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
                <Button size="sm" onClick={handleSave} disabled={!dirty || saving}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                  Save
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={draft.name}
                      onChange={e => setDraft({ ...draft, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Color Mode</Label>
                    <Input
                      value={draft.color_mode ?? ''}
                      onChange={e => setDraft({ ...draft, color_mode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">DPI</Label>
                    <Input
                      type="number"
                      value={draft.dpi ?? 300}
                      onChange={e => setDraft({ ...draft, dpi: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Tags (comma-separated)</Label>
                    <Input
                      value={(draft.tags ?? []).join(', ')}
                      onChange={e => setDraft({ ...draft, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    value={draft.description ?? ''}
                    onChange={e => setDraft({ ...draft, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">AI Prompt (used by generators for this template)</Label>
                  <Textarea
                    rows={5}
                    placeholder="e.g. A modern minimalist event badge with bold typography…"
                    value={draft.prompt ?? ''}
                    onChange={e => setDraft({ ...draft, prompt: e.target.value })}
                  />
                </div>

                {/* AI Prompt Crafter */}
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Craft a masterful prompt with AI
                    </span>
                  </div>
                  <Textarea
                    rows={2}
                    placeholder="Describe the look you want, e.g. 'luxury minimal, dark navy + gold, art-deco hierarchy'…"
                    value={aiBrief}
                    onChange={e => setAiBrief(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) handleRefUpload(f);
                          e.target.value = '';
                        }}
                      />
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-border hover:bg-muted transition-colors">
                        <Upload className="h-3 w-3" />
                        {aiRefImage ? 'Replace reference' : 'Upload reference image'}
                      </span>
                    </label>
                    {aiRefImage && (
                      <div className="relative">
                        <img
                          src={aiRefImage}
                          alt="reference"
                          className="h-10 w-10 rounded object-cover border border-border"
                        />
                        <button
                          onClick={() => setAiRefImage(null)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                          aria-label="Remove reference"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                    <Button
                      size="sm"
                      onClick={handleCraftPrompt}
                      disabled={crafting || (!aiBrief.trim() && !aiRefImage)}
                      className="ml-auto"
                    >
                      {crafting ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Generate Prompt
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    AI will replace the prompt above. Review, then click Save to persist.
                  </p>
                </div>

                <details className="group">
                  <summary className="text-xs font-medium cursor-pointer text-foreground select-none">
                    Advanced JSON (dimensions, fields, fonts, colors, background)
                  </summary>
                  <div className="mt-2 grid gap-3">
                    {(['dimensions', 'default_fonts', 'default_colors', 'background', 'fields'] as const).map(key => (
                      <div key={key}>
                        <Label className="text-xs capitalize">{key.replace('_', ' ')}</Label>
                        <Textarea
                          rows={key === 'fields' ? 12 : 4}
                          className="font-mono text-[11px]"
                          defaultValue={JSON.stringify(draft[key], null, 2)}
                          onChange={e => updateJsonField(key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminTemplateEditor;
