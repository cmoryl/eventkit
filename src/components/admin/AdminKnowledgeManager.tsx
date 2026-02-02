import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Search, Filter, Trash2, Eye, 
  TrendingUp, RefreshCw, Palette, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface KnowledgeItem {
  id: string;
  key: string;
  knowledge_type: string;
  category: string | null;
  value: unknown;
  confidence_score: number;
  success_rate: number;
  usage_count: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface BrandInfo {
  id: string;
  name: string;
  primary_color?: string;
  logo_url?: string;
}

const KNOWLEDGE_TYPES = [
  { id: 'all', label: 'All Types', icon: Brain },
  { id: 'brand_preference', label: 'Brand Preference', icon: Palette },
  { id: 'brief_preferences', label: 'Brief Preferences', icon: Sparkles },
  { id: 'style_preference', label: 'Style Preference', icon: Palette },
  { id: 'color_pattern', label: 'Color Pattern', icon: Palette },
  { id: 'layout_preference', label: 'Layout Preference', icon: Sparkles },
  { id: 'cultural_context', label: 'Cultural Context', icon: Brain },
  { id: 'asset_combination', label: 'Asset Combination', icon: Sparkles },
  { id: 'successful_prompt', label: 'Successful Prompt', icon: Sparkles },
];

// Extract brand ID from key like "brand_88d880e5-e3bf-46d7-b9a9-6039474f6d75"
const extractBrandId = (key: string): string | null => {
  const match = key.match(/^brand_([a-f0-9-]{36})$/i);
  return match ? match[1] : null;
};

const AdminKnowledgeManager: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [brands, setBrands] = useState<Map<string, BrandInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const fetchKnowledge = async () => {
    setIsLoading(true);
    try {
      // Fetch knowledge entries
      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from('ai_knowledge')
        .select('*')
        .order('usage_count', { ascending: false });

      if (knowledgeError) throw knowledgeError;
      
      // Collect all brand IDs from knowledge entries
      const brandIds = new Set<string>();
      (knowledgeData || []).forEach(item => {
        const brandId = extractBrandId(item.key);
        if (brandId) brandIds.add(brandId);
      });

      // Fetch brand details if we have brand IDs
      if (brandIds.size > 0) {
        const { data: brandsData, error: brandsError } = await supabase
          .from('brands')
          .select('id, name, logo_url')
          .in('id', Array.from(brandIds));

        if (!brandsError && brandsData) {
          // Also fetch brand styles for primary colors
          const { data: stylesData } = await supabase
            .from('brand_styles')
            .select('brand_id, primary_color')
            .in('brand_id', Array.from(brandIds));

          const brandsMap = new Map<string, BrandInfo>();
          brandsData.forEach(brand => {
            const style = stylesData?.find(s => s.brand_id === brand.id);
            brandsMap.set(brand.id, {
              id: brand.id,
              name: brand.name,
              logo_url: brand.logo_url || undefined,
              primary_color: style?.primary_color || undefined,
            });
          });
          setBrands(brandsMap);
        }
      }

      setKnowledge(knowledgeData || []);
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      toast.error('Failed to load AI knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    try {
      const { error } = await supabase
        .from('ai_knowledge')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Knowledge entry deleted');
      fetchKnowledge();
    } catch (error) {
      console.error('Error deleting knowledge:', error);
      toast.error('Failed to delete knowledge entry');
    }
  };

  // Get display name for a knowledge item
  const getDisplayName = (item: KnowledgeItem): { name: string; brand?: BrandInfo } => {
    const brandId = extractBrandId(item.key);
    if (brandId) {
      const brand = brands.get(brandId);
      if (brand) {
        return { name: brand.name, brand };
      }
      return { name: `Unknown Brand (${item.key.slice(0, 20)}...)` };
    }
    return { name: item.key };
  };

  const filteredKnowledge = useMemo(() => {
    return knowledge.filter(k => {
      const { name } = getDisplayName(k);
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (k.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || k.knowledge_type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [knowledge, searchQuery, filterType, brands]);

  const stats = useMemo(() => ({
    total: knowledge.length,
    global: knowledge.filter(k => !k.user_id).length,
    userSpecific: knowledge.filter(k => k.user_id).length,
    avgConfidence: knowledge.length > 0 
      ? (knowledge.reduce((sum, k) => sum + k.confidence_score, 0) / knowledge.length * 100).toFixed(0)
      : 0
  }), [knowledge]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">AI Knowledge Base</h2>
          <p className="text-muted-foreground">Learned patterns and preferences from generations</p>
        </div>
        
        <Button variant="outline" onClick={fetchKnowledge} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-primary">{stats.total}</p>
            <p className="text-sm text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.global}</p>
            <p className="text-sm text-muted-foreground">Global Knowledge</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">{stats.userSpecific}</p>
            <p className="text-sm text-muted-foreground">User-Specific</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">{stats.avgConfidence}%</p>
            <p className="text-sm text-muted-foreground">Avg Confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search knowledge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {KNOWLEDGE_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>
                <span className="flex items-center gap-2">
                  <type.icon className="w-3.5 h-3.5" />
                  {type.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Knowledge List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredKnowledge.length === 0 ? (
        <Card className="p-12 text-center">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No knowledge entries found</h3>
          <p className="text-muted-foreground">
            The AI brain learns from user interactions and generations
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredKnowledge.map((item, i) => {
            const { name, brand } = getDisplayName(item);
            const typeInfo = KNOWLEDGE_TYPES.find(t => t.id === item.knowledge_type);
            const TypeIcon = typeInfo?.icon || Brain;
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="group hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Brand Color Indicator or Type Icon */}
                        {brand ? (
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-border"
                            style={{ backgroundColor: brand.primary_color || '#6366f1' }}
                          >
                            {brand.logo_url ? (
                              <img 
                                src={brand.logo_url} 
                                alt={brand.name} 
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <Palette className="w-5 h-5 text-white" />
                            )}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-medium truncate">{name}</h4>
                            <Badge variant="outline" className="text-xs capitalize">
                              {typeInfo?.label || item.knowledge_type.replace(/_/g, ' ')}
                            </Badge>
                            {!item.user_id && (
                              <Badge className="text-xs bg-blue-500/20 text-blue-500 border-0">Global</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {(item.confidence_score * 100).toFixed(0)}% confidence
                            </span>
                            <span>Used {item.usage_count} time{item.usage_count !== 1 ? 's' : ''}</span>
                            {item.category && (
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Knowledge Entry Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (() => {
            const { name, brand } = getDisplayName(selectedItem);
            const typeInfo = KNOWLEDGE_TYPES.find(t => t.id === selectedItem.knowledge_type);
            
            return (
              <div className="space-y-4 py-4">
                {/* Brand Header if applicable */}
                {brand && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center border border-border shadow-sm"
                      style={{ backgroundColor: brand.primary_color || '#6366f1' }}
                    >
                      {brand.logo_url ? (
                        <img 
                          src={brand.logo_url} 
                          alt={brand.name} 
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Palette className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{brand.name}</h3>
                      <p className="text-sm text-muted-foreground">Brand Preference Entry</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {brand ? 'Brand' : 'Key'}
                    </label>
                    <p className={brand ? 'font-medium' : 'font-mono text-sm'}>{name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <p className="capitalize">{typeInfo?.label || selectedItem.knowledge_type.replace(/_/g, ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-500 to-green-500 rounded-full transition-all"
                          style={{ width: `${selectedItem.confidence_score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{(selectedItem.confidence_score * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Success Rate</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all"
                          style={{ width: `${selectedItem.success_rate * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{(selectedItem.success_rate * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Usage Count</label>
                    <p className="font-medium">{selectedItem.usage_count} time{selectedItem.usage_count !== 1 ? 's' : ''}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scope</label>
                    <Badge variant={selectedItem.user_id ? 'secondary' : 'default'} className="mt-1">
                      {selectedItem.user_id ? 'User-specific' : 'Global'}
                    </Badge>
                  </div>
                  {selectedItem.category && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Category</label>
                      <p>{selectedItem.category}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Learned Value</label>
                  <pre className="mt-1 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-64 font-mono">
                    {JSON.stringify(selectedItem.value, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span>Created: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                  <span>Updated: {new Date(selectedItem.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKnowledgeManager;
