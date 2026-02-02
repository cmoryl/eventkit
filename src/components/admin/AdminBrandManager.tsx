import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Palette, Trash2, Check, X, Star, AlertCircle, Edit, Settings, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { BrandStyleEditor } from './BrandStyleEditor';

interface BrandStyle {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_default: boolean;
  created_at: string;
  brandhub_share_token?: string;
  brandhub_last_synced?: string;
  brandhub_auto_sync?: boolean;
  brand_styles?: BrandStyle[];
}

export const AdminBrandManager: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadBrands();
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  const loadBrands = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*, brand_styles(primary_color, secondary_color, accent_color)')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  const createBrand = async () => {
    if (!newBrand.name.trim()) {
      toast.error('Brand name is required');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to create a brand');
      return;
    }

    try {
      const { data, error } = await supabase.from('brands').insert({
        name: newBrand.name.trim(),
        description: newBrand.description?.trim() || null,
        user_id: user.id,
        is_default: brands.length === 0
      }).select();

      if (error) {
        console.error('Brand creation error:', error);
        if (error.message.includes('row-level security')) {
          toast.error('Permission denied. Please ensure you are logged in.');
        } else {
          toast.error(`Failed to create brand: ${error.message}`);
        }
        return;
      }

      toast.success('Brand created successfully');
      setNewBrand({ name: '', description: '' });
      setIsCreating(false);
      loadBrands();
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Failed to create brand');
    }
  };

  const deleteBrand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;

      toast.success('Brand deleted');
      loadBrands();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Failed to delete brand');
    }
  };

  const setDefaultBrand = async (id: string) => {
    if (!user) return;

    try {
      // Reset all defaults
      await supabase.from('brands').update({ is_default: false }).eq('user_id', user.id);
      
      // Set new default
      await supabase.from('brands').update({ is_default: true }).eq('id', id);

      toast.success('Default brand updated');
      loadBrands();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default brand');
    }
  };

  if (authLoading || isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading brands...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-3" />
        <p className="text-muted-foreground">You must be logged in to manage brands</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Brand Profiles</h2>
          <p className="text-sm text-muted-foreground">Manage your brand identities for asset generation</p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="w-4 h-4 mr-2" />
          New Brand
        </Button>
      </div>

      {/* Create New Brand Form */}
      {isCreating && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-primary bg-primary/5"
        >
          <h3 className="font-semibold mb-3">Create New Brand</h3>
          <div className="space-y-3">
            <Input
              placeholder="Brand name"
              value={newBrand.name}
              onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
            />
            <Textarea
              placeholder="Description (optional)"
              value={newBrand.description}
              onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
            <div className="flex gap-2">
              <Button onClick={createBrand} size="sm">
                <Check className="w-4 h-4 mr-1" />
                Create
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Brand List */}
      <div className="grid gap-4">
        {brands.length === 0 ? (
          <div className="text-center py-12 border border-dashed rounded-xl">
            <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No brands created yet</p>
            <Button variant="link" onClick={() => setIsCreating(true)}>
              Create your first brand
            </Button>
          </div>
        ) : (
          brands.map((brand) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/50 transition-all"
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{
                  background: brand.brand_styles?.[0]?.primary_color 
                    ? `linear-gradient(135deg, ${brand.brand_styles[0].primary_color}, ${brand.brand_styles[0].accent_color || brand.brand_styles[0].secondary_color || brand.brand_styles[0].primary_color})`
                    : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                }}
              >
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-white">{brand.name.charAt(0)}</span>
                )}
              </div>

              {/* Color Bar */}
              {brand.brand_styles?.[0] && (brand.brand_styles[0].primary_color || brand.brand_styles[0].secondary_color || brand.brand_styles[0].accent_color) && (
                <div className="flex gap-1 flex-shrink-0">
                  {brand.brand_styles[0].primary_color && (
                    <div 
                      className="w-4 h-8 rounded-sm border border-border" 
                      style={{ backgroundColor: brand.brand_styles[0].primary_color }}
                      title="Primary"
                    />
                  )}
                  {brand.brand_styles[0].secondary_color && (
                    <div 
                      className="w-4 h-8 rounded-sm border border-border" 
                      style={{ backgroundColor: brand.brand_styles[0].secondary_color }}
                      title="Secondary"
                    />
                  )}
                  {brand.brand_styles[0].accent_color && (
                    <div 
                      className="w-4 h-8 rounded-sm border border-border" 
                      style={{ backgroundColor: brand.brand_styles[0].accent_color }}
                      title="Accent"
                    />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{brand.name}</h3>
                  {brand.is_default && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Default</span>
                  )}
                  {brand.brandhub_share_token && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-500 flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      Linked
                    </span>
                  )}
                </div>
                {brand.description && (
                  <p className="text-sm text-muted-foreground truncate">{brand.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setEditingBrand(brand)} 
                  title="Edit brand style"
                >
                  <Settings className="w-4 h-4 text-primary" />
                </Button>
                {!brand.is_default && (
                  <Button variant="ghost" size="icon" onClick={() => setDefaultBrand(brand.id)} title="Set as default">
                    <Star className="w-4 h-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => deleteBrand(brand.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Brand Style Editor Modal */}
      <AnimatePresence>
        {editingBrand && (
          <BrandStyleEditor
            brand={editingBrand}
            onClose={() => setEditingBrand(null)}
            onSave={() => {
              setEditingBrand(null);
              loadBrands();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
