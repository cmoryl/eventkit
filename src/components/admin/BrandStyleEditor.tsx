import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Type, Sparkles, Save, X, Plus, Trash2, 
  Image as ImageIcon, Eye, PaintBucket, Wand2, Upload, FileText, Loader2, ExternalLink,
  Link, RefreshCw, Unlink, Clock, Brain, Images, RotateCcw
} from 'lucide-react';
import { BrandImageryGallery } from './BrandImageryGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { addOrUpdateKnowledge } from '@/services/aiBrain/learningService';
import { useAuth } from '@/hooks/useAuth';
import { applyBrandTheme, resetBrandTheme, isBrandThemeApplied } from '@/services/brandThemeService';

interface ColorInfo {
  hex: string;
  name: string;
  cmyk?: string;
  pantone?: string;
  usage?: string;
}

// Imagery organized by type from BrandHub
interface BrandImagery {
  all: string[];
  byType: {
    logos?: string[];
    brandIcons?: string[];
    patterns?: string[];
    photography?: string[];
    heroImages?: string[];
    collateral?: string[];
    social?: string[];
    banners?: string[];
    video?: string[];
  };
}

interface BrandStyle {
  id?: string;
  brand_id: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  color_palette?: ColorInfo[];
  heading_font?: string;
  body_font?: string;
  accent_font?: string;
  mood_keywords?: string[];
  tone_keywords?: string[];
  brand_voice?: string[];
  writing_style?: string;
  imagery_style?: string;
  pattern_style?: string;
  icon_style?: string;
  target_audience?: string;
  cultural_context?: string;
  industry?: string;
  custom_prompts?: Record<string, unknown>;
  // Comprehensive fields
  photography_style?: string;
  photography_dos?: string[];
  photography_donts?: string[];
  logo_clear_space?: string;
  logo_min_size?: string;
  logo_placement_rules?: string[];
  logo_backgrounds?: string[];
  social_handles?: Record<string, string>;
  hashtags?: string[];
  tagline?: string;
  mission?: string;
  archetype?: string;
  approved_layouts?: string[];
  restricted_elements?: string[];
  // All imagery from BrandHub
  all_imagery?: BrandImagery;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  logo_monochrome_url?: string;
  logo_reversed_url?: string;
  brandhub_share_token?: string;
  brandhub_last_synced?: string;
  brandhub_auto_sync?: boolean;
}

interface BrandStyleEditorProps {
  brand: Brand;
  onClose: () => void;
  onSave: () => void;
}

const fontOptions = [
  'Inter', 'Poppins', 'Montserrat', 'Playfair Display', 'Roboto', 
  'Open Sans', 'Lato', 'Oswald', 'Raleway', 'Merriweather',
  'Source Sans Pro', 'Ubuntu', 'PT Sans', 'Nunito', 'Work Sans'
];

const moodOptions = [
  'Professional', 'Playful', 'Elegant', 'Bold', 'Minimalist',
  'Luxurious', 'Friendly', 'Modern', 'Classic', 'Innovative',
  'Warm', 'Cool', 'Energetic', 'Calm', 'Sophisticated'
];

const industryOptions = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Entertainment',
  'Fashion', 'Food & Beverage', 'Real Estate', 'Travel', 'Non-profit',
  'Sports', 'Corporate', 'Retail', 'Creative Agency', 'Wellness'
];

// Sub-component: AI Brain Knowledge Panel for a brand
const BrandKnowledgePanel: React.FC<{ brandId: string; brandName: string }> = ({ brandId, brandName }) => {
  const [entries, setEntries] = useState<Array<{ id: string; knowledge_type: string; category: string | null; key: string; value: Record<string, unknown>; confidence_score: number | null; usage_count: number | null; success_rate: number | null; updated_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteEntry = async (entryId: string) => {
    setDeleting(entryId);
    const { error } = await supabase.from('ai_knowledge').delete().eq('id', entryId);
    if (error) {
      toast.error('Failed to delete knowledge entry');
    } else {
      setEntries(prev => prev.filter(e => e.id !== entryId));
      toast.success('Knowledge entry deleted');
      if (expanded === entryId) setExpanded(null);
    }
    setDeleting(null);
  };

  useEffect(() => {
    const fetchKnowledge = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('ai_knowledge')
        .select('*')
        .or(`key.ilike.%${brandId}%,key.ilike.%${brandName}%,category.ilike.%${brandName}%`)
        .order('updated_at', { ascending: false });
      setEntries((data as typeof entries) || []);
      setLoading(false);
    };
    fetchKnowledge();
  }, [brandId, brandName]);

  const typeIcons: Record<string, string> = {
    brand_preference: '🎨',
    style_preference: '✨',
    prompt_pattern: '💡',
    cultural_mapping: '🌍',
    asset_template: '📐',
    sponsor_recognition: '🤝',
    brief_preference: '📋',
  };

  const formatValue = (val: unknown): string => {
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (val && typeof val === 'object') return JSON.stringify(val, null, 2);
    return String(val ?? '—');
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        AI Brain Knowledge
        <span className="text-xs font-normal text-muted-foreground ml-1">
          ({entries.length} entries)
        </span>
      </h3>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading knowledge entries…
        </div>
      ) : entries.length === 0 ? (
        <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 text-center">
          No AI knowledge recorded for this brand yet. Sync from BrandHub, upload a brand guide, or provide feedback to start learning.
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {entries.map(entry => (
            <div key={entry.id} className="rounded-xl border border-border bg-card/60 overflow-hidden">
              <button
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
                onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
              >
                <span className="text-lg">{typeIcons[entry.knowledge_type] || '🧠'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{entry.key}</div>
                  <div className="text-xs text-muted-foreground">{entry.knowledge_type.replace(/_/g, ' ')}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                  {entry.confidence_score != null && (
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                      {Math.round(entry.confidence_score * 100)}%
                    </span>
                  )}
                  <svg className={`w-4 h-4 transition-transform ${expanded === entry.id ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              {expanded === entry.id && (
                <div className="px-3 pb-3 border-t border-border pt-2 space-y-2">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-muted/30 rounded-lg p-2">
                      <div className="text-muted-foreground">Confidence</div>
                      <div className="font-medium">{entry.confidence_score != null ? `${Math.round(entry.confidence_score * 100)}%` : '—'}</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <div className="text-muted-foreground">Uses</div>
                      <div className="font-medium">{entry.usage_count ?? 0}</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-2">
                      <div className="text-muted-foreground">Success</div>
                      <div className="font-medium">{entry.success_rate != null ? `${Math.round(entry.success_rate * 100)}%` : '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Updated {new Date(entry.updated_at).toLocaleDateString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      disabled={deleting === entry.id}
                      onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}
                    >
                      {deleting === entry.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      <span className="ml-1 text-xs">Delete</span>
                    </Button>
                  </div>
                  <pre className="text-xs bg-muted/20 rounded-lg p-2 overflow-x-auto max-h-48 whitespace-pre-wrap break-all">
                    {formatValue(entry.value)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export const BrandStyleEditor: React.FC<BrandStyleEditorProps> = ({
  brand,
  onClose,
  onSave
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isParsingGuide, setIsParsingGuide] = useState(false);
  const [uploadedGuideUrl, setUploadedGuideUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // BrandHub link state
  const [linkedToken, setLinkedToken] = useState<string | null>(brand.brandhub_share_token || null);
  const [lastSynced, setLastSynced] = useState<string | null>(brand.brandhub_last_synced || null);
  const [autoSync, setAutoSync] = useState(brand.brandhub_auto_sync || false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [style, setStyle] = useState<BrandStyle>({
    brand_id: brand.id,
    primary_color: '#6366f1',
    secondary_color: '#8b5cf6',
    accent_color: '#ec4899',
    color_palette: [],
    heading_font: 'Inter',
    body_font: 'Inter',
    mood_keywords: [],
    tone_keywords: [],
    brand_voice: [],
    imagery_style: '',
    pattern_style: '',
    target_audience: '',
    cultural_context: '',
    industry: '',
    // New comprehensive fields
    photography_style: '',
    photography_dos: [],
    photography_donts: [],
    logo_clear_space: '',
    logo_min_size: '',
    logo_placement_rules: [],
    logo_backgrounds: [],
    social_handles: {},
    hashtags: [],
    tagline: '',
    mission: '',
    archetype: '',
    approved_layouts: [],
    restricted_elements: []
  });

  const [newPaletteColor, setNewPaletteColor] = useState({ hex: '#6366f1', name: '' });
  const [newMood, setNewMood] = useState('');
  const [brandHubUrl, setBrandHubUrl] = useState('');
  const [isImportingFromHub, setIsImportingFromHub] = useState(false);

  // Record brand update to AI knowledge base
  const recordBrandKnowledge = async (brandData: Record<string, unknown>) => {
    if (!user?.id) return;
    
    try {
      await addOrUpdateKnowledge(
        user.id,
        'brand_preference',
        brand.name,
        `brand_${brand.id}`,
        {
          brandId: brand.id,
          brandName: brand.name,
          // Core identity
          colors: style.color_palette,
          fonts: { heading: style.heading_font, body: style.body_font, accent: style.accent_font },
          mood: style.mood_keywords,
          tone: style.tone_keywords,
          industry: style.industry,
          voice: style.brand_voice,
          writingStyle: style.writing_style,
          imagery: style.imagery_style,
          // Photography
          photographyStyle: style.photography_style,
          photographyDos: style.photography_dos,
          photographyDonts: style.photography_donts,
          // Logo rules
          logoClearSpace: style.logo_clear_space,
          logoMinSize: style.logo_min_size,
          logoPlacementRules: style.logo_placement_rules,
          logoBackgrounds: style.logo_backgrounds,
          // Identity
          tagline: style.tagline,
          mission: style.mission,
          archetype: style.archetype,
          culturalContext: style.cultural_context,
          targetAudience: style.target_audience,
          // Layout & restrictions
          approvedLayouts: style.approved_layouts,
          restrictedElements: style.restricted_elements,
          // Social
          socialHandles: style.social_handles,
          hashtags: style.hashtags,
          // Prompts
          customPrompts: style.custom_prompts,
          lastUpdated: new Date().toISOString(),
          ...brandData
        }
      );
      console.log('Brand knowledge recorded to AI brain (comprehensive)');
    } catch (error) {
      console.error('Error recording brand knowledge:', error);
    }
  };

  // Sync from linked BrandHub
  const syncFromBrandHub = async (token?: string) => {
    const shareToken = token || linkedToken;
    if (!shareToken) {
      toast.error('No BrandHub link configured');
      return;
    }

    setIsSyncing(true);
    toast.info('Syncing from BrandHub...', { duration: 3000 });

    try {
      const { data, error } = await supabase.functions.invoke('fetch-brandhub-brand', {
        body: { shareToken }
      });

      if (data?.success === false || error) {
        toast.error(data?.error || 'Failed to sync from BrandHub');
        return;
      }

      if (data?.brand) {
        const extractedColors = applyBrandHubData(data.brand);
        
        // Update last synced timestamp
        const now = new Date().toISOString();
        setLastSynced(now);
        
        await supabase
          .from('brands')
          .update({ 
            brandhub_last_synced: now,
            brandhub_share_token: shareToken 
          })
          .eq('id', brand.id);
        
        // Record comprehensive brand knowledge to AI brain — broken into granular entries
        await recordBrandKnowledge({
          syncedFrom: 'brandhub',
          syncTimestamp: now,
          hubBrandName: data.brand.name,
        });

        // Store granular knowledge entries for better AI retrieval
        if (user?.id) {
          const hubBrand = data.brand;
          const knowledgePromises: Promise<boolean>[] = [];

          // Photography knowledge
          if (hubBrand.photography_dos?.length || hubBrand.photography_donts?.length || hubBrand.photography_approved?.length) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_photography_${brand.id}`,
              {
                style: hubBrand.photography_style || style.photography_style,
                dos: hubBrand.photography_dos || [],
                donts: hubBrand.photography_donts || [],
                approvedExamples: (hubBrand.photography_approved || []).slice(0, 10),
                rejectedExamples: (hubBrand.photography_rejected || []).slice(0, 10),
              }
            ));
          }

          // Logo usage knowledge
          if (hubBrand.all_logos?.length || hubBrand.logo_url) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_logos_${brand.id}`,
              {
                primaryUrl: hubBrand.logo_url,
                monochromeUrl: hubBrand.logo_monochrome_url,
                reversedUrl: hubBrand.logo_reversed_url,
                iconUrl: hubBrand.logo_icon_url,
                wordmarkUrl: hubBrand.logo_wordmark_url,
                allVariants: (hubBrand.all_logos || []).slice(0, 10),
                clearSpace: style.logo_clear_space,
                minSize: style.logo_min_size,
                placementRules: style.logo_placement_rules,
                backgrounds: style.logo_backgrounds,
              }
            ));
          }

          // Brand constraints / misuse knowledge
          if (hubBrand.brand_misuse?.length || hubBrand.restricted_elements?.length) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_constraints_${brand.id}`,
              {
                misuse: hubBrand.brand_misuse || [],
                restrictedElements: hubBrand.restricted_elements || [],
                approvedLayouts: style.approved_layouts || [],
              }
            ));
          }

          // Visual assets (patterns, gradients, icons)
          if (hubBrand.patterns?.length || hubBrand.gradients?.length || hubBrand.brandIcons?.length) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_visual_assets_${brand.id}`,
              {
                patterns: (hubBrand.patterns || []).slice(0, 15),
                gradients: (hubBrand.gradients || []).slice(0, 15),
                brandIcons: (hubBrand.brandIcons || []).slice(0, 20),
                imageryCount: hubBrand.allImagery?.totalCount || 0,
              }
            ));
          }

          // Sponsor knowledge
          if (hubBrand.sponsors?.length) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'sponsor_recognition', brand.name,
              `brand_sponsors_${brand.id}`,
              {
                sponsors: hubBrand.sponsors.slice(0, 30),
                totalCount: hubBrand.sponsors.length,
                source: 'brandhub',
              }
            ));
          }

          // Voice & tone knowledge
          if (hubBrand.voice?.length || hubBrand.mission || hubBrand.tagline) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_voice_${brand.id}`,
              {
                voice: hubBrand.voice || [],
                tone: style.tone_keywords || [],
                writingStyle: style.writing_style,
                mission: hubBrand.mission || style.mission,
                tagline: hubBrand.tagline || style.tagline,
                values: hubBrand.values || [],
                archetype: style.archetype,
              }
            ));
          }

          // Social media knowledge
          if (Object.keys(hubBrand.social_handles || {}).length || hubBrand.hashtags?.length) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', brand.name,
              `brand_social_${brand.id}`,
              {
                handles: hubBrand.social_handles || {},
                hashtags: hubBrand.hashtags || [],
              }
            ));
          }

          // Event data
          if (data.hasEventData && data.event) {
            knowledgePromises.push(addOrUpdateKnowledge(
              user.id, 'brand_preference', `${brand.name}_event`,
              `brandhub_event_${brand.id}`,
              {
                source: 'brandhub_creator',
                brandId: brand.id,
                ...data.event,
                importedAt: now,
              }
            ));
          }

          try {
            await Promise.all(knowledgePromises);
            console.log(`Stored ${knowledgePromises.length} granular brand knowledge entries to AI brain`);
          } catch (e) {
            console.error('Error storing granular brand knowledge:', e);
          }
        }
        
        // Apply brand colors to UI theme using extracted values
        applyBrandTheme(extractedColors);
        
        const eventNote = data.hasEventData ? ` (event data included: ${data.event?.name || 'unnamed'})` : '';
        toast.success(`Brand synced from BrandHub${eventNote}`);
      }
    } catch (error) {
      console.error('Error syncing from BrandHub:', error);
      toast.error('Failed to sync from BrandHub');
    } finally {
      setIsSyncing(false);
    }
  };

  // Unlink BrandHub connection
  const unlinkBrandHub = async () => {
    try {
      await supabase
        .from('brands')
        .update({ 
          brandhub_share_token: null,
          brandhub_auto_sync: false 
        })
        .eq('id', brand.id);
      
      setLinkedToken(null);
      setAutoSync(false);
      toast.success('BrandHub link removed');
    } catch (error) {
      console.error('Error unlinking BrandHub:', error);
      toast.error('Failed to unlink BrandHub');
    }
  };

  // Toggle auto-sync
  const toggleAutoSync = async (enabled: boolean) => {
    try {
      await supabase
        .from('brands')
        .update({ brandhub_auto_sync: enabled })
        .eq('id', brand.id);
      
      setAutoSync(enabled);
      toast.success(enabled ? 'Auto-sync enabled' : 'Auto-sync disabled');
    } catch (error) {
      console.error('Error toggling auto-sync:', error);
    }
  };

  // Apply BrandHub data to style state and return extracted colors for theming
  const applyBrandHubData = (hubBrand: Record<string, unknown>): { primary_color?: string; secondary_color?: string; accent_color?: string; color_palette?: ColorInfo[] } => {
    const guideData = (hubBrand.guide_data || {}) as Record<string, unknown>;
    
    // Extract colors
    const colors = (hubBrand.colors || guideData.colors || []) as Array<{ hex: string; name?: string; cmyk?: string; pantone?: string; usage?: string }>;
    const primaryColor = colors[0]?.hex || hubBrand.primary_color as string;
    const secondaryColor = colors[1]?.hex || hubBrand.secondary_color as string;
    const accentColor = colors[2]?.hex || hubBrand.accent_color as string;
    
    const colorPalette: ColorInfo[] = colors.map(c => ({ 
      hex: c.hex, 
      name: c.name || '',
      cmyk: c.cmyk,
      pantone: c.pantone,
      usage: c.usage
    }));
    
    // Extract fonts
    const fonts = (hubBrand.fonts || guideData.fonts || []) as Array<{ fontFamily?: string; name?: string; usage?: string }>;
    let headingFont: string | undefined;
    let bodyFont: string | undefined;
    let accentFont: string | undefined;
    
    if (Array.isArray(fonts) && fonts.length > 0) {
      const headingEntry = fonts.find(f => 
        f.name?.toLowerCase().includes('heading') || f.usage?.toLowerCase().includes('headline')
      );
      const bodyEntry = fonts.find(f => 
        f.name?.toLowerCase().includes('body') || f.usage?.toLowerCase().includes('paragraph')
      );
      const accentEntry = fonts.find(f => 
        f.name?.toLowerCase().includes('accent')
      );
      
      headingFont = headingEntry?.fontFamily || fonts[0]?.fontFamily;
      bodyFont = bodyEntry?.fontFamily || fonts[1]?.fontFamily || fonts[0]?.fontFamily;
      accentFont = accentEntry?.fontFamily;
    }
    
    // Extract voice & mood
    const voiceKeywords = hubBrand.voice 
      ? (Array.isArray(hubBrand.voice) ? hubBrand.voice : [hubBrand.voice])
      : (hubBrand.brand_voice as string[]) || [];
    
    // Extract imagery & patterns
    const iconography = (guideData.iconography || []) as Array<{ fillMode?: string }>;
    const iconStyle = iconography.length > 0 
      ? `${iconography[0]?.fillMode || 'stroke'} style icons`
      : hubBrand.icon_style as string;
    
    const gradients = (guideData.gradients || []) as Array<{ name: string }>;
    const patternStyle = gradients.length > 0
      ? gradients.map(g => g.name).join(', ')
      : hubBrand.pattern_style as string;
    
    // Build custom prompts
    const heroData = (guideData.hero || {}) as Record<string, unknown>;
    const customPrompts: Record<string, unknown> = {};
    
    const colorCombinations = ((guideData.colorCombinations || []) as Array<{ status: string }>)
      .filter(c => c.status === 'approved');
    if (colorCombinations.length > 0) {
      customPrompts.approvedColorCombinations = colorCombinations;
    }
    
    if (gradients.length > 0) {
      customPrompts.gradients = gradients;
    }

    // ========== NEW COMPREHENSIVE FIELDS ==========
    
    // Photography guidelines
    const photographyData = (guideData.photography || hubBrand.photography || {}) as Record<string, unknown>;
    const photographyStyle = (photographyData.style || hubBrand.photography_style) as string | undefined;
    const photographyDos = (photographyData.dos || hubBrand.photography_dos || []) as string[];
    const photographyDonts = (photographyData.donts || hubBrand.photography_donts || []) as string[];
    
    // Logo usage rules
    const logoRules = (guideData.logoRules || hubBrand.logo_rules || {}) as Record<string, unknown>;
    const logoClearSpace = (logoRules.clearSpace || hubBrand.logo_clear_space) as string | undefined;
    const logoMinSize = (logoRules.minSize || hubBrand.logo_min_size) as string | undefined;
    const logoPlacementRules = (logoRules.placement || hubBrand.logo_placement_rules || []) as string[];
    const logoBackgrounds = (logoRules.approvedBackgrounds || hubBrand.logo_backgrounds || []) as string[];
    
    // Social media data
    const socialData = (guideData.social || hubBrand.social || {}) as Record<string, unknown>;
    const socialHandles = (socialData.handles || hubBrand.social_handles || {}) as Record<string, string>;
    const hashtags = (socialData.hashtags || hubBrand.hashtags || []) as string[];
    
    // Brand identity
    const tagline = (heroData.tagline || hubBrand.tagline) as string | undefined;
    const mission = (hubBrand.mission || guideData.mission) as string | undefined;
    const archetype = (hubBrand.archetype || guideData.archetype) as string | undefined;
    
    // Layout & restrictions
    const approvedLayouts = (guideData.approvedLayouts || hubBrand.approved_layouts || []) as string[];
    const restrictedElements = (guideData.restrictedElements || hubBrand.restricted_elements || []) as string[];
    
    // Writing style
    const writingStyle = (guideData.writingStyle || hubBrand.writing_style) as string | undefined;
    const toneKeywords = (hubBrand.tone_keywords || guideData.toneKeywords || []) as string[];
    
    // ========== ALL IMAGERY FROM BRANDHUB ==========
    const allImageryData = (hubBrand.allImagery || {}) as { all?: string[]; byType?: Record<string, string[]> };
    const allImagery: BrandImagery = {
      all: allImageryData.all || [],
      byType: {
        logos: allImageryData.byType?.logos || [],
        brandIcons: allImageryData.byType?.brandIcons || [],
        patterns: allImageryData.byType?.patterns || [],
        photography: allImageryData.byType?.photography || [],
        heroImages: allImageryData.byType?.heroImages || [],
        collateral: allImageryData.byType?.collateral || [],
        social: allImageryData.byType?.social || [],
        banners: allImageryData.byType?.banners || [],
        video: allImageryData.byType?.video || []
      }
    };
    
    // Update state with all fields
    setStyle(prev => ({
      ...prev,
      primary_color: primaryColor || prev.primary_color,
      secondary_color: secondaryColor || prev.secondary_color,
      accent_color: accentColor || prev.accent_color,
      color_palette: colorPalette.length > 0 
        ? [...(prev.color_palette || []), ...colorPalette]
        : prev.color_palette,
      heading_font: headingFont || prev.heading_font,
      body_font: bodyFont || prev.body_font,
      accent_font: accentFont || prev.accent_font,
      mood_keywords: (hubBrand.mood_keywords as string[])?.length > 0
        ? [...new Set([...(prev.mood_keywords || []), ...(hubBrand.mood_keywords as string[])])]
        : prev.mood_keywords,
      tone_keywords: toneKeywords.length > 0
        ? [...new Set([...(prev.tone_keywords || []), ...toneKeywords])]
        : prev.tone_keywords,
      imagery_style: (hubBrand.imagery_style as string) || prev.imagery_style,
      industry: (hubBrand.industry as string) || prev.industry,
      target_audience: (hubBrand.target_audience as string) || prev.target_audience,
      pattern_style: patternStyle || prev.pattern_style,
      icon_style: iconStyle || prev.icon_style,
      brand_voice: voiceKeywords.length > 0
        ? [...new Set([...(prev.brand_voice || []), ...voiceKeywords])]
        : prev.brand_voice,
      custom_prompts: Object.keys(customPrompts).length > 0
        ? { ...(prev.custom_prompts || {}), ...customPrompts }
        : prev.custom_prompts,
      // New comprehensive fields
      photography_style: photographyStyle || prev.photography_style,
      photography_dos: photographyDos.length > 0
        ? [...new Set([...(prev.photography_dos || []), ...photographyDos])]
        : prev.photography_dos,
      photography_donts: photographyDonts.length > 0
        ? [...new Set([...(prev.photography_donts || []), ...photographyDonts])]
        : prev.photography_donts,
      logo_clear_space: logoClearSpace || prev.logo_clear_space,
      logo_min_size: logoMinSize || prev.logo_min_size,
      logo_placement_rules: logoPlacementRules.length > 0
        ? [...new Set([...(prev.logo_placement_rules || []), ...logoPlacementRules])]
        : prev.logo_placement_rules,
      logo_backgrounds: logoBackgrounds.length > 0
        ? [...new Set([...(prev.logo_backgrounds || []), ...logoBackgrounds])]
        : prev.logo_backgrounds,
      social_handles: Object.keys(socialHandles).length > 0
        ? { ...(prev.social_handles || {}), ...socialHandles }
        : prev.social_handles,
      hashtags: hashtags.length > 0
        ? [...new Set([...(prev.hashtags || []), ...hashtags])]
        : prev.hashtags,
      tagline: tagline || prev.tagline,
      mission: mission || prev.mission,
      archetype: archetype || prev.archetype,
      approved_layouts: approvedLayouts.length > 0
        ? [...new Set([...(prev.approved_layouts || []), ...approvedLayouts])]
        : prev.approved_layouts,
      restricted_elements: restrictedElements.length > 0
        ? [...new Set([...(prev.restricted_elements || []), ...restrictedElements])]
        : prev.restricted_elements,
      // All imagery from BrandHub
      all_imagery: allImagery.all.length > 0 ? allImagery : prev.all_imagery
    }));

    // Update logos
    const primaryLogo = heroData.logoUrl || hubBrand.logo_url;
    const brandIcons = (guideData.brandIcons || []) as Array<{ name?: string; url?: string }>;
    const monochromeIcon = brandIcons.find(icon => 
      icon.name?.toLowerCase().includes('black') || icon.name?.toLowerCase().includes('mono')
    );
    const reversedIcon = brandIcons.find(icon => 
      icon.name?.toLowerCase().includes('white') || icon.name?.toLowerCase().includes('reversed')
    );
    
    if (primaryLogo || monochromeIcon?.url || reversedIcon?.url) {
      const logoUpdates: Record<string, string> = {};
      if (primaryLogo) logoUpdates.logo_url = primaryLogo as string;
      if (monochromeIcon?.url) logoUpdates.logo_monochrome_url = monochromeIcon.url;
      if (reversedIcon?.url) logoUpdates.logo_reversed_url = reversedIcon.url;
      
      supabase
        .from('brands')
        .update(logoUpdates)
        .eq('id', brand.id)
        .then(() => console.log('Updated brand logos'));
    }
    
    // Return extracted colors for immediate theming
    return {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      accent_color: accentColor,
      color_palette: colorPalette
    };
  };

  // Import from BrandHub Creator via share URL and link it
  const handleBrandHubImport = async () => {
    if (!brandHubUrl.trim()) {
      toast.error('Please enter a BrandHub share URL');
      return;
    }

    const HOST_PATTERN = /(?:brandhubcreator\.lovable\.app|gasalleystudios\.dev|gasalleystudios\.com|lovableproject\.com|lovable\.app)/;
    const trimmed = brandHubUrl.trim();
    const shareMatch = trimmed.match(new RegExp(`${HOST_PATTERN.source}\\/share\\/([a-zA-Z0-9-]+)`));
    const slugMatch = trimmed.match(new RegExp(`${HOST_PATTERN.source}\\/(?:brand|event|product)\\/([a-zA-Z0-9-]+)`));

    const shareToken = shareMatch?.[1];
    const slug = !shareMatch ? slugMatch?.[1] : undefined;

    if (!shareToken && !slug) {
      toast.error('Paste a Gas Alley Studios or BrandHub brand, event, product, or share URL');
      return;
    }

    setIsImportingFromHub(true);
    toast.info('Fetching brand from BrandHub...', { duration: 3000 });

    try {
      const { data, error } = await supabase.functions.invoke('fetch-brandhub-brand', {
        body: { shareToken, slug }
      });

      if (data?.success === false) {
        toast.warning(data.error || 'Could not import brand data');
        setBrandHubUrl('');
        setIsImportingFromHub(false);
        return;
      }

      if (error) throw error;

      if (data?.brand) {
        const extractedColors = applyBrandHubData(data.brand);
        
        // Save the link for future syncs
        const now = new Date().toISOString();
        await supabase
          .from('brands')
          .update({ 
            brandhub_share_token: shareToken,
            brandhub_last_synced: now,
            brandhub_auto_sync: false
          })
          .eq('id', brand.id);
        
        setLinkedToken(shareToken);
        setLastSynced(now);
        
        // Record comprehensive brand + event data to AI knowledge
        await recordBrandKnowledge({
          syncedFrom: 'brandhub',
          syncTimestamp: now,
          hubBrandName: data.brand.name,
          ...(data.hasEventData ? { eventData: data.event } : {}),
        });

        // Store event data as separate knowledge entry if available
        if (data.hasEventData && data.event && user?.id) {
          try {
            await addOrUpdateKnowledge(
              user.id,
              'brand_preference',
              `${brand.name}_event`,
              `brandhub_event_${brand.id}`,
              {
                source: 'brandhub_creator_import',
                brandId: brand.id,
                ...data.event,
                importedAt: now,
              }
            );
          } catch (e) {
            console.error('Error storing event knowledge:', e);
          }
        }

        setBrandHubUrl('');
        
        // Apply brand colors to UI theme using extracted values
        applyBrandTheme(extractedColors);
        
        const eventNote = data.hasEventData ? ` + event "${data.event?.name || ''}"` : '';
        toast.success(`Imported and linked "${data.brand.name || 'brand'}"${eventNote} from BrandHub`, { duration: 5000 });
      } else {
        toast.warning('No brand data found at this share link');
      }
    } catch (error) {
      console.error('Error importing from BrandHub:', error);
      toast.error('Failed to import from BrandHub');
    } finally {
      setIsImportingFromHub(false);
    }
  };

  // Handle brand guide upload and AI parsing
  const handleBrandGuideUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    // Max 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be under 20MB');
      return;
    }

    setIsParsingGuide(true);
    toast.info('Analyzing brand guide with AI...', { duration: 5000 });

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call AI to analyze the brand guide
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-brand-guide', {
        body: {
          fileBase64: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) throw error;

      if (analysisResult?.extractedStyle) {
        const extracted = analysisResult.extractedStyle;
        const sectionsFound = analysisResult.sectionsExtracted || 0;
        
        // Merge ALL extracted values with current style (comprehensive)
        setStyle(prev => ({
          ...prev,
          primary_color: extracted.primary_color || prev.primary_color,
          secondary_color: extracted.secondary_color || prev.secondary_color,
          accent_color: extracted.accent_color || prev.accent_color,
          color_palette: extracted.color_palette?.length > 0 
            ? [...(prev.color_palette || []), ...extracted.color_palette]
            : prev.color_palette,
          heading_font: extracted.heading_font || prev.heading_font,
          body_font: extracted.body_font || prev.body_font,
          accent_font: extracted.accent_font || prev.accent_font,
          mood_keywords: extracted.mood_keywords?.length > 0
            ? [...new Set([...(prev.mood_keywords || []), ...extracted.mood_keywords])]
            : prev.mood_keywords,
          tone_keywords: extracted.tone_keywords?.length > 0
            ? [...new Set([...(prev.tone_keywords || []), ...extracted.tone_keywords])]
            : prev.tone_keywords,
          brand_voice: extracted.brand_voice?.length > 0
            ? [...new Set([...(prev.brand_voice || []), ...extracted.brand_voice])]
            : prev.brand_voice,
          writing_style: extracted.writing_style || prev.writing_style,
          imagery_style: extracted.imagery_style || prev.imagery_style,
          photography_style: extracted.photography_style || prev.photography_style,
          photography_dos: extracted.photography_dos?.length > 0
            ? [...new Set([...(prev.photography_dos || []), ...extracted.photography_dos])]
            : prev.photography_dos,
          photography_donts: extracted.photography_donts?.length > 0
            ? [...new Set([...(prev.photography_donts || []), ...extracted.photography_donts])]
            : prev.photography_donts,
          pattern_style: extracted.pattern_style || prev.pattern_style,
          icon_style: extracted.icon_style || prev.icon_style,
          logo_clear_space: extracted.logo_clear_space || prev.logo_clear_space,
          logo_min_size: extracted.logo_min_size || prev.logo_min_size,
          logo_placement_rules: extracted.logo_placement_rules?.length > 0
            ? [...new Set([...(prev.logo_placement_rules || []), ...extracted.logo_placement_rules])]
            : prev.logo_placement_rules,
          logo_backgrounds: extracted.logo_backgrounds?.length > 0
            ? [...new Set([...(prev.logo_backgrounds || []), ...extracted.logo_backgrounds])]
            : prev.logo_backgrounds,
          tagline: extracted.tagline || prev.tagline,
          mission: extracted.mission || prev.mission,
          archetype: extracted.archetype || prev.archetype,
          industry: extracted.industry || prev.industry,
          target_audience: extracted.target_audience || prev.target_audience,
          cultural_context: extracted.cultural_context || prev.cultural_context,
          social_handles: extracted.social_handles 
            ? { ...(prev.social_handles || {}), ...extracted.social_handles }
            : prev.social_handles,
          hashtags: extracted.hashtags?.length > 0
            ? [...new Set([...(prev.hashtags || []), ...extracted.hashtags])]
            : prev.hashtags,
          approved_layouts: extracted.approved_layouts?.length > 0
            ? [...new Set([...(prev.approved_layouts || []), ...extracted.approved_layouts])]
            : prev.approved_layouts,
          restricted_elements: extracted.restricted_elements?.length > 0
            ? [...new Set([...(prev.restricted_elements || []), ...extracted.restricted_elements])]
            : prev.restricted_elements,
          custom_prompts: extracted.approved_color_combinations || extracted.gradients
            ? { 
                ...(prev.custom_prompts || {}),
                ...(extracted.approved_color_combinations ? { approvedColorCombinations: extracted.approved_color_combinations } : {}),
                ...(extracted.gradients ? { gradients: extracted.gradients } : {}),
              }
            : prev.custom_prompts,
        }));

        // Apply brand colors to UI theme
        applyBrandTheme({
          primary_color: extracted.primary_color,
          secondary_color: extracted.secondary_color,
          accent_color: extracted.accent_color,
          color_palette: extracted.color_palette
        });

        // Wire comprehensive data into AI knowledge base
        await recordBrandKnowledge({
          importedFrom: 'brand_guide_upload',
          fileName: file.name,
          importTimestamp: new Date().toISOString(),
          sectionsExtracted: sectionsFound,
          // Store all extracted sections for AI Brain consumption
          photographyRules: {
            style: extracted.photography_style,
            dos: extracted.photography_dos,
            donts: extracted.photography_donts,
          },
          logoRules: {
            clearSpace: extracted.logo_clear_space,
            minSize: extracted.logo_min_size,
            placement: extracted.logo_placement_rules,
            approvedBackgrounds: extracted.logo_backgrounds,
          },
          voiceAndTone: {
            voice: extracted.brand_voice,
            tone: extracted.tone_keywords,
            writingStyle: extracted.writing_style,
          },
          identity: {
            tagline: extracted.tagline,
            mission: extracted.mission,
            archetype: extracted.archetype,
            culturalContext: extracted.cultural_context,
          },
          layoutRestrictions: {
            approved: extracted.approved_layouts,
            restricted: extracted.restricted_elements,
          },
        });

        setUploadedGuideUrl(file.name);
        toast.success(`Brand guide analyzed — ${sectionsFound} sections extracted and synced to AI Brain!`);
      } else {
        toast.warning('Could not extract style information from the document');
      }
    } catch (error) {
      console.error('Error parsing brand guide:', error);
      toast.error('Failed to analyze brand guide. Please try again.');
    } finally {
      setIsParsingGuide(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    loadBrandStyle();
  }, [brand.id]);

  // Auto-sync from BrandHub on open if enabled
  useEffect(() => {
    if (autoSync && linkedToken && !isLoading) {
      syncFromBrandHub();
    }
  }, [autoSync, linkedToken, isLoading]);

  const loadBrandStyle = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_styles')
        .select('*')
        .eq('brand_id', brand.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setStyle({
          ...data,
          color_palette: Array.isArray(data.color_palette) 
            ? (data.color_palette as unknown as ColorInfo[])
            : [],
          mood_keywords: data.mood_keywords || [],
          tone_keywords: data.tone_keywords || [],
          brand_voice: data.brand_voice || [],
          custom_prompts: (data.custom_prompts && typeof data.custom_prompts === 'object' && !Array.isArray(data.custom_prompts))
            ? (data.custom_prompts as unknown as Record<string, unknown>)
            : undefined,
          // New comprehensive fields with proper type casting
          photography_dos: data.photography_dos || [],
          photography_donts: data.photography_donts || [],
          logo_placement_rules: data.logo_placement_rules || [],
          logo_backgrounds: data.logo_backgrounds || [],
          social_handles: (data.social_handles && typeof data.social_handles === 'object' && !Array.isArray(data.social_handles))
            ? (data.social_handles as unknown as Record<string, string>)
            : {},
          hashtags: data.hashtags || [],
          approved_layouts: data.approved_layouts || [],
          restricted_elements: data.restricted_elements || [],
          // All imagery from BrandHub
          all_imagery: (data.all_imagery && typeof data.all_imagery === 'object' && !Array.isArray(data.all_imagery))
            ? (data.all_imagery as unknown as BrandImagery)
            : { all: [], byType: {} }
        });
      }
    } catch (error) {
      console.error('Error loading brand style:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Cast to any to work around Supabase's strict Json typing
      const styleData: Record<string, unknown> = {
        brand_id: brand.id,
        primary_color: style.primary_color,
        secondary_color: style.secondary_color,
        accent_color: style.accent_color,
        color_palette: style.color_palette,
        heading_font: style.heading_font,
        body_font: style.body_font,
        accent_font: style.accent_font,
        mood_keywords: style.mood_keywords,
        tone_keywords: style.tone_keywords,
        brand_voice: style.brand_voice,
        imagery_style: style.imagery_style,
        pattern_style: style.pattern_style,
        icon_style: style.icon_style,
        target_audience: style.target_audience,
        cultural_context: style.cultural_context,
        industry: style.industry,
        custom_prompts: style.custom_prompts,
        // New comprehensive fields
        photography_style: style.photography_style,
        photography_dos: style.photography_dos,
        photography_donts: style.photography_donts,
        logo_clear_space: style.logo_clear_space,
        logo_min_size: style.logo_min_size,
        logo_placement_rules: style.logo_placement_rules,
        logo_backgrounds: style.logo_backgrounds,
        social_handles: style.social_handles,
        hashtags: style.hashtags,
        tagline: style.tagline,
        mission: style.mission,
        archetype: style.archetype,
        approved_layouts: style.approved_layouts,
        restricted_elements: style.restricted_elements,
        // All imagery from BrandHub
        all_imagery: style.all_imagery
      };

      if (style.id) {
        const { error } = await supabase
          .from('brand_styles')
          .update(styleData as never)
          .eq('id', style.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brand_styles')
          .insert(styleData as never);
        if (error) throw error;
      }

      // Record brand knowledge to AI brain for improved generation
      await recordBrandKnowledge({
        savedManually: true,
        savedAt: new Date().toISOString()
      });

      toast.success('Brand style saved successfully');
      onSave();
    } catch (error) {
      console.error('Error saving brand style:', error);
      toast.error('Failed to save brand style');
    } finally {
      setIsSaving(false);
    }
  };

  const addPaletteColor = () => {
    if (!newPaletteColor.hex || !newPaletteColor.name) {
      toast.error('Please enter both color and name');
      return;
    }
    setStyle(prev => ({
      ...prev,
      color_palette: [...(prev.color_palette || []), newPaletteColor]
    }));
    setNewPaletteColor({ hex: '#6366f1', name: '' });
  };

  const removePaletteColor = (index: number) => {
    setStyle(prev => ({
      ...prev,
      color_palette: prev.color_palette?.filter((_, i) => i !== index) || []
    }));
  };

  const addMoodKeyword = (mood: string) => {
    if (!style.mood_keywords?.includes(mood)) {
      setStyle(prev => ({
        ...prev,
        mood_keywords: [...(prev.mood_keywords || []), mood]
      }));
    }
  };

  const removeMoodKeyword = (mood: string) => {
    setStyle(prev => ({
      ...prev,
      mood_keywords: prev.mood_keywords?.filter(m => m !== mood) || []
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading style editor...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Brand Style Editor</h2>
              <p className="text-sm text-muted-foreground">{brand.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-8">
          {/* Brand Guide Upload Section */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border border-primary/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-primary" />
                  Import Brand Guide
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Upload a brand guide PDF or image from{' '}
                  <a 
                    href="https://brandhubcreator.lovable.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    BrandHub Creator
                    <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  or any brand kit. AI will extract colors, fonts, and style preferences.
                </p>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={handleBrandGuideUpload}
                  className="hidden"
                />
                
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsingGuide}
                    className="gap-2"
                  >
                    {isParsingGuide ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Upload Brand Guide
                      </>
                    )}
                  </Button>
                  
                  {uploadedGuideUrl && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="w-4 h-4 text-green-500" />
                      {uploadedGuideUrl}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30">
                <Wand2 className="w-8 h-8 text-primary" />
              </div>
            </div>
          </section>

          {/* BrandHub Creator Integration */}
          <section className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                  {linkedToken ? (
                    <Link className="w-5 h-5 text-green-500" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-violet-500" />
                  )}
                  {linkedToken ? 'Linked to BrandHub' : 'Import from BrandHub Creator'}
                </h3>
                
                {linkedToken ? (
                  // Show linked status and sync controls
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      This brand is linked to BrandHub. Changes made in BrandHub can be synced here.
                    </p>
                    
                    {lastSynced && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Last synced: {new Date(lastSynced).toLocaleString()}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => syncFromBrandHub()}
                        disabled={isSyncing}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4" />
                            Sync Now
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => applyBrandTheme({
                          primary_color: style.primary_color,
                          secondary_color: style.secondary_color,
                          accent_color: style.accent_color,
                          color_palette: style.color_palette
                        })}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <PaintBucket className="w-4 h-4" />
                        Apply to UI
                      </Button>
                      
                      {isBrandThemeApplied() && (
                        <Button
                          onClick={() => resetBrandTheme()}
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset Theme
                        </Button>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={autoSync}
                          onCheckedChange={toggleAutoSync}
                          id="auto-sync"
                        />
                        <Label htmlFor="auto-sync" className="text-sm cursor-pointer">
                          Auto-sync on open
                        </Label>
                      </div>
                      
                      <Button
                        onClick={unlinkBrandHub}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Unlink className="w-4 h-4" />
                        Unlink
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-violet-500/5 p-2 rounded-lg">
                      <Brain className="w-4 h-4 text-violet-500" />
                      Brand updates are recorded to AI knowledge for improved asset generation
                    </div>
                  </div>
                ) : (
                  // Show import form
                  <>
                    <p className="text-sm text-muted-foreground mb-3">
                      Paste a share link from{' '}
                      <a 
                        href="https://brandhubcreator.lovable.app" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:underline font-medium"
                      >
                        BrandHub Creator
                      </a>{' '}
                      to import and link brand styles for automatic updates.
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        value={brandHubUrl}
                        onChange={(e) => setBrandHubUrl(e.target.value)}
                        placeholder="https://brandhubcreator.lovable.app/share/..."
                        className="flex-1"
                        disabled={isImportingFromHub}
                      />
                      <Button
                        onClick={handleBrandHubImport}
                        disabled={isImportingFromHub || !brandHubUrl.trim()}
                        className="gap-2 bg-violet-600 hover:bg-violet-700"
                      >
                        {isImportingFromHub ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>
                            <Link className="w-4 h-4" />
                            Import & Link
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">
                {linkedToken ? (
                  <RefreshCw className={cn("w-8 h-8 text-violet-500", isSyncing && "animate-spin")} />
                ) : (
                  <svg className="w-10 h-10 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                )}
              </div>
            </div>
          </section>

          {/* Colors Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PaintBucket className="w-5 h-5 text-primary" />
              Brand Colors
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-sm text-muted-foreground">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.primary_color || '#6366f1'}
                    onChange={(e) => setStyle(prev => ({ ...prev, primary_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.primary_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, primary_color: e.target.value }))}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.secondary_color || '#8b5cf6'}
                    onChange={(e) => setStyle(prev => ({ ...prev, secondary_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.secondary_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, secondary_color: e.target.value }))}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Accent Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="color"
                    value={style.accent_color || '#ec4899'}
                    onChange={(e) => setStyle(prev => ({ ...prev, accent_color: e.target.value }))}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={style.accent_color || ''}
                    onChange={(e) => setStyle(prev => ({ ...prev, accent_color: e.target.value }))}
                    placeholder="#ec4899"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Extended Color Palette</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {style.color_palette?.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border"
                  >
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color.hex }} />
                    <span className="text-sm">{color.name}</span>
                    <button onClick={() => removePaletteColor(index)}>
                      <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={newPaletteColor.hex}
                  onChange={(e) => setNewPaletteColor(prev => ({ ...prev, hex: e.target.value }))}
                  className="w-14 h-10 p-1"
                />
                <Input
                  value={newPaletteColor.name}
                  onChange={(e) => setNewPaletteColor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Color name"
                  className="flex-1"
                />
                <Button onClick={addPaletteColor} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Typography
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Heading Font</Label>
                <select
                  value={style.heading_font || 'Inter'}
                  onChange={(e) => setStyle(prev => ({ ...prev, heading_font: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Body Font</Label>
                <select
                  value={style.body_font || 'Inter'}
                  onChange={(e) => setStyle(prev => ({ ...prev, body_font: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  {fontOptions.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Font Preview */}
            <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-lg font-semibold" style={{ fontFamily: style.heading_font }}>
                Heading Preview: {brand.name}
              </p>
              <p className="text-muted-foreground mt-2" style={{ fontFamily: style.body_font }}>
                Body text preview: Create stunning event design kits with AI-powered generation.
              </p>
            </div>
          </section>

          {/* Mood & Style Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Mood & Style Keywords
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {style.mood_keywords?.map(mood => (
                <span
                  key={mood}
                  className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center gap-1.5"
                >
                  {mood}
                  <button onClick={() => removeMoodKeyword(mood)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {moodOptions.filter(m => !style.mood_keywords?.includes(m)).map(mood => (
                <button
                  key={mood}
                  onClick={() => addMoodKeyword(mood)}
                  className="px-3 py-1.5 rounded-full bg-secondary text-muted-foreground text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  + {mood}
                </button>
              ))}
            </div>
          </section>

          {/* Industry & Audience Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Industry & Audience
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Industry</Label>
                <select
                  value={style.industry || ''}
                  onChange={(e) => setStyle(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full mt-1 h-10 px-3 rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="">Select industry...</option>
                  {industryOptions.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Target Audience</Label>
                <Input
                  value={style.target_audience || ''}
                  onChange={(e) => setStyle(prev => ({ ...prev, target_audience: e.target.value }))}
                  placeholder="e.g., Tech professionals, 25-45"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">Imagery Style Description</Label>
              <Textarea
                value={style.imagery_style || ''}
                onChange={(e) => setStyle(prev => ({ ...prev, imagery_style: e.target.value }))}
                placeholder="Describe the visual style for generated imagery (e.g., modern and minimalist with bold typography, abstract geometric patterns...)"
                rows={3}
                className="mt-1"
              />
            </div>
          </section>

          {/* Brand Imagery Gallery */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Images className="w-5 h-5 text-primary" />
              Brand Imagery Library
              {style.all_imagery?.all && style.all_imagery.all.length > 0 && (
                <span className="ml-auto text-sm font-normal text-muted-foreground">
                  {style.all_imagery.all.length} assets
                </span>
              )}
            </h3>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border">
              <BrandImageryGallery 
                imagery={style.all_imagery}
                brandName={brand.name}
                editable
                onImagesAdded={(images, category) => {
                  setStyle(prev => {
                    const currentImagery = prev.all_imagery || { all: [], byType: {} };
                    const catKey = category as keyof typeof currentImagery.byType;
                    return {
                      ...prev,
                      all_imagery: {
                        all: [...currentImagery.all, ...images],
                        byType: {
                          ...currentImagery.byType,
                          [catKey]: [...(currentImagery.byType[catKey] || []), ...images]
                        }
                      }
                    };
                  });
                }}
                onImageRemoved={(url) => {
                  setStyle(prev => {
                    const currentImagery = prev.all_imagery || { all: [], byType: {} };
                    const newAll = currentImagery.all.filter(u => u !== url);
                    const newByType = { ...currentImagery.byType };
                    for (const key of Object.keys(newByType) as Array<keyof typeof newByType>) {
                      if (newByType[key]) {
                        newByType[key] = newByType[key]!.filter(u => u !== url);
                      }
                    }
                    return {
                      ...prev,
                      all_imagery: { all: newAll, byType: newByType }
                    };
                  });
                }}
              />
            </div>
          </section>

          {/* AI Brain Knowledge Section */}
          <BrandKnowledgePanel brandId={brand.id} brandName={brand.name} />

          {/* Preview Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Style Preview
            </h3>
            <div 
              className="p-6 rounded-2xl border border-border overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${style.primary_color}20, ${style.secondary_color}20, ${style.accent_color}20)`
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl" style={{ backgroundColor: style.primary_color }}>
                  {brand.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold" style={{ fontFamily: style.heading_font, color: style.primary_color }}>
                    {brand.name}
                  </h4>
                  <p className="text-muted-foreground" style={{ fontFamily: style.body_font }}>
                    {brand.description || 'Your brand tagline here'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.primary_color }} />
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.secondary_color }} />
                <div className="flex-1 h-12 rounded-lg" style={{ backgroundColor: style.accent_color }} />
              </div>
              {style.mood_keywords && style.mood_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {style.mood_keywords.slice(0, 5).map(mood => (
                    <span key={mood} className="px-2 py-1 bg-white/20 rounded text-xs font-medium">
                      {mood}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-card/50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Brand Style
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
