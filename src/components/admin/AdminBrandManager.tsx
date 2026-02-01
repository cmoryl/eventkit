import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Palette, Trash2, Edit2, Check, X, Upload, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_default: boolean;
  created_at: string;
}

export const AdminBrandManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBrand, setNewBrand] = useState({ name: '', description: '' });

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
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

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('You must be logged in');
        return;
      }

      const { error } = await supabase.from('brands').insert({
        name: newBrand.name,
        description: newBrand.description || null,
        user_id: userData.user.id,
        is_default: brands.length === 0
      });

      if (error) throw error;

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
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Reset all defaults
      await supabase.from('brands').update({ is_default: false }).eq('user_id', userData.user.id);
      
      // Set new default
      await supabase.from('brands').update({ is_default: true }).eq('id', id);

      toast.success('Default brand updated');
      loadBrands();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default brand');
    }
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading brands...</div>;
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
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <span className="text-lg font-bold text-white">{brand.name.charAt(0)}</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{brand.name}</h3>
                  {brand.is_default && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">Default</span>
                  )}
                </div>
                {brand.description && (
                  <p className="text-sm text-muted-foreground truncate">{brand.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
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
    </div>
  );
};
