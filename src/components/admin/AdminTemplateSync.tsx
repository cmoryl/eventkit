// AdminTemplateSync - Sync codebase editable templates to the database
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Database, Loader2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ALL_EDITABLE_TEMPLATES, TEMPLATE_STATS } from '@/config/editableTemplates/allTemplates';

const AdminTemplateSync: React.FC = () => {
  const [syncing, setSyncing] = useState(false);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const { count, error } = await supabase
        .from('editable_templates')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      setDbCount(count ?? 0);

      const { data: latest } = await supabase
        .from('editable_templates')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest) setLastSync(latest.updated_at);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Send templates in chunks to avoid request size limits
      const chunkSize = 100;
      let totalSynced = 0;
      for (let i = 0; i < ALL_EDITABLE_TEMPLATES.length; i += chunkSize) {
        const chunk = ALL_EDITABLE_TEMPLATES.slice(i, i + chunkSize);
        const { data, error } = await supabase.functions.invoke('seed-editable-templates', {
          body: { templates: chunk },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Sync failed');
        totalSynced += data.synced;
        toast.info(`Synced ${totalSynced} / ${ALL_EDITABLE_TEMPLATES.length}`);
      }
      toast.success(`Successfully synced ${totalSynced} templates to the database`);
      await loadStats();
    } catch (err: any) {
      console.error('Sync error:', err);
      toast.error(err.message ?? 'Failed to sync templates');
    } finally {
      setSyncing(false);
    }
  };

  const inSync = dbCount === ALL_EDITABLE_TEMPLATES.length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Editable Templates Sync
          </CardTitle>
          <CardDescription>
            Persist the codebase template library to the database so designs survive code changes and load at runtime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <FileText className="w-4 h-4" /> In Codebase
              </div>
              <div className="text-3xl font-bold">{ALL_EDITABLE_TEMPLATES.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {TEMPLATE_STATS.universal} universal · {TEMPLATE_STATS.vendorSpecific} vendor
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Database className="w-4 h-4" /> In Database
              </div>
              <div className="text-3xl font-bold">
                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : (dbCount ?? 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {lastSync ? `Last update: ${new Date(lastSync).toLocaleString()}` : 'No sync yet'}
              </div>
            </div>

            <div className="p-4 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                Status
              </div>
              <div className="mt-2">
                {loading ? (
                  <Badge variant="outline">Checking…</Badge>
                ) : inSync ? (
                  <Badge variant="secondary" className="border-primary/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> In Sync
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    {(dbCount ?? 0) === 0 ? 'Not Seeded' : `${ALL_EDITABLE_TEMPLATES.length - (dbCount ?? 0)} pending`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <div className="font-medium">Sync templates to database</div>
              <div className="text-sm text-muted-foreground mt-1">
                Upserts all {ALL_EDITABLE_TEMPLATES.length} templates by ID — safe to run anytime.
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadStats} disabled={loading || syncing}>
                <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={handleSync} disabled={syncing}>
                {syncing ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Syncing…</>
                ) : (
                  <><Database className="w-4 h-4 mr-1" /> Sync Now</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminTemplateSync;
