import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trash2, RefreshCw, Image as ImageIcon, Filter, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface GenRow {
  id: string;
  asset_type: string;
  prompt_used: string;
  result_image_url: string | null;
  render_engine: string | null;
  user_id: string;
  created_at: string;
}

const AdminModeration: React.FC = () => {
  const [rows, setRows] = useState<GenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    let q = supabase
      .from('ai_generations')
      .select('id, asset_type, prompt_used, result_image_url, render_engine, user_id, created_at')
      .order('created_at', { ascending: false })
      .limit(48);
    if (filter !== 'all') q = q.eq('asset_type', filter);
    const { data, error } = await q;
    if (error) {
      toast.error('Failed to load generations');
    } else {
      setRows(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRows(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const assetTypes = Array.from(new Set(rows.map((r) => r.asset_type))).sort();

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      const adminToken = sessionStorage.getItem('admin_token') || undefined;
      const { error } = await supabase.functions.invoke('admin-users', {
        body: { action: 'delete_generation', targetUserId: id, adminToken },
      });
      if (error) throw error;
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success('Generation removed');
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Content Moderation
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and remove generated assets across the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All asset types</SelectItem>
                {assetTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRows} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-1.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-sm text-muted-foreground">
            No generations to moderate.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rows.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
            >
              <Card className="overflow-hidden group">
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {r.result_image_url ? (
                    <img
                      src={r.result_image_url}
                      alt={r.asset_type}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 right-2 flex justify-between gap-1">
                    <Badge variant="secondary" className="text-[10px] backdrop-blur-md bg-background/70">
                      {r.asset_type}
                    </Badge>
                    {r.render_engine && (
                      <Badge variant="outline" className="text-[10px] backdrop-blur-md bg-background/70">
                        {r.render_engine}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="text-xs text-muted-foreground line-clamp-2 h-8">
                    {r.prompt_used || '—'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {r.result_image_url && (
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                          <a href={r.result_image_url} target="_blank" rel="noreferrer" aria-label="Open image">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            disabled={busyId === r.id}
                            aria-label="Delete generation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this generation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the row from ai_generations. The
                              underlying image file (if stored externally) is not deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground"
                              onClick={() => remove(r.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminModeration;
