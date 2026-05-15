import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Music2,
  Headphones,
  Mail,
  Video,
  Smartphone,
  Globe,
  Image as ImageIcon,
  Target,
  ListChecks,
  Eye,
  Download,
  Copy,
  RefreshCw,
  Loader2,
  RotateCcw,
  Upload,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Brand } from '@/types/studio.types';
import { BatchGenerationModal } from './BatchGenerationModal';
import { assetDisplayInfo } from './StudioAssetGrid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import JSZip from 'jszip';

interface SocialDigitalWizardProps {
  brand: Brand | null;
  studioGradient: string;
  projectLogoOverride?: string | null;
  onImagesGenerated: (images: Record<string, string>) => void;
  batchGeneratedImages: Record<string, string>;
}

interface NetworkOption {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  assetTypes: string[];
}

const NETWORKS: NetworkOption[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500', assetTypes: ['SOCIAL_POST', 'SOCIAL_STORY'] },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', assetTypes: ['SOCIAL_POST'] },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-sky-600', assetTypes: ['LINKEDIN_BANNER', 'SOCIAL_POST'] },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'from-slate-700 to-slate-900', assetTypes: ['TWITTER_HEADER', 'SOCIAL_POST'] },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-700', assetTypes: ['YOUTUBE_THUMBNAIL'] },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'from-rose-500 to-cyan-500', assetTypes: ['SOCIAL_STORY'] },
  { id: 'podcast', name: 'Podcast', icon: Headphones, color: 'from-amber-500 to-orange-600', assetTypes: ['PODCAST_COVER'] },
  { id: 'email', name: 'Email', icon: Mail, color: 'from-emerald-500 to-teal-600', assetTypes: ['EMAIL_HEADER'] },
  { id: 'zoom', name: 'Zoom / Webinar', icon: Video, color: 'from-sky-500 to-indigo-600', assetTypes: ['ZOOM_BACKGROUND'] },
  { id: 'app', name: 'App / Web', icon: Smartphone, color: 'from-violet-500 to-fuchsia-500', assetTypes: ['APP_ICON', 'FAVICON', 'EVENT_APP_SPLASH'] },
];

const STEPS = [
  { id: 1, label: 'Brief', icon: Target },
  { id: 2, label: 'Networks', icon: Globe },
  { id: 3, label: 'Review', icon: ListChecks },
  { id: 4, label: 'Generate', icon: Sparkles },
  { id: 5, label: 'Preview & Export', icon: Eye },
];

interface CaptionData {
  headline: string;
  caption: string;
  hashtags: string[];
  cta: string;
}

// Preview aspect-ratio style per asset type (width / height)
const ASSET_ASPECT: Record<string, React.CSSProperties> = {
  SOCIAL_POST:       { aspectRatio: '1 / 1' },
  PODCAST_COVER:     { aspectRatio: '1 / 1' },
  APP_ICON:          { aspectRatio: '1 / 1' },
  FAVICON:           { aspectRatio: '1 / 1' },
  SOCIAL_STORY:      { aspectRatio: '9 / 16', maxHeight: 320 },
  EVENT_APP_SPLASH:  { aspectRatio: '9 / 16', maxHeight: 320 },
  YOUTUBE_THUMBNAIL: { aspectRatio: '16 / 9' },
  ZOOM_BACKGROUND:   { aspectRatio: '16 / 9' },
  LINKEDIN_BANNER:   { aspectRatio: '4 / 1' },
  TWITTER_HEADER:    { aspectRatio: '3 / 1' },
  EMAIL_HEADER:      { aspectRatio: '3 / 1' },
};

// Networks selected -> ordered asset items keyed per (network, assetType).
// We deliberately key per-network so the same assetType can appear under
// multiple networks with their own copy.
interface AssetItem {
  key: string;          // `${networkId}::${assetType}`
  networkId: string;
  networkName: string;
  assetType: string;
  assetName: string;
  dimensions?: string;
  /** Asset types share generated images (sized identically) */
  imageKey: string;
}

export const SocialDigitalWizard: React.FC<SocialDigitalWizardProps> = ({
  brand,
  studioGradient,
  projectLogoOverride,
  onImagesGenerated,
  batchGeneratedImages,
}) => {
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [keyMessage, setKeyMessage] = useState('');
  const [audience, setAudience] = useState('');
  const [vibe, setVibe] = useState('');
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [referenceImages, setReferenceImages] = useState<{ name: string; dataUrl: string }[]>([]);
  const [referenceDocs, setReferenceDocs] = useState<{ name: string; size: number; text?: string }[]>([]);
  const [showBatch, setShowBatch] = useState(false);

  // Preview / export state
  const [captions, setCaptions] = useState<Record<string, CaptionData>>({});
  const [loadingCaptions, setLoadingCaptions] = useState(false);
  const [exporting, setExporting] = useState(false);

  const assetItems: AssetItem[] = useMemo(() => {
    const items: AssetItem[] = [];
    NETWORKS.filter(n => selectedNetworks.includes(n.id)).forEach(n => {
      n.assetTypes.forEach(t => {
        const info = assetDisplayInfo[t];
        items.push({
          key: `${n.id}::${t}`,
          networkId: n.id,
          networkName: n.name,
          assetType: t,
          assetName: info?.name || t,
          dimensions: info?.dimensions,
          imageKey: t,
        });
      });
    });
    return items;
  }, [selectedNetworks]);

  const uniqueAssetTypes = useMemo(
    () => Array.from(new Set(assetItems.map(i => i.assetType))),
    [assetItems]
  );

  const generatedCount = useMemo(
    () => uniqueAssetTypes.filter(t => batchGeneratedImages[t]).length,
    [uniqueAssetTypes, batchGeneratedImages]
  );

  const allGenerated = uniqueAssetTypes.length > 0 && generatedCount === uniqueAssetTypes.length;

  const toggleNetwork = (id: string) => {
    setSelectedNetworks(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const canAdvance = () => {
    if (step === 1) return campaignName.trim().length > 0 && keyMessage.trim().length > 0;
    if (step === 2) return selectedNetworks.length > 0;
    if (step === 3) return uniqueAssetTypes.length > 0;
    if (step === 4) return allGenerated;
    return true;
  };

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ''));
      r.onerror = () => reject(r.error);
      r.readAsDataURL(file);
    });

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result || ''));
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });

  const handleReferenceUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const MAX_IMG_BYTES = 8 * 1024 * 1024; // 8MB per image
    const MAX_DOC_BYTES = 5 * 1024 * 1024;
    const newImages: { name: string; dataUrl: string }[] = [];
    const newDocs: { name: string; size: number; text?: string }[] = [];
    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/')) {
          if (file.size > MAX_IMG_BYTES) {
            toast.error(`${file.name} is over 8MB — skipped`);
            continue;
          }
          const dataUrl = await readFileAsDataUrl(file);
          newImages.push({ name: file.name, dataUrl });
        } else {
          if (file.size > MAX_DOC_BYTES) {
            toast.error(`${file.name} is over 5MB — skipped`);
            continue;
          }
          // Try to read text-based docs inline; binary docs (pdf/docx) just get the filename hint
          const isTextLike = /\.(txt|md|markdown|csv|json|html?|rtf)$/i.test(file.name) ||
            file.type.startsWith('text/');
          let text: string | undefined;
          if (isTextLike) {
            text = (await readFileAsText(file)).slice(0, 8000);
          }
          newDocs.push({ name: file.name, size: file.size, text });
        }
      } catch (err) {
        console.error('Reference upload failed for', file.name, err);
        toast.error(`Could not read ${file.name}`);
      }
    }
    if (newImages.length) setReferenceImages(prev => [...prev, ...newImages]);
    if (newDocs.length) setReferenceDocs(prev => [...prev, ...newDocs]);
  };

  const removeReferenceImage = (idx: number) =>
    setReferenceImages(prev => prev.filter((_, i) => i !== idx));
  const removeReferenceDoc = (idx: number) =>
    setReferenceDocs(prev => prev.filter((_, i) => i !== idx));

  const referenceNotes = useMemo(() => {
    const parts: string[] = [];
    if (referenceDocs.length) {
      parts.push('Reference documents:');
      referenceDocs.forEach(d => {
        parts.push(`- ${d.name}${d.text ? `:\n${d.text}` : ''}`);
      });
    }
    if (referenceImages.length) {
      parts.push(`Reference images attached: ${referenceImages.map(i => i.name).join(', ')}`);
    }
    return parts.join('\n');
  }, [referenceDocs, referenceImages]);

  const fetchCaptions = useCallback(async () => {
    if (!assetItems.length) return;
    setLoadingCaptions(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-social-captions', {
        body: {
          campaignName,
          keyMessage,
          audience,
          vibe,
          brandName: brand?.name,
          referenceNotes: referenceNotes || undefined,
          assets: assetItems.map(i => ({
            key: i.key,
            network: i.networkName,
            assetType: i.assetType,
            assetName: i.assetName,
          })),
        },
      });
      if (error) throw error;
      const next: Record<string, CaptionData> = {};
      const incoming = (data?.captions || {}) as Record<string, CaptionData>;
      for (const item of assetItems) {
        next[item.key] = incoming[item.key] || {
          headline: campaignName,
          caption: keyMessage,
          hashtags: [],
          cta: '',
        };
      }
      setCaptions(next);
    } catch (e) {
      console.error('Caption generation failed:', e);
      const status = (e as any)?.context?.status ?? (e as any)?.status;
      if (status === 401) toast.error('Sign in to generate captions');
      else if (status === 429) toast.error('Rate limited — try again shortly');
      else if (status === 402) toast.error('AI credits exhausted');
      else toast.error('Could not generate captions. Showing fallbacks.');
      const fallback: Record<string, CaptionData> = {};
      for (const item of assetItems) {
        fallback[item.key] = { headline: campaignName, caption: keyMessage, hashtags: [], cta: '' };
      }
      setCaptions(fallback);
    } finally {
      setLoadingCaptions(false);
    }
  }, [assetItems, campaignName, keyMessage, audience, vibe, brand?.name, referenceNotes]);

  const reset = () => {
    setStep(1);
    setCampaignName('');
    setKeyMessage('');
    setAudience('');
    setVibe('');
    setSelectedNetworks([]);
    setReferenceImages([]);
    setReferenceDocs([]);
    setCaptions({});
  };

  const next = async () => {
    if (step === 4) {
      // Always re-fetch captions when entering preview so brief changes are reflected
      await fetchCaptions();
    }
    setStep(s => Math.min(5, s + 1));
  };

  const back = () => {
    // Clear captions when going back past the generate step so they're
    // re-generated with the (possibly edited) brief on next advance.
    if (step === 5) setCaptions({});
    setStep(s => Math.max(1, s - 1));
  };

  const updateCaption = (key: string, patch: Partial<CaptionData>) => {
    setCaptions(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const copyCaption = async (key: string) => {
    const c = captions[key];
    if (!c) return;
    const text = [c.headline, '', c.caption, '', c.hashtags.join(' '), c.cta].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  const exportZip = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const grouped: Record<string, AssetItem[]> = {};
      assetItems.forEach(i => {
        (grouped[i.networkName] ||= []).push(i);
      });

      let failedImages = 0;
      for (const [networkName, items] of Object.entries(grouped)) {
        const folder = zip.folder(networkName) || zip;
        for (const item of items) {
          const url = batchGeneratedImages[item.imageKey];
          if (url) {
            try {
              const blob = await fetch(url).then(r => r.blob());
              const ext = blob.type.includes('png') ? 'png' : 'jpg';
              folder.file(`${item.assetType}.${ext}`, blob);
            } catch (e) {
              console.error('Failed to fetch image for', item.key, e);
              failedImages++;
            }
          }
          const c = captions[item.key];
          if (c) {
            const text = `${item.assetName}\n${'='.repeat(item.assetName.length)}\n\n${c.headline}\n\n${c.caption}\n\n${c.hashtags.join(' ')}\n\n${c.cta}`.trim();
            folder.file(`${item.assetType}.txt`, text);
          }
        }
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(campaignName || 'social-campaign').replace(/\s+/g, '-').toLowerCase()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      if (failedImages > 0) {
        toast.warning(`Exported ZIP — ${failedImages} image${failedImages > 1 ? 's' : ''} could not be fetched and were skipped.`);
      } else {
        toast.success('Exported ZIP with images and captions');
      }
    } catch (e) {
      console.error('Export failed:', e);
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const itemsByNetwork = useMemo(() => {
    const map: Record<string, AssetItem[]> = {};
    assetItems.forEach(i => {
      (map[i.networkName] ||= []).push(i);
    });
    return map;
  }, [assetItems]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-2">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => s.id < step && setStep(s.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                    isActive && `bg-gradient-to-r ${studioGradient} text-white shadow-lg`,
                    isComplete && 'text-foreground hover:bg-muted',
                    !isActive && !isComplete && 'text-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold',
                    isActive && 'bg-white/20',
                    isComplete && 'bg-emerald-500/20 text-emerald-500',
                    !isActive && !isComplete && 'bg-muted'
                  )}>
                    {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div className={cn(
                    'flex-1 h-px',
                    step > s.id ? 'bg-emerald-500/40' : 'bg-border'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        {step > 1 && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Start over
            </button>
          </div>
        )}
              </div>

              {/* Reference uploads */}
              <div className="space-y-2">
                <Label>Reference images & documents (optional)</Label>
                <p className="text-xs text-muted-foreground -mt-1">
                  Upload moodboards, past creative, briefs, or product shots so generations match the right look and message.
                </p>
                <label
                  htmlFor="ref-upload"
                  className="flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-colors text-sm text-muted-foreground"
                >
                  <Upload className="h-4 w-4" />
                  Click to upload images (PNG/JPG/WebP) or documents (PDF, DOCX, TXT, MD)
                </label>
                <input
                  id="ref-upload"
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt,.md,.markdown,.rtf,.csv,.json"
                  className="hidden"
                  onChange={e => {
                    handleReferenceUpload(e.target.files);
                    e.target.value = '';
                  }}
                />

                {referenceImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                    {referenceImages.map((img, idx) => (
                      <div key={`${img.name}-${idx}`} className="relative group rounded-lg overflow-hidden border border-border bg-muted aspect-square">
                        <img src={img.dataUrl} alt={img.name} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeReferenceImage(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {referenceDocs.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {referenceDocs.map((doc, idx) => (
                      <div key={`${doc.name}-${idx}`} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/40 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="flex-1 truncate">{doc.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {(doc.size / 1024).toFixed(0)} KB{doc.text ? ' · text read' : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeReferenceDoc(idx)}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          title="Remove"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl p-6 sm:p-8"
        >
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Tell us about your campaign</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  These details guide every post we generate.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign / Event Name *</Label>
                <Input
                  id="campaign"
                  placeholder="e.g. Spring Product Launch"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Key message *</Label>
                <Textarea
                  id="message"
                  placeholder="What's the headline you want people to remember?"
                  rows={3}
                  value={keyMessage}
                  onChange={e => setKeyMessage(e.target.value)}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audience">Target audience</Label>
                  <Input
                    id="audience"
                    placeholder="e.g. Marketing leaders, ages 28-45"
                    value={audience}
                    onChange={e => setAudience(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vibe">Tone / vibe</Label>
                  <Input
                    id="vibe"
                    placeholder="e.g. Bold, energetic, premium"
                    value={vibe}
                    onChange={e => setVibe(e.target.value)}
                  />
                </div>
              </div>
              {!brand && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-sm text-amber-600 dark:text-amber-400">
                  Tip: pick a brand from the top bar so generations stay on-brand.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Select networks</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Pick every channel you need posts for. Asset sizes are matched automatically.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {NETWORKS.map(n => {
                  const Icon = n.icon;
                  const active = selectedNetworks.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => toggleNetwork(n.id)}
                      className={cn(
                        'relative p-4 rounded-xl border transition-all text-left group',
                        active
                          ? 'border-transparent ring-2 ring-offset-2 ring-offset-background ring-primary'
                          : 'border-border hover:border-foreground/30'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3',
                        n.color
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-sm font-semibold">{n.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {n.assetTypes.length} asset{n.assetTypes.length > 1 ? 's' : ''}
                      </div>
                      {active && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  {selectedNetworks.length} selected · {assetItems.length} post{assetItems.length === 1 ? '' : 's'}
                </span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNetworks([])}>
                    Clear
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedNetworks(NETWORKS.map(n => n.id))}>
                    Select all
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Review your queue</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  We'll bulk generate {uniqueAssetTypes.length} unique asset size{uniqueAssetTypes.length === 1 ? '' : 's'} ({assetItems.length} total post{assetItems.length === 1 ? '' : 's'}).
                </p>
              </div>
              <div className="space-y-4">
                {Object.entries(itemsByNetwork).map(([networkName, items]) => (
                  <div key={networkName}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">{networkName}</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {items.map(item => (
                        <div key={item.key} className="p-3 rounded-lg border border-border bg-background flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{item.assetName}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {item.dimensions || 'Auto size'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-1">
                <div><span className="text-muted-foreground">Campaign:</span> <span className="font-medium">{campaignName || '—'}</span></div>
                <div><span className="text-muted-foreground">Message:</span> <span className="font-medium">{keyMessage || '—'}</span></div>
                {audience && <div><span className="text-muted-foreground">Audience:</span> {audience}</div>}
                {vibe && <div><span className="text-muted-foreground">Vibe:</span> {vibe}</div>}
                <div><span className="text-muted-foreground">Brand:</span> <span className="font-medium">{brand?.name || 'No brand selected'}</span></div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center py-6">
              <div className={cn(
                'w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center',
                studioGradient
              )}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Generate your assets</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                  We'll create {uniqueAssetTypes.length} unique asset size{uniqueAssetTypes.length === 1 ? '' : 's'} for {selectedNetworks.length} network{selectedNetworks.length === 1 ? '' : 's'}.
                </p>
              </div>
              <Button
                size="lg"
                className={cn('bg-gradient-to-r', studioGradient)}
                onClick={() => setShowBatch(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generatedCount > 0 ? 'Continue Generating' : 'Bulk Generate'}
              </Button>
              <div className="text-xs text-muted-foreground">
                {generatedCount} of {uniqueAssetTypes.length} generated
              </div>
              {allGenerated && (
                <div className="mx-auto max-w-sm p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-600 dark:text-emerald-400">
                  All assets ready — click Next to preview each post with copy.
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-2xl font-bold">Preview every post</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Final visual + platform-tailored copy for each network. Edit any field before exporting.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchCaptions}
                    disabled={loadingCaptions}
                  >
                    {loadingCaptions ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Regenerate copy
                  </Button>
                  <Button
                    size="sm"
                    className={cn('bg-gradient-to-r', studioGradient)}
                    onClick={exportZip}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export ZIP
                  </Button>
                </div>
              </div>

              {loadingCaptions && !Object.keys(captions).length ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  <Loader2 className="h-6 w-6 mx-auto mb-3 animate-spin" />
                  Writing platform-native copy…
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(itemsByNetwork).map(([networkName, items]) => {
                    const network = NETWORKS.find(n => n.name === networkName);
                    const NetIcon = network?.icon || Globe;
                    return (
                      <section key={networkName}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            'w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center',
                            network?.color
                          )}>
                            <NetIcon className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold">{networkName}</h3>
                          <span className="text-xs text-muted-foreground">
                            {items.length} post{items.length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {items.map(item => {
                            const imgUrl = batchGeneratedImages[item.imageKey];
                            const c = captions[item.key];
                            return (
                              <div key={item.key} className="rounded-xl border border-border bg-background overflow-hidden">
                                <div
                                  className="bg-muted flex items-center justify-center relative w-full overflow-hidden"
                                  style={ASSET_ASPECT[item.assetType] ?? { aspectRatio: '16 / 9' }}
                                >
                                  {imgUrl ? (
                                    <img
                                      src={imgUrl}
                                      alt={item.assetName}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-xs text-muted-foreground flex flex-col items-center gap-1">
                                      <ImageIcon className="h-6 w-6" />
                                      Not generated yet
                                    </div>
                                  )}
                                  <div className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded bg-background/80 backdrop-blur border border-border">
                                    {item.assetName} · {item.dimensions || 'auto'}
                                  </div>
                                </div>
                                <div className="p-4 space-y-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Headline</Label>
                                    <Input
                                      value={c?.headline || ''}
                                      onChange={e => updateCaption(item.key, { headline: e.target.value })}
                                      className="h-8 text-sm"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Caption</Label>
                                    <Textarea
                                      rows={3}
                                      value={c?.caption || ''}
                                      onChange={e => updateCaption(item.key, { caption: e.target.value })}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Hashtags</Label>
                                      <Input
                                        value={c?.hashtags?.join(' ') || ''}
                                        onChange={e => updateCaption(item.key, {
                                          hashtags: e.target.value.split(/\s+/).filter(Boolean),
                                        })}
                                        className="h-8 text-sm"
                                        placeholder="#brand #event"
                                      />
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">CTA</Label>
                                      <Input
                                        value={c?.cta || ''}
                                        onChange={e => updateCaption(item.key, { cta: e.target.value })}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyCaption(item.key)}
                                    >
                                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                                      Copy text
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={back}
          disabled={step === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {step < 5 && (
          <Button
            onClick={next}
            disabled={!canAdvance() || loadingCaptions}
            className={cn('bg-gradient-to-r', studioGradient)}
          >
            {step === 4 && loadingCaptions ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Preparing preview…
              </>
            ) : (
              <>
                {step === 4 ? 'Preview Posts' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>

      {/* Batch generation modal */}
      <BatchGenerationModal
        isOpen={showBatch}
        onClose={() => setShowBatch(false)}
        assetTypes={uniqueAssetTypes}
        brand={brand}
        eventName={campaignName || brand?.name || 'Your Campaign'}
        studioGradient={studioGradient}
        projectLogoOverride={projectLogoOverride}
        assetDisplayInfo={assetDisplayInfo}
        onImagesGenerated={onImagesGenerated}
      />
    </div>
  );
};
