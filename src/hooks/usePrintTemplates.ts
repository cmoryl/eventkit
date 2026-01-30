import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { PrintTemplate, PrintTemplateSpecs } from '../types/printTemplate';

interface UsePrintTemplatesOptions {
  projectId?: string;
  assetType?: string;
}

export const usePrintTemplates = (options: UsePrintTemplatesOptions = {}) => {
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTemplates([]);
        return;
      }

      let query = supabase
        .from('print_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options.projectId) {
        query = query.or(`project_id.eq.${options.projectId},project_id.is.null`);
      }

      if (options.assetType) {
        query = query.or(`asset_type.eq.${options.assetType},asset_type.is.null`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const mappedTemplates: PrintTemplate[] = (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        name: row.name,
        description: row.description,
        filePath: row.file_path,
        specs: row.specs as unknown as PrintTemplateSpecs,
        widthInches: Number(row.width_inches),
        heightInches: Number(row.height_inches),
        bleedInches: Number(row.bleed_inches),
        safeZoneInches: Number(row.safe_zone_inches),
        resolutionDpi: row.resolution_dpi || 300,
        colorMode: row.color_mode || 'CMYK',
        hasDieLines: row.has_die_lines || false,
        hasFoldLines: row.has_fold_lines || false,
        hasPerforation: row.has_perforation || false,
        sourceVendor: row.source_vendor,
        assetType: row.asset_type,
        isFavorite: row.is_favorite || false,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      setTemplates(mappedTemplates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setIsLoading(false);
    }
  }, [options.projectId, options.assetType]);

  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('print_templates')
        .delete()
        .eq('id', templateId);

      if (deleteError) throw deleteError;

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    }
  }, []);

  const toggleFavorite = useCallback(async (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (!template) return false;

    try {
      const { error: updateError } = await supabase
        .from('print_templates')
        .update({ is_favorite: !template.isFavorite })
        .eq('id', templateId);

      if (updateError) throw updateError;

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId ? { ...t, isFavorite: !t.isFavorite } : t
        )
      );
      return true;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return false;
    }
  }, [templates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    isLoading,
    error,
    refetch: fetchTemplates,
    deleteTemplate,
    toggleFavorite,
  };
};
