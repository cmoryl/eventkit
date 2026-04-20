// Template Loader - DB-first with config fallback
import { supabase } from '@/integrations/supabase/client';
import { EditableTemplate } from '@/types/editableTemplate.types';
import { ALL_EDITABLE_TEMPLATES } from '@/config/editableTemplates/allTemplates';

let cache: EditableTemplate[] | null = null;
let cachePromise: Promise<EditableTemplate[]> | null = null;

const rowToTemplate = (row: any): EditableTemplate => ({
  id: row.id,
  name: row.name,
  description: row.description ?? '',
  assetType: row.asset_type,
  category: row.category,
  vendorId: row.vendor_id ?? undefined,
  thumbnail: row.thumbnail ?? undefined,
  previewUrl: row.preview_url ?? undefined,
  background: row.background ?? { type: 'solid', value: '#ffffff' },
  dimensions: row.dimensions ?? {},
  fields: row.fields ?? [],
  defaultFonts: row.default_fonts ?? { heading: 'Inter', body: 'Inter' },
  defaultColors: row.default_colors ?? {},
  tags: row.tags ?? [],
  isPremium: row.is_premium ?? false,
  isSystemTemplate: row.is_system_template ?? true,
  colorMode: row.color_mode ?? 'CMYK',
  dpi: row.dpi ?? 300,
  prompt: row.prompt ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const loadAllTemplates = async (force = false): Promise<EditableTemplate[]> => {
  if (cache && !force) return cache;
  if (cachePromise && !force) return cachePromise;

  cachePromise = (async () => {
    try {
      const { data, error } = await supabase
        .from('editable_templates')
        .select('*')
        .limit(2000);
      if (error) throw error;
      if (!data || data.length === 0) {
        cache = ALL_EDITABLE_TEMPLATES;
        return cache;
      }
      // Merge: DB wins by id, fall back to config for any not in DB
      const dbMap = new Map(data.map((r: any) => [r.id, rowToTemplate(r)]));
      const merged = ALL_EDITABLE_TEMPLATES.map(t => dbMap.get(t.id) ?? t);
      // Add any DB-only templates
      for (const [id, t] of dbMap) {
        if (!merged.find(m => m.id === id)) merged.push(t);
      }
      cache = merged;
      return cache;
    } catch (e) {
      console.warn('[templateLoader] DB load failed, using config fallback', e);
      cache = ALL_EDITABLE_TEMPLATES;
      return cache;
    } finally {
      cachePromise = null;
    }
  })();

  return cachePromise;
};

export const invalidateTemplateCache = () => {
  cache = null;
  cachePromise = null;
};

export const getCachedTemplates = (): EditableTemplate[] => cache ?? ALL_EDITABLE_TEMPLATES;
