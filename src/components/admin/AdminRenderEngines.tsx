import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Plus, Edit2, Trash2, Save, 
  Power, PowerOff, Star, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RenderEngine {
  id: string;
  display_name: string;
  provider: string;
  is_active: boolean | null;
  is_default: boolean | null;
  config: unknown;
  user_id: string;
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  { value: 'lovable', label: 'Lovable AI', description: 'Built-in AI generation' },
  { value: 'openai', label: 'OpenAI DALL-E', description: 'DALL-E 3 image generation' },
  { value: 'stability', label: 'Stability AI', description: 'Stable Diffusion models' },
  { value: 'replicate', label: 'Replicate', description: 'Various AI models' },
  { value: 'google', label: 'Google Imagen', description: 'Imagen 3 generation' }
];

const AdminRenderEngines: React.FC = () => {
  const [engines, setEngines] = useState<RenderEngine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<RenderEngine | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: '',
    provider: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchEngines();
  }, []);

  const fetchEngines = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('render_engines')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setEngines((data || []) as RenderEngine[]);
    } catch (error) {
      console.error('Error fetching engines:', error);
      toast.error('Failed to load render engines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEngine(null);
    setFormData({
      display_name: '',
      provider: '',
      is_active: true,
      is_default: false
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (engine: RenderEngine) => {
    setEditingEngine(engine);
    setFormData({
      display_name: engine.display_name,
      provider: engine.provider,
      is_active: engine.is_active,
      is_default: engine.is_default
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.display_name || !formData.provider) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // If setting as default, unset other defaults first
      if (formData.is_default) {
        await supabase
          .from('render_engines')
          .update({ is_default: false })
          .neq('id', editingEngine?.id || '');
      }

      if (editingEngine) {
        const { error } = await supabase
          .from('render_engines')
          .update({
            display_name: formData.display_name,
            provider: formData.provider,
            is_active: formData.is_active,
            is_default: formData.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingEngine.id);

        if (error) throw error;
        toast.success('Engine updated successfully');
      } else {
        // Get current user for user_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to create engines');
          return;
        }
        
        const { error } = await supabase
          .from('render_engines')
          .insert({
            display_name: formData.display_name,
            provider: formData.provider,
            is_active: formData.is_active,
            is_default: formData.is_default,
            config: {},
            user_id: user.id
          });

        if (error) throw error;
        toast.success('Engine created successfully');
      }

      setIsDialogOpen(false);
      fetchEngines();
    } catch (error) {
      console.error('Error saving engine:', error);
      toast.error('Failed to save engine');
    }
  };

  const handleToggleActive = async (engine: RenderEngine) => {
    try {
      const { error } = await supabase
        .from('render_engines')
        .update({ 
          is_active: !engine.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', engine.id);

      if (error) throw error;
      
      toast.success(`Engine ${engine.is_active ? 'disabled' : 'enabled'}`);
      fetchEngines();
    } catch (error) {
      console.error('Error toggling engine:', error);
      toast.error('Failed to update engine');
    }
  };

  const handleSetDefault = async (engine: RenderEngine) => {
    try {
      // Unset all defaults
      await supabase
        .from('render_engines')
        .update({ is_default: false })
        .neq('id', engine.id);
      
      // Set this one as default
      const { error } = await supabase
        .from('render_engines')
        .update({ 
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', engine.id);

      if (error) throw error;
      
      toast.success(`${engine.display_name} set as default`);
      fetchEngines();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to set default engine');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this render engine?')) return;

    try {
      const { error } = await supabase
        .from('render_engines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Engine deleted');
      fetchEngines();
    } catch (error) {
      console.error('Error deleting engine:', error);
      toast.error('Failed to delete engine');
    }
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find(p => p.value === provider) || { label: provider, description: '' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Render Engines</h2>
          <p className="text-muted-foreground">Configure AI generation providers and settings</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Add Engine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingEngine ? 'Edit Render Engine' : 'Add New Render Engine'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  placeholder="e.g., Fast Preview"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Provider</label>
                <Select 
                  value={formData.provider}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, provider: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(provider => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <p className="font-medium">{provider.label}</p>
                          <p className="text-xs text-muted-foreground">{provider.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Active</p>
                  <p className="text-sm text-muted-foreground">Enable this engine for use</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_active: v }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Set as Default</p>
                  <p className="text-sm text-muted-foreground">Use for all new generations</p>
                </div>
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, is_default: v }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Engine
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Engines List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : engines.length === 0 ? (
        <Card className="p-12 text-center">
          <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No render engines configured</h3>
          <p className="text-muted-foreground mb-4">
            Add render engines to enable asset generation
          </p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Engine
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {engines.map((engine, i) => {
            const providerInfo = getProviderInfo(engine.provider);
            return (
              <motion.div
                key={engine.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`group transition-all ${engine.is_default ? 'border-primary' : ''} ${!engine.is_active ? 'opacity-60' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${engine.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                          {engine.is_active ? (
                            <Power className="w-6 h-6 text-primary" />
                          ) : (
                            <PowerOff className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{engine.display_name}</h4>
                            {engine.is_default && (
                              <Badge className="bg-primary/20 text-primary">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                            {!engine.is_active && (
                              <Badge variant="secondary">Disabled</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {providerInfo.label} — {providerInfo.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleActive(engine)}
                        >
                          {engine.is_active ? 'Disable' : 'Enable'}
                        </Button>
                        {!engine.is_default && engine.is_active && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetDefault(engine)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(engine)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(engine.id)}
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

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">About Render Engines</p>
            <p>
              Render engines determine which AI provider is used to generate assets. 
              Users can select their preferred engine when generating, or use the default. 
              Some engines require API keys to be configured in your user settings.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRenderEngines;
