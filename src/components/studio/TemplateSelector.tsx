// Template Selector Component - Choose from available templates

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Building2, Palette, Tag, Type, Image, QrCode, Shapes } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EditableTemplate } from '@/types/editableTemplate.types';
import { AssetType } from '@/types';
import { TEMPLATE_STATS } from '@/config/editableTemplates';
import { ALL_EDITABLE_TEMPLATES } from '@/config/editableTemplates/allTemplates';
import { loadAllTemplates } from '@/services/templateLoader';
import { TemplatePreviewRenderer } from './TemplatePreviewRenderer';

// Category chip definitions with tag-based matching
const CATEGORY_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'badges', label: 'Badges', tags: ['vip', 'security', 'backstage', 'badge', 'credential', 'lanyard'] },
  { id: 'signage', label: 'Signage', tags: ['door', 'room', 'wayfinding', 'wifi', 'sign', 'directional'] },
  { id: 'merch', label: 'Merch', tags: ['tshirt', 'hat', 'cap', 'bag', 'swag', 'apparel', 'wristband', 'sticker'] },
  { id: 'social', label: 'Social', tags: ['social', 'instagram', 'story', 'linkedin', 'youtube', 'twitter'] },
  { id: 'large-format', label: 'Large Format', tags: ['step-repeat', 'stage', 'backdrop', 'booth', 'hanging', 'floor-decal', 'window-cling', 'a-frame', 'banner'] },
  { id: 'vendor', label: 'Vendor', tags: ['staples', 'fedex', 'ups-store', 'costco', 'walgreens', 'cvs', 'local'] },
] as const;

interface TemplateSelectorProps {
  assetType?: AssetType;
  vendorId?: string;
  onSelect: (template: EditableTemplate) => void;
  selectedTemplateId?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  assetType,
  vendorId,
  onSelect,
  selectedTemplateId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'universal' | 'vendor'>('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [allTemplates, setAllTemplates] = useState<EditableTemplate[]>(ALL_EDITABLE_TEMPLATES);

  useEffect(() => {
    loadAllTemplates().then(setAllTemplates).catch(() => {});
  }, []);

  // Get filtered templates
  const templates = useMemo(() => {
    let result: EditableTemplate[] = [];

    if (activeTab === 'universal') {
      result = allTemplates.filter(t => t.category === 'universal' && (!assetType || t.assetType === assetType));
    } else if (activeTab === 'vendor' && vendorId) {
      result = allTemplates.filter(t => t.category === 'vendor-specific' && t.vendorId === vendorId && (!assetType || t.assetType === assetType));
    } else if (assetType) {
      result = allTemplates.filter(t => t.assetType === assetType);
    } else {
      result = [...allTemplates];
    }

    // Apply category chip filter
    if (activeCategory !== 'all') {
      const chip = CATEGORY_CHIPS.find(c => c.id === activeCategory);
      if (chip && 'tags' in chip) {
        const chipTags = chip.tags;
        result = result.filter(t =>
          t.tags?.some(tag => chipTags.some(ct => tag.toLowerCase().includes(ct))) ||
          (activeCategory === 'vendor' && t.category === 'vendor-specific')
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return result;
  }, [allTemplates, assetType, vendorId, activeTab, activeCategory, searchQuery]);

  // Field type icon helper
  const fieldIcon = (type: string) => {
    switch (type) {
      case 'text': case 'textarea': return <Type className="h-3 w-3 text-muted-foreground" />;
      case 'image': case 'logo': return <Image className="h-3 w-3 text-muted-foreground" />;
      case 'qrcode': return <QrCode className="h-3 w-3 text-muted-foreground" />;
      default: return <Shapes className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Render template card
  const renderTemplateCard = (template: EditableTemplate) => {
    const isSelected = template.id === selectedTemplateId;
    const editableFields = template.fields.filter(f => ['text', 'textarea', 'image', 'logo', 'qrcode', 'date'].includes(f.type));

    return (
      <HoverCard key={template.id} openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
              isSelected 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => onSelect(template)}
          >
            {/* Preview */}
            <div className="aspect-[4/3] relative flex items-center justify-center bg-muted/30 overflow-hidden">
              <TemplatePreviewRenderer template={template} width={200} />
              
              {/* Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1">
                {template.category === 'vendor-specific' && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    <Building2 className="h-3 w-3 mr-1" />
                    {template.vendorId}
                  </Badge>
                )}
                {template.isPremium && (
                  <Badge variant="default" className="text-[10px] h-5 bg-amber-500">
                    <Star className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-card">
              <h4 className="font-medium text-sm text-foreground truncate">{template.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{template.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-muted-foreground">
                  {template.dimensions.widthInches}" × {template.dimensions.heightInches}"
                </span>
                <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                  {template.colorMode}
                </span>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.div>
        </HoverCardTrigger>

        <HoverCardContent side="right" align="start" className="w-72 p-0">
          {/* Large preview */}
          <div className="flex items-center justify-center bg-muted/20 p-3 border-b border-border">
            <TemplatePreviewRenderer template={template} width={240} />
          </div>

          {/* Details */}
          <div className="p-3 space-y-2">
            <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
            <p className="text-xs text-muted-foreground">{template.description}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                {template.dimensions.widthInches}" × {template.dimensions.heightInches}"
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                {template.dpi} DPI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                {template.colorMode}
              </span>
            </div>

            {/* Editable fields list */}
            {editableFields.length > 0 && (
              <div className="pt-1">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Editable Fields ({editableFields.length})
                </p>
                <ScrollArea className="max-h-32">
                  <div className="space-y-0.5">
                    {editableFields.map(field => (
                      <div key={field.id} className="flex items-center gap-1.5 text-xs text-foreground py-0.5">
                        {fieldIcon(field.type)}
                        <span className="truncate">{field.name}</span>
                        {field.required && <span className="text-destructive text-[10px]">*</span>}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Tags */}
            {template.tags && template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {template.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-accent/50 text-accent-foreground rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Choose a Template</h3>
          <p className="text-sm text-muted-foreground">
            {templates.length} of {TEMPLATE_STATS.total} templates
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORY_CHIPS.map(chip => (
          <Button
            key={chip.id}
            size="sm"
            variant={activeCategory === chip.id ? 'default' : 'outline'}
            onClick={() => setActiveCategory(chip.id)}
            className="text-xs h-7 px-2.5 rounded-full"
          >
            {chip.id === 'all' && <Tag className="h-3 w-3 mr-1" />}
            {chip.label}
          </Button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All Templates</TabsTrigger>
          <TabsTrigger value="universal" className="flex-1">Universal</TabsTrigger>
          <TabsTrigger value="vendor" className="flex-1" disabled={!vendorId}>
            Vendor-Specific
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <Palette className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No templates found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map(renderTemplateCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateSelector;
