import React from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Type, Calendar, Users, Globe, Image, Mic, Target, 
  Hash, Monitor, Building2, Camera, History, Layers, Sparkles,
  CheckCircle2, MessageSquare, FileText, Award
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ImportSection {
  icon: React.ReactNode;
  label: string;
  items: string[];
}

interface BrandImportSummaryProps {
  brandName: string;
  hubBrand: Record<string, unknown>;
  eventData?: Record<string, unknown> | null;
}

export const BrandImportSummary: React.FC<BrandImportSummaryProps> = ({
  brandName,
  hubBrand,
  eventData,
}) => {
  const sections: ImportSection[] = [];

  // Colors
  const colors = (hubBrand.colors || []) as Array<{ hex: string; name?: string }>;
  if (colors.length) {
    sections.push({
      icon: <Palette className="w-4 h-4" />,
      label: 'Colors',
      items: colors.map(c => c.name ? `${c.name} (${c.hex})` : c.hex),
    });
  }

  // Fonts
  const fonts = (hubBrand.fonts || []) as Array<{ fontFamily?: string; family?: string; name?: string; role?: string; usage?: string }>;
  if (fonts.length) {
    sections.push({
      icon: <Type className="w-4 h-4" />,
      label: 'Typography',
      items: fonts.map(f => {
        const name = f.fontFamily || f.family || f.name || 'Unknown';
        const role = f.role || f.usage || '';
        return role ? `${name} — ${role}` : name;
      }),
    });
  }

  // Tagline & Mission
  const tagline = hubBrand.tagline as string | undefined;
  const mission = hubBrand.mission as string | undefined;
  if (tagline || mission) {
    const items: string[] = [];
    if (tagline) items.push(`Tagline: "${tagline}"`);
    if (mission) items.push(`Mission: ${typeof mission === 'string' && mission.length > 80 ? mission.slice(0, 80) + '…' : mission}`);
    sections.push({ icon: <MessageSquare className="w-4 h-4" />, label: 'Brand Messaging', items });
  }

  // Voice & Tone
  const voice = hubBrand.voice as string[] | undefined;
  const toneKw = hubBrand.tone_keywords as string[] | undefined;
  if (voice?.length || toneKw?.length) {
    sections.push({
      icon: <Mic className="w-4 h-4" />,
      label: 'Voice & Tone',
      items: [...(voice || []), ...(toneKw || [])].slice(0, 8),
    });
  }

  // Logo rules
  const logoRules = (hubBrand.logo_rules || (hubBrand as Record<string, unknown>).logoRules || {}) as Record<string, unknown>;
  const hasLogos = hubBrand.logo_url || hubBrand.logo_monochrome_url || hubBrand.logo_reversed_url;
  if (hasLogos || Object.keys(logoRules).length) {
    const items: string[] = [];
    if (hubBrand.logo_url) items.push('Primary logo');
    if (hubBrand.logo_monochrome_url) items.push('Monochrome variant');
    if (hubBrand.logo_reversed_url) items.push('Reversed variant');
    if (logoRules.clearSpace) items.push(`Clear space: ${logoRules.clearSpace}`);
    if (logoRules.minSize) items.push(`Min size: ${logoRules.minSize}`);
    sections.push({ icon: <Award className="w-4 h-4" />, label: 'Logo Assets & Rules', items });
  }

  // Photography
  const photoData = (hubBrand.photography || {}) as Record<string, unknown>;
  const photoDos = (photoData.dos || hubBrand.photography_dos || []) as string[];
  const photoDonts = (photoData.donts || hubBrand.photography_donts || []) as string[];
  if (photoDos.length || photoDonts.length || photoData.style) {
    const items: string[] = [];
    if (photoData.style) items.push(`Style: ${photoData.style}`);
    items.push(...photoDos.slice(0, 3).map(d => `✓ ${d}`));
    items.push(...photoDonts.slice(0, 2).map(d => `✗ ${d}`));
    sections.push({ icon: <Camera className="w-4 h-4" />, label: 'Photography', items });
  }

  // Gradients & Patterns
  const gradients = hubBrand.gradients as Array<{ name?: string; css?: string }> | undefined;
  const patterns = hubBrand.patterns as Array<{ name?: string }> | undefined;
  if (gradients?.length || patterns?.length) {
    const items: string[] = [];
    if (gradients?.length) items.push(`${gradients.length} gradient(s)`);
    if (patterns?.length) items.push(`${patterns.length} pattern(s)`);
    sections.push({ icon: <Layers className="w-4 h-4" />, label: 'Visual Assets', items });
  }

  // Color Combinations
  const colorCombos = hubBrand.colorCombinations as Array<{ name?: string; status?: string }> | undefined;
  if (colorCombos?.length) {
    const approved = colorCombos.filter(c => c.status === 'approved').length;
    const rejected = colorCombos.filter(c => c.status === 'rejected').length;
    const items: string[] = [];
    if (approved) items.push(`${approved} approved combo(s)`);
    if (rejected) items.push(`${rejected} rejected combo(s)`);
    sections.push({ icon: <Palette className="w-4 h-4" />, label: 'Color Combinations', items });
  }

  // Sponsors
  const sponsors = hubBrand.sponsors as Array<{ name?: string; tier?: string }> | undefined;
  if (sponsors?.length) {
    const tiers = [...new Set(sponsors.map(s => s.tier).filter(Boolean))];
    sections.push({
      icon: <Users className="w-4 h-4" />,
      label: `Sponsors (${sponsors.length})`,
      items: tiers.length
        ? tiers.map(t => `${t}: ${sponsors.filter(s => s.tier === t).map(s => s.name).join(', ')}`)
        : sponsors.slice(0, 5).map(s => s.name || 'Unnamed'),
    });
  }

  // Schedule
  const schedule = hubBrand.eventSchedule as Array<{ title?: string; time?: string }> | undefined;
  if (schedule?.length) {
    sections.push({
      icon: <Calendar className="w-4 h-4" />,
      label: `Schedule (${schedule.length} sessions)`,
      items: schedule.slice(0, 4).map(s => s.time ? `${s.time} — ${s.title}` : s.title || 'Session'),
    });
  }

  // Linked events
  const linkedGuides = hubBrand.linkedGuides as Array<{ name?: string; region?: string; location?: string }> | undefined;
  if (linkedGuides?.length) {
    sections.push({
      icon: <Globe className="w-4 h-4" />,
      label: `Linked Events (${linkedGuides.length})`,
      items: linkedGuides.slice(0, 5).map(g => g.name || g.region || g.location || 'Event'),
    });
  }

  // Event details
  const eventDetails = hubBrand.eventDetails as Record<string, unknown> | undefined;
  if (eventDetails || eventData) {
    const ed = eventDetails || eventData || {};
    const items: string[] = [];
    if (ed.eventName) items.push(`Event: ${ed.eventName}`);
    if (ed.eventDates) items.push(`Dates: ${ed.eventDates}`);
    if (ed.location) items.push(`Location: ${ed.location}`);
    if (ed.hashtag) items.push(`Hashtag: ${ed.hashtag}`);
    if (ed.registrationUrl) items.push('Registration URL ✓');
    if (items.length) {
      sections.push({ icon: <FileText className="w-4 h-4" />, label: 'Event Details', items });
    }
  }

  // Social specs
  const socialAssets = hubBrand.socialAssets as Array<{ platform?: string }> | undefined;
  if (socialAssets?.length) {
    sections.push({
      icon: <Monitor className="w-4 h-4" />,
      label: 'Social Platform Specs',
      items: socialAssets.map(s => s.platform || 'Platform'),
    });
  }

  // Partner booths
  const partnerBooths = hubBrand.partnerBooths as Array<{ divisionName?: string }> | undefined;
  if (partnerBooths?.length) {
    sections.push({
      icon: <Building2 className="w-4 h-4" />,
      label: `Divisions (${partnerBooths.length})`,
      items: partnerBooths.slice(0, 4).map(p => p.divisionName || 'Division'),
    });
  }

  // Event photos
  const eventPhotos = hubBrand.eventPhotographyUrls as string[] | undefined;
  if (eventPhotos?.length) {
    sections.push({
      icon: <Image className="w-4 h-4" />,
      label: `Reference Photos (${eventPhotos.length})`,
      items: [`${eventPhotos.length} photo(s) imported for design reference`],
    });
  }

  // Display banners
  const displayBanners = hubBrand.displayBanners as Array<{ name?: string; dimensions?: string }> | undefined;
  if (displayBanners?.length) {
    sections.push({
      icon: <Monitor className="w-4 h-4" />,
      label: `Display Banner Specs (${displayBanners.length})`,
      items: displayBanners.slice(0, 4).map(b => b.name ? `${b.name} — ${b.dimensions}` : b.dimensions || 'Banner'),
    });
  }

  // Event history
  const eventHistory = hubBrand.eventHistory as Array<{ year?: number; eventName?: string }> | undefined;
  if (eventHistory?.length) {
    sections.push({
      icon: <History className="w-4 h-4" />,
      label: `Event History (${eventHistory.length} past)`,
      items: eventHistory.slice(0, 3).map(h => h.year ? `${h.year}: ${h.eventName}` : h.eventName || 'Event'),
    });
  }

  // Services & Values
  const values = hubBrand.values as string[] | undefined;
  const services = hubBrand.services as Array<{ name?: string }> | undefined;
  if (values?.length || services?.length) {
    const items: string[] = [];
    if (values?.length) items.push(`${values.length} brand value(s)`);
    if (services?.length) items.push(`${services.length} service(s)/offering(s)`);
    sections.push({ icon: <Target className="w-4 h-4" />, label: 'Values & Services', items });
  }

  // Social handles & hashtags
  const socialHandles = (hubBrand.social_handles || hubBrand.socialHandles || {}) as Record<string, string>;
  const hashtags = (hubBrand.hashtags || []) as string[];
  if (Object.keys(socialHandles).length || hashtags.length) {
    const items: string[] = [];
    Object.entries(socialHandles).forEach(([platform, handle]) => {
      if (handle) items.push(`${platform}: ${handle}`);
    });
    if (hashtags.length) items.push(`Hashtags: ${hashtags.join(', ')}`);
    sections.push({ icon: <Hash className="w-4 h-4" />, label: 'Social & Hashtags', items });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{brandName}</p>
          <p className="text-xs text-muted-foreground">
            {sections.length} section{sections.length !== 1 ? 's' : ''} imported
          </p>
        </div>
      </div>

      <ScrollArea className="max-h-[340px] pr-2">
        <div className="grid gap-2">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-lg border border-border bg-muted/30 p-2.5"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="text-primary">{section.icon}</div>
                <span className="text-xs font-semibold text-foreground">{section.label}</span>
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">
                  {section.items.length}
                </Badge>
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-1.5 text-[11px] text-muted-foreground leading-tight">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="break-words">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          {sections.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              Basic brand profile imported (no extended data found).
            </p>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
};
