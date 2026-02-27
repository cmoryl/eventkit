import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { addOrUpdateKnowledge } from '@/services/aiBrain/learningService';
import { toast } from 'sonner';

interface BrandHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrandImported: () => void;
}

export const BrandHubImportModal: React.FC<BrandHubImportModalProps> = ({
  isOpen,
  onClose,
  onBrandImported,
}) => {
  const { user } = useAuth();
  const [shareUrl, setShareUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importedBrandName, setImportedBrandName] = useState<string | null>(null);

  const extractTokenOrSlug = (url: string): { shareToken?: string; slug?: string } | null => {
    const trimmed = url.trim();
    // Support share URL: brandhubcreator.lovable.app/share/TOKEN
    const sharePattern = /brandhubcreator\.lovable\.app\/share\/([a-zA-Z0-9-]+)/;
    const shareMatch = trimmed.match(sharePattern);
    if (shareMatch) return { shareToken: shareMatch[1] };

    // Support event/product URLs: brandhubcreator.lovable.app/event/SLUG or /product/SLUG
    const slugPattern = /brandhubcreator\.lovable\.app\/(?:event|product)\/([a-zA-Z0-9-]+)/;
    const slugMatch = trimmed.match(slugPattern);
    if (slugMatch) return { slug: slugMatch[1] };

    // Also support the Lovable project preview URL pattern
    const previewPattern = /lovableproject\.com\/(?:event|product)\/([a-zA-Z0-9-]+)/;
    const previewMatch = trimmed.match(previewPattern);
    if (previewMatch) return { slug: previewMatch[1] };

    // If it looks like a bare token (UUID-like)
    if (/^[a-zA-Z0-9-]{8,}$/.test(trimmed)) return { shareToken: trimmed };
    return null;
  };

  const handleImport = async () => {
    if (!user) {
      toast.error('Please sign in to import brands');
      return;
    }

    const parsed = extractTokenOrSlug(shareUrl);
    if (!parsed) {
      toast.error('Please enter a valid BrandHub share URL, event URL, or token');
      return;
    }

    setIsImporting(true);
    toast.info('Fetching brand from BrandHub...', { duration: 3000 });

    try {
      const { data, error } = await supabase.functions.invoke('fetch-brandhub-brand', {
        body: { shareToken: parsed.shareToken, slug: parsed.slug }
      });

      if (data?.success === false || error) {
        toast.error(data?.error || 'Failed to fetch from BrandHub');
        return;
      }

      if (!data?.brand) {
        toast.error('No brand data returned from BrandHub');
        return;
      }

      const hubBrand = data.brand;
      const brandName = (hubBrand.name as string) || 'Imported Brand';

      // Check if brand already exists by token
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('user_id', user.id)
        .eq('brandhub_share_token', data.resolvedToken || parsed.shareToken || parsed.slug || '')
        .maybeSingle();

      let brandId: string;

      if (existingBrand) {
        brandId = existingBrand.id;
        // Update existing brand
        await supabase.from('brands').update({
          name: brandName,
          logo_url: (hubBrand.logo_url as string) || null,
          logo_monochrome_url: (hubBrand.logo_monochrome_url as string) || null,
          logo_reversed_url: (hubBrand.logo_reversed_url as string) || null,
          brandhub_last_synced: new Date().toISOString(),
        }).eq('id', brandId);
      } else {
        // Create new brand
        const { data: newBrand, error: createError } = await supabase
          .from('brands')
          .insert({
            user_id: user.id,
            name: brandName,
            logo_url: (hubBrand.logo_url as string) || null,
            logo_monochrome_url: (hubBrand.logo_monochrome_url as string) || null,
            logo_reversed_url: (hubBrand.logo_reversed_url as string) || null,
            brandhub_share_token: data.resolvedToken || parsed.shareToken || parsed.slug || '',
            brandhub_last_synced: new Date().toISOString(),
          })
          .select('id')
          .single();

        if (createError || !newBrand) {
          toast.error('Failed to create brand');
          return;
        }
        brandId = newBrand.id;
      }

      // Extract and save brand styles
      const colors = (hubBrand.colors || []) as Array<{ hex: string; name?: string; cmyk?: string; pantone?: string; usage?: string }>;
      const fonts = (hubBrand.fonts || []) as Array<{ fontFamily?: string; family?: string; name?: string; usage?: string; role?: string; id?: string }>;
      const guideData = (hubBrand.guide_data || {}) as Record<string, unknown>;

      // BrandHub returns 'family' from event guide_data, 'fontFamily' from share endpoint
      const getFamily = (f: typeof fonts[0]) => f.fontFamily || f.family;
      const headingFont = fonts.find(f => f.role === 'heading' || f.role === 'display' || f.name?.toLowerCase().includes('heading') || f.usage?.toLowerCase().includes('headline'));
      const bodyFont = fonts.find(f => f.role === 'body' || f.role === 'paragraph' || f.name?.toLowerCase().includes('body') || f.usage?.toLowerCase().includes('paragraph'));
      const accentFont = fonts.find(f => f.role === 'accent' || f.role === 'caption');

      const photographyData = (guideData.photography || hubBrand.photography || {}) as Record<string, unknown>;
      const logoRules = (guideData.logoRules || hubBrand.logo_rules || {}) as Record<string, unknown>;
      const socialData = (guideData.social || hubBrand.social || {}) as Record<string, unknown>;
      const heroData = (guideData.hero || {}) as Record<string, unknown>;

      const styleData = {
        brand_id: brandId,
        primary_color: colors[0]?.hex || (hubBrand.primary_color as string) || null,
        secondary_color: colors[1]?.hex || (hubBrand.secondary_color as string) || null,
        accent_color: colors[2]?.hex || (hubBrand.accent_color as string) || null,
        color_palette: colors.map(c => ({ hex: c.hex, name: c.name || '' })),
        heading_font: getFamily(headingFont || fonts[0]) || null,
        body_font: getFamily(bodyFont || fonts[1]) || null,
        accent_font: getFamily(accentFont || fonts[2]) || null,
        brand_voice: (hubBrand.voice as string[]) || [],
        tone_keywords: (hubBrand.tone_keywords as string[]) || [],
        mood_keywords: (hubBrand.mood_keywords as string[]) || [],
        imagery_style: (hubBrand.imagery_style as string) || null,
        industry: (hubBrand.industry as string) || null,
        target_audience: (hubBrand.target_audience as string) || null,
        photography_style: (photographyData.style || hubBrand.photography_style) as string || null,
        photography_dos: (photographyData.dos || hubBrand.photography_dos || []) as string[],
        photography_donts: (photographyData.donts || hubBrand.photography_donts || []) as string[],
        logo_clear_space: (logoRules.clearSpace || hubBrand.logo_clear_space) as string || null,
        logo_min_size: (logoRules.minSize || hubBrand.logo_min_size) as string || null,
        logo_placement_rules: (logoRules.placement || hubBrand.logo_placement_rules || []) as string[],
        logo_backgrounds: (logoRules.approvedBackgrounds || hubBrand.logo_backgrounds || []) as string[],
        social_handles: (socialData.handles || hubBrand.social_handles || {}) as Record<string, string>,
        hashtags: (socialData.hashtags || hubBrand.hashtags || []) as string[],
        tagline: (heroData.tagline || hubBrand.tagline) as string || null,
        mission: (hubBrand.mission || guideData.mission) as string || null,
        archetype: (hubBrand.archetype || guideData.archetype) as string || null,
        writing_style: (guideData.writingStyle || hubBrand.writing_style) as string || null,
      };

      // Upsert brand_styles
      const { data: existingStyle } = await supabase
        .from('brand_styles')
        .select('id')
        .eq('brand_id', brandId)
        .maybeSingle();

      if (existingStyle) {
        await supabase.from('brand_styles').update(styleData).eq('id', existingStyle.id);
      } else {
        await supabase.from('brand_styles').insert(styleData);
      }

      // Store AI knowledge for the brand
      const knowledgePromises: Promise<boolean>[] = [];

      // Voice, tagline, mission — core brand identity for prompt injection
      if (hubBrand.voice || hubBrand.mission || hubBrand.tagline) {
        // Extract tagline variations from guide_data if available
        const taglineSection = (guideData.tagline || {}) as Record<string, unknown>;
        const taglineVariations = Array.isArray(taglineSection.variations)
          ? taglineSection.variations.map((v: Record<string, unknown>) => String(v.text || v))
          : [];

        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', brandName,
          `brand_voice_${brandId}`,
          {
            voice: (hubBrand.voice as string[]) || [],
            mission: hubBrand.mission,
            tagline: hubBrand.tagline,
            taglineSecondary: taglineSection.secondary || null,
            taglineVariations,
            archetype: hubBrand.archetype,
            writingStyle: hubBrand.writing_style || guideData.writingStyle,
            industry: hubBrand.industry,
            targetAudience: hubBrand.target_audience,
          }
        ));
      }

      // Visual assets — gradients, patterns, brand icons for design reference
      const gradients = hubBrand.gradients as Array<{ name?: string; css?: string }> | undefined;
      const patterns = hubBrand.patterns as Array<{ name?: string; url?: string }> | undefined;
      const brandIcons = hubBrand.brandIcons as Array<{ name?: string; url?: string }> | undefined;
      if (gradients?.length || patterns?.length || brandIcons?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_visual_assets`,
          `brand_visuals_${brandId}`,
          {
            gradients: gradients?.map(g => g.css).filter(Boolean) || [],
            patternUrls: patterns?.map(p => p.url).filter(Boolean) || [],
            brandIconUrls: brandIcons?.map(i => i.url).filter(Boolean) || [],
          }
        ));
      }

      // Services & values — useful for content-heavy assets (brochures, presentations)
      const values = hubBrand.values as string[] | undefined;
      const services = hubBrand.services as Array<{ name?: string; description?: string }> | undefined;
      if (values?.length || services?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_content`,
          `brand_content_${brandId}`,
          {
            values: values || [],
            services: services?.map(s => `${s.name}: ${s.description}`).filter(Boolean) || [],
          }
        ));
      }

      // Sponsor data — critical for sponsor walls, step-and-repeat, etc.
      const sponsors = hubBrand.sponsors as Array<{ name?: string; url?: string; tier?: string }> | undefined;
      if (sponsors?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_sponsors`,
          `brand_sponsors_${brandId}`,
          {
            sponsors: sponsors.map(s => ({ name: s.name, logoUrl: s.url, tier: s.tier })),
            totalCount: sponsors.length,
          }
        ));
      }

      // Event data — name, date, venue, attendees for contextual generation
      if (data.hasEventData && data.event) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_event`,
          `brandhub_event_${brandId}`,
          {
            source: 'brandhub_creator',
            brandId,
            ...data.event,
            importedAt: new Date().toISOString(),
          }
        ));
      }

      await Promise.all(knowledgePromises);

      setImportedBrandName(brandName);
      const eventNote = data.hasEventData ? ` with event "${data.event?.name || 'unnamed'}"` : '';
      toast.success(`"${brandName}" imported from BrandHub${eventNote}`);
      onBrandImported();
      
      // Reset and close after brief delay
      setTimeout(() => {
        setShareUrl('');
        setImportedBrandName(null);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('BrandHub import error:', error);
      toast.error('Failed to import from BrandHub');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            Import from BrandHub
          </DialogTitle>
          <DialogDescription>
            Paste your BrandHub Creator share URL to import brand identity, colors, fonts, photography rules, and event data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {importedBrandName ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-6"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-center">
                <span className="text-emerald-600 dark:text-emerald-400">{importedBrandName}</span> imported successfully!
              </p>
            </motion.div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  BrandHub Share URL or Token
                </label>
                <Input
                  value={shareUrl}
                  onChange={(e) => setShareUrl(e.target.value)}
                  placeholder="https://brandhubcreator.lovable.app/event/your-event..."
                  disabled={isImporting}
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  Paste an event URL, product URL, share URL, or token from BrandHub
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleImport}
                  disabled={!shareUrl.trim() || isImporting}
                  className="flex-1 gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Import Brand
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose} disabled={isImporting}>
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-muted-foreground border-t border-border pt-3 space-y-1">
                <p className="font-medium">What gets imported:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Brand colors, fonts & typography</li>
                  <li>Logo variants & usage rules</li>
                  <li>Photography guidelines</li>
                  <li>Voice, tone & brand personality</li>
                  <li>Event details (if available)</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
