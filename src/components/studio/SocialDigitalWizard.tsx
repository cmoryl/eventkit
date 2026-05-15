import React, { useMemo, useState } from 'react';
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
  Mail,
  Video,
  Smartphone,
  Globe,
  Image as ImageIcon,
  Target,
  ListChecks,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Brand } from '@/types/studio.types';
import { BatchGenerationModal } from './BatchGenerationModal';
import { assetDisplayInfo } from './StudioAssetGrid';

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
  /** Asset types to produce when this network is selected */
  assetTypes: string[];
}

const NETWORKS: NetworkOption[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-500', assetTypes: ['SOCIAL_POST', 'SOCIAL_STORY'] },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-800', assetTypes: ['SOCIAL_POST'] },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-sky-600', assetTypes: ['LINKEDIN_BANNER', 'SOCIAL_POST'] },
  { id: 'twitter', name: 'X / Twitter', icon: Twitter, color: 'from-slate-700 to-slate-900', assetTypes: ['TWITTER_HEADER', 'SOCIAL_POST'] },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'from-red-500 to-red-700', assetTypes: ['YOUTUBE_THUMBNAIL'] },
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'from-rose-500 to-cyan-500', assetTypes: ['SOCIAL_STORY'] },
  { id: 'podcast', name: 'Podcast', icon: Music2, color: 'from-amber-500 to-orange-600', assetTypes: ['PODCAST_COVER'] },
  { id: 'email', name: 'Email', icon: Mail, color: 'from-emerald-500 to-teal-600', assetTypes: ['EMAIL_HEADER'] },
  { id: 'zoom', name: 'Zoom / Webinar', icon: Video, color: 'from-sky-500 to-indigo-600', assetTypes: ['ZOOM_BACKGROUND'] },
  { id: 'app', name: 'App / Web', icon: Smartphone, color: 'from-violet-500 to-fuchsia-500', assetTypes: ['APP_ICON', 'FAVICON', 'EVENT_APP_SPLASH'] },
];

const STEPS = [
  { id: 1, label: 'Brief', icon: Target },
  { id: 2, label: 'Networks', icon: Globe },
  { id: 3, label: 'Review', icon: ListChecks },
  { id: 4, label: 'Generate & Export', icon: Sparkles },
];

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
  const [showBatch, setShowBatch] = useState(false);

  const selectedAssetTypes = useMemo(() => {
    const set = new Set<string>();
    NETWORKS.filter(n => selectedNetworks.includes(n.id)).forEach(n => {
      n.assetTypes.forEach(t => set.add(t));
    });
    return Array.from(set);
  }, [selectedNetworks]);

  const toggleNetwork = (id: string) => {
    setSelectedNetworks(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const canAdvance = () => {
    if (step === 1) return campaignName.trim().length > 0 && keyMessage.trim().length > 0;
    if (step === 2) return selectedNetworks.length > 0;
    if (step === 3) return selectedAssetTypes.length > 0;
    return true;
  };

  const next = () => setStep(s => Math.min(4, s + 1));
  const back = () => setStep(s => Math.max(1, s - 1));

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
                  {selectedNetworks.length} selected · {selectedAssetTypes.length} unique asset{selectedAssetTypes.length === 1 ? '' : 's'}
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
                  We'll bulk generate {selectedAssetTypes.length} on-brand asset{selectedAssetTypes.length === 1 ? '' : 's'}.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedAssetTypes.map(t => {
                  const info = assetDisplayInfo[t];
                  return (
                    <div key={t} className="p-3 rounded-lg border border-border bg-background flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{info?.name || t}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {info?.dimensions || 'Auto size'}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <h2 className="text-2xl font-bold">Ready to generate</h2>
                <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                  We'll create {selectedAssetTypes.length} asset{selectedAssetTypes.length === 1 ? '' : 's'} across {selectedNetworks.length} network{selectedNetworks.length === 1 ? '' : 's'}.
                  When done, download them all as a ZIP.
                </p>
              </div>
              <Button
                size="lg"
                className={cn('bg-gradient-to-r', studioGradient)}
                onClick={() => setShowBatch(true)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Bulk Generate & Export
              </Button>
              {Object.keys(batchGeneratedImages).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Object.keys(batchGeneratedImages).length} asset{Object.keys(batchGeneratedImages).length === 1 ? '' : 's'} already generated.
                </p>
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
        {step < 4 && (
          <Button
            onClick={next}
            disabled={!canAdvance()}
            className={cn('bg-gradient-to-r', studioGradient)}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Batch generation modal */}
      <BatchGenerationModal
        isOpen={showBatch}
        onClose={() => setShowBatch(false)}
        assetTypes={selectedAssetTypes}
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
