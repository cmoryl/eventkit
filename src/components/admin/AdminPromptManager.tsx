import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Save, X, Sparkles, 
  Copy, CheckCircle2, AlertCircle, Search, Filter,
  Database, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  template_name: string;
  asset_type: string;
  prompt_template: string;
  is_system: boolean;
  usage_count: number;
  success_rate: number;
  variables: string[];
  created_at: string;
  updated_at: string;
}

const ASSET_TYPES = [
  'banner', 'badge', 'ticket', 'flyer', 'poster', 'social_media',
  'business_card', 'invitation', 'program', 'signage', 'merchandise',
  'email_header', 'presentation', 'certificate', 'menu', 'backdrop'
];

const AdminPromptManager: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    template_name: '',
    asset_type: '',
    prompt_template: '',
    variables: ''
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('prompt_templates')
        .select('*')
        .order('asset_type', { ascending: true });

      if (error) throw error;
      
      setTemplates((data || []).map(t => ({
        ...t,
        is_system: t.is_system ?? false,
        usage_count: t.usage_count ?? 0,
        success_rate: t.success_rate ?? 0.5,
        variables: Array.isArray(t.variables) 
          ? (t.variables as unknown[]).map(v => String(v))
          : []
      })));
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load prompt templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      template_name: '',
      asset_type: '',
      prompt_template: '',
      variables: ''
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      asset_type: template.asset_type,
      prompt_template: template.prompt_template,
      variables: template.variables.join(', ')
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.template_name || !formData.asset_type || !formData.prompt_template) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const variablesArray = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);

      if (editingTemplate) {
        // Update existing
        const { error } = await supabase
          .from('prompt_templates')
          .update({
            template_name: formData.template_name,
            asset_type: formData.asset_type,
            prompt_template: formData.prompt_template,
            variables: variablesArray,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;
        toast.success('Template updated successfully');
      } else {
        // Create new - need user_id for RLS
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('You must be logged in to create templates');
          return;
        }
        
        const { error } = await supabase
          .from('prompt_templates')
          .insert({
            template_name: formData.template_name,
            asset_type: formData.asset_type,
            prompt_template: formData.prompt_template,
            variables: variablesArray,
            is_system: true,
            created_by: user.id
          });

        if (error) throw error;
        toast.success('Template created successfully');
      }

      setIsDialogOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('prompt_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleRefineWithAI = async () => {
    if (!formData.prompt_template) {
      toast.error('Enter a prompt to refine');
      return;
    }

    setIsRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke('refine-prompt', {
        body: {
          prompt: formData.prompt_template,
          asset_type: formData.asset_type,
          context: 'event design asset generation'
        }
      });

      if (error) throw error;

      if (data?.refined_prompt) {
        setFormData(prev => ({
          ...prev,
          prompt_template: data.refined_prompt
        }));
        toast.success('Prompt refined by AI');
      }
    } catch (error) {
      console.error('Error refining prompt:', error);
      toast.error('Failed to refine prompt');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSeedTemplates = async () => {
    if (!confirm('This will add 70+ default prompt templates for all asset types. Continue?')) {
      return;
    }

    setIsSeeding(true);
    try {
      const { data, error } = await supabase.functions.invoke('seed-prompt-templates', {
        body: { action: 'seed' }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${data.message}`, {
          description: `Inserted: ${data.inserted}, Skipped: ${data.skipped || 0}`
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error seeding templates:', error);
      toast.error('Failed to seed templates');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.prompt_template.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || t.asset_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedTemplates = filteredTemplates.reduce((acc, t) => {
    if (!acc[t.asset_type]) acc[t.asset_type] = [];
    acc[t.asset_type].push(t);
    return acc;
  }, {} as Record<string, PromptTemplate[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Prompt Templates</h2>
          <p className="text-muted-foreground">Manage system prompts for asset generation</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSeedTemplates}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Database className="w-4 h-4 mr-2" />
            )}
            {isSeeding ? 'Seeding...' : 'Seed Defaults'}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input
                    placeholder="e.g., Modern Banner Style"
                    value={formData.template_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Asset Type</label>
                  <Select 
                    value={formData.asset_type} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, asset_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSET_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Prompt Template</label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefineWithAI}
                    disabled={isRefining}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isRefining ? 'Refining...' : 'Refine with AI'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Enter your prompt template. Use {{variable}} for dynamic values."
                  value={formData.prompt_template}
                  onChange={(e) => setFormData(prev => ({ ...prev, prompt_template: e.target.value }))}
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Use {'{{eventName}}'}, {'{{colors}}'}, {'{{style}}'} etc. for dynamic values
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Variables (comma-separated)</label>
                <Input
                  placeholder="eventName, colors, style, location"
                  value={formData.variables}
                  onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {ASSET_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : Object.keys(groupedTemplates).length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || filterType !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first prompt template to get started'}
          </p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
            <div key={type}>
              <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
                {type.replace('_', ' ')}
                <Badge variant="secondary">{typeTemplates.length}</Badge>
              </h3>
              <div className="grid gap-4">
                {typeTemplates.map((template, i) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className="group hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold truncate">{template.template_name}</h4>
                              {template.is_system && (
                                <Badge variant="outline" className="text-xs">System</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 font-mono mb-3">
                              {template.prompt_template}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                {(template.success_rate * 100).toFixed(0)}% success
                              </span>
                              <span>Used {template.usage_count} times</span>
                              {template.variables.length > 0 && (
                                <span>{template.variables.length} variables</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                navigator.clipboard.writeText(template.prompt_template);
                                toast.success('Copied to clipboard');
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDelete(template.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPromptManager;
