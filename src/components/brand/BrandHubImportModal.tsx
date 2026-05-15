import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link2, Loader2, Grid3X3, Link, Palette, Calendar, Package, HelpCircle, AlertCircle, History, X } from 'lucide-react';
import { BrandImportSummary } from './BrandImportSummary';
import { BrandHubGallery } from './BrandHubGallery';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [importedHubBrand, setImportedHubBrand] = useState<Record<string, unknown> | null>(null);
  const [importedEventData, setImportedEventData] = useState<Record<string, unknown> | null>(null);

  type RecentImport = { url: string; name: string; kind: 'brand' | 'event' | 'product' | 'share' | 'token' | 'slug'; slug?: string; ts: number };
  const RECENTS_KEY = 'brandhub-recent-imports';
  const loadRecents = (): RecentImport[] => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      return raw ? (JSON.parse(raw) as RecentImport[]).slice(0, 6) : [];
    } catch { return []; }
  };
  const [recents, setRecents] = useState<RecentImport[]>([]);
  useEffect(() => { if (isOpen) setRecents(loadRecents()); }, [isOpen]);

  const pushRecent = useCallback((url: string, name: string) => {
    const detected = detectLinkKind(url);
    if (detected.kind === 'empty' || detected.kind === 'invalid') return;
    const entry: RecentImport = {
      url: url.trim(),
      name: name || 'Imported Brand',
      kind: detected.kind,
      slug: detected.slug,
      ts: Date.now(),
    };
    const next = [entry, ...loadRecents().filter(r => r.url !== entry.url)].slice(0, 6);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setRecents(next);
  }, []);

  const removeRecent = (url: string) => {
    const next = loadRecents().filter(r => r.url !== url);
    try { localStorage.setItem(RECENTS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setRecents(next);
  };

  const extractTokenOrSlug = (url: string): { shareToken?: string; slug?: string } | null => {
    const trimmed = url.trim();

    // Hosts that serve BrandHub content (Gas Alley Studios, BrandHub Creator, Lovable previews)
    const HOST_PATTERN = /(?:brandhubcreator\.lovable\.app|gasalleystudios\.dev|gasalleystudios\.com|lovableproject\.com|lovable\.app)/;

    // Share URL: <host>/share/TOKEN
    const sharePattern = new RegExp(`${HOST_PATTERN.source}\\/share\\/([a-zA-Z0-9-]+)`);
    const shareMatch = trimmed.match(sharePattern);
    if (shareMatch) return { shareToken: shareMatch[1] };

    // Entity URL: <host>/(brand|event|product)/SLUG
    const slugPattern = new RegExp(`${HOST_PATTERN.source}\\/(?:brand|event|product)\\/([a-zA-Z0-9-]+)`);
    const slugMatch = trimmed.match(slugPattern);
    if (slugMatch) return { slug: slugMatch[1] };

    // Bare token (UUID-like) or bare slug
    if (/^[a-zA-Z0-9-]{4,}$/.test(trimmed)) {
      // UUID-shaped → token, otherwise treat as slug (resolver tries both)
      const looksLikeUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
      return looksLikeUuid ? { shareToken: trimmed } : { slug: trimmed };
    }
    return null;
  };

  type LinkKind = 'brand' | 'event' | 'product' | 'share' | 'token' | 'slug' | 'invalid' | 'empty';
  const detectLinkKind = (url: string): { kind: LinkKind; slug?: string; host?: string } => {
    const trimmed = url.trim();
    if (!trimmed) return { kind: 'empty' };
    const HOST_PATTERN = /(?:brandhubcreator\.lovable\.app|gasalleystudios\.dev|gasalleystudios\.com|lovableproject\.com|lovable\.app)/;
    const hostMatch = trimmed.match(HOST_PATTERN);
    const host = hostMatch?.[0];
    const entity = trimmed.match(new RegExp(`${HOST_PATTERN.source}\\/(brand|event|product)\\/([a-zA-Z0-9-]+)`));
    if (entity) return { kind: entity[1] as 'brand' | 'event' | 'product', slug: entity[2], host };
    if (new RegExp(`${HOST_PATTERN.source}\\/share\\/([a-zA-Z0-9-]+)`).test(trimmed)) return { kind: 'share', host };
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) return { kind: 'token' };
    if (/^[a-zA-Z0-9-]{4,}$/.test(trimmed)) return { kind: 'slug', slug: trimmed };
    return { kind: 'invalid' };
  };

  const linkPreview = React.useMemo(() => detectLinkKind(shareUrl), [shareUrl]);

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
      const sponsors = hubBrand.sponsors as Array<{ name?: string; url?: string; logoUrl?: string; tier?: string }> | undefined;
      if (sponsors?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_sponsors`,
          `brand_sponsors_${brandId}`,
          {
            sponsors: sponsors.map(s => ({ name: s.name, logoUrl: s.logoUrl || s.url, tier: s.tier })),
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

      // Event schedule — for agenda, program booklet, and session-based assets
      const schedule = hubBrand.eventSchedule as Array<{ title?: string; time?: string; location?: string; description?: string; track?: string; speaker?: string }> | undefined;
      if (schedule?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_schedule`,
          `brand_schedule_${brandId}`,
          {
            sessions: schedule.map(s => ({
              title: s.title, time: s.time, location: s.location,
              description: s.description, track: s.track, speaker: s.speaker,
            })),
            totalSessions: schedule.length,
          }
        ));
      }

      // Linked regional events — for multi-event context
      const linkedGuides = hubBrand.linkedGuides as Array<{ name?: string; slug?: string; region?: string; location?: string; dates?: string; venue?: string; attendees?: number; accentColor?: string }> | undefined;
      if (linkedGuides?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_linked_events`,
          `brand_linked_events_${brandId}`,
          {
            events: linkedGuides.map(g => ({
              name: g.name, region: g.region, location: g.location,
              dates: g.dates, venue: g.venue, attendees: g.attendees, accentColor: g.accentColor,
            })),
            totalEvents: linkedGuides.length,
          }
        ));
      }

      // Color combinations — approved/rejected combos for design guidance
      const colorCombos = hubBrand.colorCombinations as Array<{ name?: string; colors?: string[]; status?: string; notes?: string }> | undefined;
      if (colorCombos?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_color_combos`,
          `brand_color_combos_${brandId}`,
          {
            approved: colorCombos.filter(c => c.status === 'approved').map(c => ({ name: c.name, colors: c.colors, notes: c.notes })),
            rejected: colorCombos.filter(c => c.status === 'rejected').map(c => ({ name: c.name, colors: c.colors, notes: c.notes })),
          }
        ));
      }

      // Social platform specs — for accurate social media asset generation
      const socialAssets = hubBrand.socialAssets as Array<{ platform?: string; postSize?: string; storySize?: string; directive?: string; textLegibility?: string }> | undefined;
      if (socialAssets?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_social_specs`,
          `brand_social_specs_${brandId}`,
          {
            platforms: socialAssets.map(s => ({
              platform: s.platform, postSize: s.postSize, storySize: s.storySize,
              directive: s.directive, textLegibility: s.textLegibility,
            })),
          }
        ));
      }

      // Partner booths / divisions — for booth graphics, kiosk screens
      const partnerBooths = hubBrand.partnerBooths as Array<{ divisionName?: string; tagline?: string; color?: string; services?: string[] }> | undefined;
      if (partnerBooths?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_divisions`,
          `brand_divisions_${brandId}`,
          {
            divisions: partnerBooths.map(p => ({
              name: p.divisionName, tagline: p.tagline, color: p.color, services: p.services,
            })),
          }
        ));
      }

      // Event photography URLs — reference imagery for generation
      const eventPhotos = hubBrand.eventPhotographyUrls as string[] | undefined;
      if (eventPhotos?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_event_photos`,
          `brand_event_photos_${brandId}`,
          {
            urls: eventPhotos.slice(0, 20),
            totalCount: eventPhotos.length,
          }
        ));
      }

      // Event details (dates, hashtag, registration URL)
      const eventDetailsData = hubBrand.eventDetails as Record<string, unknown> | undefined;
      if (eventDetailsData) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_event_details`,
          `brand_event_details_${brandId}`,
          {
            eventName: eventDetailsData.eventName,
            eventDates: eventDetailsData.eventDates,
            eventType: eventDetailsData.eventType,
            hashtag: eventDetailsData.hashtag,
            location: eventDetailsData.location,
            registrationUrl: eventDetailsData.registrationUrl,
          }
        ));
      }

      // Display banner specs — for ad generation
      const displayBanners = hubBrand.displayBanners as Array<{ name?: string; dimensions?: string; safeZonePolicy?: string; textLegibility?: string; maxMessaging?: string }> | undefined;
      if (displayBanners?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_display_specs`,
          `brand_display_specs_${brandId}`,
          {
            banners: displayBanners.map(b => ({
              name: b.name, dimensions: b.dimensions, safeZone: b.safeZonePolicy,
              textLegibility: b.textLegibility, maxMessaging: b.maxMessaging,
            })),
          }
        ));
      }

      // Event history — for context about past events
      const eventHistory = hubBrand.eventHistory as Array<{ year?: number; eventName?: string; location?: string; attendees?: number; theme?: string; highlights?: string }> | undefined;
      if (eventHistory?.length) {
        knowledgePromises.push(addOrUpdateKnowledge(
          user.id, 'brand_preference', `${brandName}_event_history`,
          `brand_event_history_${brandId}`,
          {
            history: eventHistory.map(h => ({
              year: h.year, name: h.eventName, location: h.location,
              attendees: h.attendees, theme: h.theme, highlights: h.highlights,
            })),
          }
        ));
      }

      await Promise.all(knowledgePromises);

      setImportedBrandName(brandName);
      setImportedHubBrand(hubBrand as Record<string, unknown>);
      setImportedEventData(data.hasEventData ? data.event : null);
      toast.success(`"${brandName}" imported from BrandHub`);
      pushRecent(shareUrl, brandName);
      onBrandImported();
    } catch (error) {
      console.error('BrandHub import error:', error);
      toast.error('Failed to import from BrandHub');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setShareUrl('');
    setImportedBrandName(null);
    setImportedHubBrand(null);
    setImportedEventData(null);
    onClose();
  };

  const handleGallerySelect = (token: string | null, slug: string | null) => {
    if (token) {
      setShareUrl(token);
    } else if (slug) {
      setShareUrl(`https://brandhubcreator.lovable.app/event/${slug}`);
    }
    // Auto-trigger import
    setTimeout(() => {
      const parsed = token ? { shareToken: token } : slug ? { slug } : null;
      if (parsed) {
        handleImportWithParsed(parsed);
      }
    }, 100);
  };

  const handleImportWithParsed = async (parsed: { shareToken?: string; slug?: string }) => {
    if (!user) {
      toast.error('Please sign in to import brands');
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

      // Re-use existing import logic by calling handleImport indirectly
      // Set URL and trigger normal flow
      if (parsed.shareToken) setShareUrl(parsed.shareToken);
      else if (parsed.slug) setShareUrl(`https://brandhubcreator.lovable.app/event/${parsed.slug}`);

      // Process the data same as handleImport
      await processImportedBrand(data);
    } catch (error) {
      console.error('BrandHub import error:', error);
      toast.error('Failed to import from BrandHub');
    } finally {
      setIsImporting(false);
    }
  };

  // Extract shared import processing
  const processImportedBrand = async (data: Record<string, unknown>) => {
    if (!user) return;
    const hubBrand = data.brand as Record<string, unknown>;
    const brandName = (hubBrand.name as string) || 'Imported Brand';

    const resolvedToken = (data.resolvedToken as string) || '';

    // Check if brand already exists by token
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('user_id', user.id)
      .eq('brandhub_share_token', resolvedToken)
      .maybeSingle();

    let brandId: string;

    if (existingBrand) {
      brandId = existingBrand.id;
      await supabase.from('brands').update({
        name: brandName,
        logo_url: (hubBrand.logo_url as string) || null,
        logo_monochrome_url: (hubBrand.logo_monochrome_url as string) || null,
        logo_reversed_url: (hubBrand.logo_reversed_url as string) || null,
        brandhub_last_synced: new Date().toISOString(),
      }).eq('id', brandId);
    } else {
      const { data: newBrand, error: createError } = await supabase
        .from('brands')
        .insert({
          user_id: user.id,
          name: brandName,
          logo_url: (hubBrand.logo_url as string) || null,
          logo_monochrome_url: (hubBrand.logo_monochrome_url as string) || null,
          logo_reversed_url: (hubBrand.logo_reversed_url as string) || null,
          brandhub_share_token: resolvedToken,
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

    // Save styles (same logic as handleImport)
    const colors = (hubBrand.colors || []) as Array<{ hex: string; name?: string }>;
    const fonts = (hubBrand.fonts || []) as Array<{ fontFamily?: string; family?: string; role?: string; name?: string; usage?: string }>;
    const getFamily = (f: typeof fonts[0]) => f.fontFamily || f.family;
    const headingFont = fonts.find(f => f.role === 'heading' || f.role === 'display');
    const bodyFont = fonts.find(f => f.role === 'body' || f.role === 'paragraph');

    const styleData = {
      brand_id: brandId,
      primary_color: colors[0]?.hex || (hubBrand.primary_color as string) || null,
      secondary_color: colors[1]?.hex || (hubBrand.secondary_color as string) || null,
      accent_color: colors[2]?.hex || (hubBrand.accent_color as string) || null,
      color_palette: colors.map(c => ({ hex: c.hex, name: c.name || '' })),
      heading_font: getFamily(headingFont || fonts[0]) || null,
      body_font: getFamily(bodyFont || fonts[1]) || null,
      brand_voice: (hubBrand.voice as string[]) || [],
      photography_dos: (hubBrand.photography_dos as string[]) || [],
      photography_donts: (hubBrand.photography_donts as string[]) || [],
      tagline: (hubBrand.tagline as string) || null,
      mission: (hubBrand.mission as string) || null,
      industry: (hubBrand.industry as string) || null,
      all_imagery: JSON.parse(JSON.stringify((hubBrand.allImagery as Record<string, unknown>) || {})),
    };

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

    setImportedBrandName(brandName);
    setImportedHubBrand(hubBrand);
    setImportedEventData(data.hasEventData ? (data.event as Record<string, unknown>) : null);
    toast.success(`"${brandName}" imported from BrandHub`);
    pushRecent(shareUrl, brandName);
    onBrandImported();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className={importedHubBrand ? 'max-w-lg' : 'max-w-xl'} onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            {importedHubBrand ? 'Import Summary' : 'Import from BrandHub'}
          </DialogTitle>
          {!importedHubBrand && (
            <DialogDescription>
              Browse brands, events &amp; products from Gas Alley Studios / BrandHub — or paste any share URL.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {importedHubBrand && importedBrandName ? (
            <>
              <BrandImportSummary
                brandName={importedBrandName}
                hubBrand={importedHubBrand}
                eventData={importedEventData}
              />
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </>
          ) : (
            <Tabs defaultValue="browse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="browse" className="gap-1.5">
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Browse
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-1.5">
                  <Link className="h-3.5 w-3.5" />
                  Paste URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="browse" className="mt-3">
                <BrandHubGallery
                  onSelectBrand={handleGallerySelect}
                  isImporting={isImporting}
                />
              </TabsContent>

              <TabsContent value="url" className="mt-3 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    BrandHub Share URL or Token
                  </label>
                  <Input
                    value={shareUrl}
                    onChange={(e) => setShareUrl(e.target.value)}
                    placeholder="https://gasalleystudios.dev/brand/your-brand or /product/your-product"
                    disabled={isImporting}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Paste a Gas Alley Studios or BrandHub brand, event, or product URL — or a share token
                  </p>

                  {linkPreview.kind !== 'empty' && (
                    <div className={`mt-2 flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${
                      linkPreview.kind === 'invalid'
                        ? 'border-destructive/40 bg-destructive/10 text-destructive'
                        : 'border-border bg-muted/40 text-foreground'
                    }`}>
                      {linkPreview.kind === 'brand' && <><Palette className="h-3.5 w-3.5 text-violet-400" /><span><span className="font-medium">Brand</span> detected{linkPreview.slug && <> · <span className="text-muted-foreground">{linkPreview.slug}</span></>}</span></>}
                      {linkPreview.kind === 'event' && <><Calendar className="h-3.5 w-3.5 text-blue-400" /><span><span className="font-medium">Event</span> detected{linkPreview.slug && <> · <span className="text-muted-foreground">{linkPreview.slug}</span></>}</span></>}
                      {linkPreview.kind === 'product' && <><Package className="h-3.5 w-3.5 text-emerald-400" /><span><span className="font-medium">Product</span> detected{linkPreview.slug && <> · <span className="text-muted-foreground">{linkPreview.slug}</span></>}</span></>}
                      {linkPreview.kind === 'share' && <><Link2 className="h-3.5 w-3.5 text-violet-400" /><span><span className="font-medium">Share link</span> — type resolved on import</span></>}
                      {linkPreview.kind === 'token' && <><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /><span><span className="font-medium">Share token</span> — type resolved on import</span></>}
                      {linkPreview.kind === 'slug' && <><HelpCircle className="h-3.5 w-3.5 text-muted-foreground" /><span><span className="font-medium">Slug</span> — type resolved on import</span></>}
                      {linkPreview.kind === 'invalid' && <><AlertCircle className="h-3.5 w-3.5" /><span>Unrecognized URL — paste a brand, event, product, or share link</span></>}
                    </div>
                  )}
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
                  <Button variant="outline" onClick={handleClose} disabled={isImporting}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
