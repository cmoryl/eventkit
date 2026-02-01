import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, Search, Filter, Trash2, Eye, 
  TrendingUp, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

const KNOWLEDGE_TYPES = [
  'style_preference',
  'color_pattern',
  'layout_preference',
  'cultural_context',
  'asset_combination',
  'successful_prompt'
];

const AdminKnowledgeManager: React.FC = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
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
      const { data, error } = await supabase
        .from('ai_knowledge')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setKnowledge(data || []);
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

  const filteredKnowledge = knowledge.filter(k => {
    const matchesSearch = k.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (k.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || k.knowledge_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: knowledge.length,
    global: knowledge.filter(k => !k.user_id).length,
    userSpecific: knowledge.filter(k => k.user_id).length,
    avgConfidence: knowledge.length > 0 
      ? (knowledge.reduce((sum, k) => sum + k.confidence_score, 0) / knowledge.length * 100).toFixed(0)
      : 0
  };

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
            <SelectItem value="all">All Types</SelectItem>
            {KNOWLEDGE_TYPES.map(type => (
              <SelectItem key={type} value={type}>
                {type.replace('_', ' ')}
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
          {filteredKnowledge.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{item.key}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.knowledge_type.replace('_', ' ')}
                        </Badge>
                        {!item.user_id && (
                          <Badge className="text-xs bg-blue-500/20 text-blue-500">Global</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {(item.confidence_score * 100).toFixed(0)}% confidence
                        </span>
                        <span>Used {item.usage_count} times</span>
                        {item.category && <span>Category: {item.category}</span>}
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
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Knowledge Entry Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key</label>
                  <p className="font-mono">{selectedItem.key}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <p className="capitalize">{selectedItem.knowledge_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                  <p>{(selectedItem.confidence_score * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Success Rate</label>
                  <p>{(selectedItem.success_rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usage Count</label>
                  <p>{selectedItem.usage_count}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scope</label>
                  <p>{selectedItem.user_id ? 'User-specific' : 'Global'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Value</label>
                <pre className="mt-1 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-64">
                  {JSON.stringify(selectedItem.value, null, 2)}
                </pre>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Created: {new Date(selectedItem.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(selectedItem.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKnowledgeManager;
