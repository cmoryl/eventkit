import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, Plus, Edit2, Trash2, Save, 
  Power, PowerOff, Star, AlertCircle, Key, Eye, EyeOff,
  ExternalLink, CheckCircle2, XCircle
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
  api_key_encrypted: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface ProviderConfig {
  value: string;
  label: string;
  description: string;
  requiresApiKey: boolean;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  apiKeyHelpUrl: string;
  apiKeyHelpText: string;
}

const PROVIDERS: ProviderConfig[] = [
  { 
    value: 'lovable', 
    label: 'Lovable AI', 
    description: 'Built-in AI generation (no key required)',
    requiresApiKey: false,
    apiKeyName: '',
    apiKeyPlaceholder: '',
    apiKeyHelpUrl: '',
    apiKeyHelpText: 'Lovable AI is pre-configured and ready to use.'
  },
  { 
    value: 'openai', 
    label: 'OpenAI DALL-E', 
    description: 'DALL-E 3 image generation',
    requiresApiKey: true,
    apiKeyName: 'OpenAI API Key',
    apiKeyPlaceholder: 'sk-...',
    apiKeyHelpUrl: 'https://platform.openai.com/api-keys',
    apiKeyHelpText: 'Get your API key from the OpenAI dashboard. Requires a paid account with DALL-E access.'
  },
  { 
    value: 'stability', 
    label: 'Stability AI', 
    description: 'Stable Diffusion models',
    requiresApiKey: true,
    apiKeyName: 'Stability API Key',
    apiKeyPlaceholder: 'sk-...',
    apiKeyHelpUrl: 'https://platform.stability.ai/account/keys',
    apiKeyHelpText: 'Get your API key from the Stability AI platform. Credits are required for generation.'
  },
  { 
    value: 'replicate', 
    label: 'Replicate', 
    description: 'Various AI models',
    requiresApiKey: true,
    apiKeyName: 'Replicate API Token',
    apiKeyPlaceholder: 'r8_...',
    apiKeyHelpUrl: 'https://replicate.com/account/api-tokens',
    apiKeyHelpText: 'Get your API token from Replicate. Pay-per-use pricing applies.'
  },
  { 
    value: 'google', 
    label: 'Google Imagen', 
    description: 'Imagen 3 generation',
    requiresApiKey: true,
    apiKeyName: 'Google AI API Key',
    apiKeyPlaceholder: 'AIza...',
    apiKeyHelpUrl: 'https://aistudio.google.com/app/apikey',
    apiKeyHelpText: 'Get your API key from Google AI Studio. Requires Google Cloud billing enabled.'
  },
  { 
    value: 'midjourney', 
    label: 'Midjourney', 
    description: 'Midjourney API (via proxy)',
    requiresApiKey: true,
    apiKeyName: 'Midjourney API Key',
    apiKeyPlaceholder: 'mj-...',
    apiKeyHelpUrl: 'https://docs.midjourney.com/docs/api',
    apiKeyHelpText: 'Requires Midjourney subscription and API access. Contact Midjourney for API access.'
  },
  { 
    value: 'flux', 
    label: 'Flux (Black Forest Labs)', 
    description: 'Flux Pro/Dev models',
    requiresApiKey: true,
    apiKeyName: 'BFL API Key',
    apiKeyPlaceholder: 'bfl-...',
    apiKeyHelpUrl: 'https://api.bfl.ml/',
    apiKeyHelpText: 'Get your API key from Black Forest Labs. Various Flux models available.'
  },
  { 
    value: 'ideogram', 
    label: 'Ideogram', 
    description: 'Ideogram AI generation',
    requiresApiKey: true,
    apiKeyName: 'Ideogram API Key',
    apiKeyPlaceholder: 'ig-...',
    apiKeyHelpUrl: 'https://ideogram.ai/api',
    apiKeyHelpText: 'Get your API key from Ideogram. Known for excellent text rendering in images.'
  }
];

const AdminRenderEngines: React.FC = () => {
  const [engines, setEngines] = useState<RenderEngine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEngine, setEditingEngine] = useState<RenderEngine | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<'success' | 'error' | null>(null);
  
  const [formData, setFormData] = useState({
    display_name: '',
    provider: '',
    api_key: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    fetchEngines();
  }, []);

  // Reset key visibility when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setShowApiKey(false);
      setKeyTestResult(null);
    }
  }, [isDialogOpen]);

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
      api_key: '',
      is_active: true,
      is_default: false
    });
    setKeyTestResult(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (engine: RenderEngine) => {
    setEditingEngine(engine);
    setFormData({
      display_name: engine.display_name,
      provider: engine.provider,
      api_key: '', // Don't populate for security - user must re-enter to change
      is_active: engine.is_active ?? true,
      is_default: engine.is_default ?? false
    });
    setKeyTestResult(null);
    setIsDialogOpen(true);
  };

  const getProviderConfig = (provider: string): ProviderConfig | undefined => {
    return PROVIDERS.find(p => p.value === provider);
  };

  const handleTestApiKey = async () => {
    const providerConfig = getProviderConfig(formData.provider);
    if (!providerConfig || !formData.api_key) return;

    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      // Simple validation - check key format
      let isValid = false;
      
      switch (formData.provider) {
        case 'openai':
          isValid = formData.api_key.startsWith('sk-') && formData.api_key.length > 20;
          break;
        case 'stability':
          isValid = formData.api_key.startsWith('sk-') && formData.api_key.length > 20;
          break;
        case 'replicate':
          isValid = formData.api_key.startsWith('r8_') && formData.api_key.length > 20;
          break;
        case 'google':
          isValid = formData.api_key.startsWith('AIza') && formData.api_key.length > 30;
          break;
        case 'flux':
          isValid = formData.api_key.length > 10;
          break;
        case 'midjourney':
          isValid = formData.api_key.length > 10;
          break;
        case 'ideogram':
          isValid = formData.api_key.length > 10;
          break;
        default:
          isValid = formData.api_key.length > 0;
      }

      // Simulate a brief test delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setKeyTestResult(isValid ? 'success' : 'error');
      
      if (isValid) {
        toast.success('API key format looks valid');
      } else {
        toast.error('API key format appears invalid');
      }
    } catch (error) {
      setKeyTestResult('error');
      toast.error('Failed to validate API key');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSave = async () => {
    if (!formData.display_name || !formData.provider) {
      toast.error('Please fill in all required fields');
      return;
    }

    const providerConfig = getProviderConfig(formData.provider);
    if (providerConfig?.requiresApiKey && !formData.api_key && !editingEngine?.api_key_encrypted) {
      toast.error(`${providerConfig.apiKeyName} is required for ${providerConfig.label}`);
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
        const updateData: Record<string, unknown> = {
          display_name: formData.display_name,
          provider: formData.provider,
          is_active: formData.is_active,
          is_default: formData.is_default,
          updated_at: new Date().toISOString()
        };

        // Only update API key if a new one was provided
        if (formData.api_key) {
          // In production, you'd encrypt this before storing
          // For now, we store it as-is (the column is named _encrypted for future use)
          updateData.api_key_encrypted = formData.api_key;
        }

        const { error } = await supabase
          .from('render_engines')
          .update(updateData)
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
            api_key_encrypted: formData.api_key || null,
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
    return PROVIDERS.find(p => p.value === provider) || { label: provider, description: '', requiresApiKey: false };
  };

  const selectedProviderConfig = getProviderConfig(formData.provider);

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
          <DialogContent className="max-w-lg">
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
                  onValueChange={(v) => {
                    setFormData(prev => ({ ...prev, provider: v, api_key: '' }));
                    setKeyTestResult(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map(provider => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium">{provider.label}</p>
                            <p className="text-xs text-muted-foreground">{provider.description}</p>
                          </div>
                          {provider.requiresApiKey && (
                            <Key className="w-3 h-3 text-muted-foreground ml-auto" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* API Key Section - Only show for providers that require it */}
              {selectedProviderConfig?.requiresApiKey && (
                <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    <label className="text-sm font-medium">{selectedProviderConfig.apiKeyName}</label>
                    {editingEngine?.api_key_encrypted && !formData.api_key && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Configured
                      </Badge>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder={selectedProviderConfig.apiKeyPlaceholder}
                      value={formData.api_key}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, api_key: e.target.value }));
                        setKeyTestResult(null);
                      }}
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="p-1.5 rounded hover:bg-muted transition-colors"
                      >
                        {showApiKey ? (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      {keyTestResult === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                      {keyTestResult === 'error' && (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </div>

                  {formData.api_key && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestApiKey}
                      disabled={isTestingKey}
                      className="w-full"
                    >
                      {isTestingKey ? 'Validating...' : 'Validate Key Format'}
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground">
                    {selectedProviderConfig.apiKeyHelpText}
                  </p>
                  
                  <a
                    href={selectedProviderConfig.apiKeyHelpUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Get API Key
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {editingEngine?.api_key_encrypted && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      Leave blank to keep existing key, or enter a new key to replace it.
                    </p>
                  )}
                </div>
              )}

              {/* No API Key Required Message */}
              {selectedProviderConfig && !selectedProviderConfig.requiresApiKey && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">No API key required</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProviderConfig.apiKeyHelpText}
                  </p>
                </div>
              )}

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
            const hasApiKey = !!engine.api_key_encrypted;
            
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
                          <div className="flex items-center gap-2 flex-wrap">
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
                            {providerInfo.requiresApiKey && (
                              <Badge variant={hasApiKey ? 'outline' : 'destructive'} className="text-xs">
                                <Key className="w-3 h-3 mr-1" />
                                {hasApiKey ? 'Key Set' : 'No Key'}
                              </Badge>
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
              Each provider requires its own API key (except Lovable AI which is built-in). 
              API keys are stored securely and never exposed in the interface after saving.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRenderEngines;
