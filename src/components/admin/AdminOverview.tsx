import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, FolderKanban, Image as ImageIcon, Sparkles, Activity, AlertTriangle,
  CheckCircle2, Clock, Zap, TrendingUp, Database, Brain, Layers, Palette,
  ArrowUpRight, Server, ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface OverviewStats {
  users: number;
  newUsers7d: number;
  projects: number;
  newProjects7d: number;
  generations: number;
  generations7d: number;
  generations24h: number;
  knowledgeRows: number;
  templates: number;
  brands: number;
  feedbackAvg: number | null;
  feedbackCount: number;
  queueSuccess: number;
  queueFail: number;
  queueAvgMs: number;
  recentEvents: Array<{ id: string; type: string; label: string; ts: string }>;
  health: Array<{ name: string; status: 'ok' | 'warn' | 'down'; detail: string }>;
}

interface Props {
  onNavigate: (tab: string) => void;
}

const AdminOverview: React.FC<Props> = ({ onNavigate }) => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const since7d = new Date(Date.now() - 7 * 86400000).toISOString();
      const since24h = new Date(Date.now() - 86400000).toISOString();

      const [
        users, projects, gens, gens7d, gens24h, newProjects7d,
        knowledge, templates, brands, feedback, queue,
        recentGens, recentProjects,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('ai_generations').select('id', { count: 'exact', head: true }),
        supabase.from('ai_generations').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
        supabase.from('ai_generations').select('id', { count: 'exact', head: true }).gte('created_at', since24h),
        supabase.from('projects').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
        supabase.from('ai_knowledge').select('id', { count: 'exact', head: true }),
        supabase.from('editable_templates').select('id', { count: 'exact', head: true }),
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('ai_feedback').select('rating'),
        supabase.from('queue_analytics').select('status, duration_ms').gte('created_at', since7d),
        supabase.from('ai_generations').select('id, asset_type, created_at, render_engine').order('created_at', { ascending: false }).limit(5),
        supabase.from('projects').select('id, name, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      // newUsers7d via profiles created_at
      const { count: newUsers7d } = await supabase
        .from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since7d);

      // Feedback aggregates
      const ratings = (feedback.data || []).map((f) => f.rating).filter((r): r is number => typeof r === 'number');
      const feedbackAvg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

      // Queue stats
      const queueRows = queue.data || [];
      const queueSuccess = queueRows.filter((q) => q.status === 'success' || q.status === 'completed').length;
      const queueFail = queueRows.filter((q) => q.status === 'failed' || q.status === 'error').length;
      const durations = queueRows.map((q) => q.duration_ms).filter((d): d is number => typeof d === 'number' && d > 0);
      const queueAvgMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

      // Health checks (lightweight: did each query succeed?)
      const health: OverviewStats['health'] = [
        { name: 'Database', status: users.error ? 'down' : 'ok', detail: users.error ? 'Query failed' : 'Reachable' },
        { name: 'Generations API', status: gens.error ? 'warn' : 'ok', detail: gens.error ? 'Read error' : 'OK' },
        { name: 'Queue Pipeline', status: queueFail > queueSuccess && queueRows.length > 5 ? 'warn' : 'ok', detail: `${queueSuccess}✓ / ${queueFail}✗ (7d)` },
        { name: 'Storage', status: 'ok', detail: 'asset-images, print-templates' },
      ];

      // Recent events feed
      const recentEvents: OverviewStats['recentEvents'] = [
        ...(recentGens.data || []).map((g) => ({
          id: `g-${g.id}`,
          type: 'generation',
          label: `${g.asset_type || 'asset'} via ${g.render_engine || 'lovable'}`,
          ts: g.created_at,
        })),
        ...(recentProjects.data || []).map((p) => ({
          id: `p-${p.id}`,
          type: 'project',
          label: `Project "${p.name}" created`,
          ts: p.created_at,
        })),
      ].sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()).slice(0, 8);

      if (!mounted) return;
      setStats({
        users: users.count || 0,
        newUsers7d: newUsers7d || 0,
        projects: projects.count || 0,
        newProjects7d: newProjects7d.count || 0,
        generations: gens.count || 0,
        generations7d: gens7d.count || 0,
        generations24h: gens24h.count || 0,
        knowledgeRows: knowledge.count || 0,
        templates: templates.count || 0,
        brands: brands.count || 0,
        feedbackAvg,
        feedbackCount: ratings.length,
        queueSuccess,
        queueFail,
        queueAvgMs,
        recentEvents,
        health,
      });
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  const queueTotal = stats.queueSuccess + stats.queueFail;
  const queueRate = queueTotal ? Math.round((stats.queueSuccess / queueTotal) * 100) : 100;

  // Rough cost estimate: assume 1 generation ≈ $0.005 avg blended (Gemini Flash)
  const estCost7d = (stats.generations7d * 0.005).toFixed(2);
  const estCostMonth = (stats.generations7d * 0.005 * 4.3).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Operations Overview
          </h2>
          <p className="text-sm text-muted-foreground">Real-time snapshot of platform health and usage</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => onNavigate('analytics')}>
            <TrendingUp className="w-4 h-4 mr-1.5" /> Full Analytics
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('users')}>
            <Users className="w-4 h-4 mr-1.5" /> Manage Users
          </Button>
          <Button size="sm" variant="outline" onClick={() => onNavigate('moderation')}>
            <ShieldCheck className="w-4 h-4 mr-1.5" /> Moderation
          </Button>
        </div>
      </div>

      {/* Hero KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users} title="Total Users" value={stats.users}
          delta={stats.newUsers7d} deltaLabel="new this week"
          gradient="from-violet-500/20 to-purple-500/5"
          onClick={() => onNavigate('users')}
        />
        <KpiCard
          icon={FolderKanban} title="Projects" value={stats.projects}
          delta={stats.newProjects7d} deltaLabel="created this week"
          gradient="from-blue-500/20 to-cyan-500/5"
        />
        <KpiCard
          icon={ImageIcon} title="Generations" value={stats.generations}
          delta={stats.generations24h} deltaLabel="last 24h"
          gradient="from-emerald-500/20 to-teal-500/5"
          onClick={() => onNavigate('analytics')}
        />
        <KpiCard
          icon={Zap} title="Queue Success" value={`${queueRate}%`}
          delta={stats.queueAvgMs ? Math.round(stats.queueAvgMs / 1000) : 0}
          deltaLabel="avg seconds"
          gradient="from-amber-500/20 to-orange-500/5"
          accent={queueRate < 80 ? 'warn' : 'ok'}
        />
      </div>

      {/* Two-column: Health + Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System health */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="w-4 h-4" /> System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.health.map((h) => (
              <div key={h.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <div className="flex items-center gap-2">
                  {h.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : h.status === 'warn' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-sm font-medium">{h.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{h.detail}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Cost & usage */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="w-4 h-4" /> AI Usage & Estimated Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Last 7 days" value={stats.generations7d.toString()} sub="generations" />
              <Stat label="Est. cost (7d)" value={`$${estCost7d}`} sub="@ ~$0.005/gen" />
              <Stat label="Projected /mo" value={`$${estCostMonth}`} sub="based on weekly trend" />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Queue success rate (7d)</span>
                <span className="font-medium">{queueRate}% — {stats.queueSuccess}/{queueTotal}</span>
              </div>
              <Progress value={queueRate} className="h-2" />
            </div>

            {stats.feedbackAvg !== null && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Avg user feedback ({stats.feedbackCount} ratings)</span>
                  <span className="font-medium">{stats.feedbackAvg.toFixed(2)} / 5</span>
                </div>
                <Progress value={(stats.feedbackAvg / 5) * 100} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resources + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-4 h-4" /> Backend Resources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <ResourceRow icon={Layers} label="Templates" value={stats.templates} onClick={() => onNavigate('templates')} />
            <ResourceRow icon={Palette} label="Brands" value={stats.brands} onClick={() => onNavigate('brands')} />
            <ResourceRow icon={Brain} label="Knowledge entries" value={stats.knowledgeRows} onClick={() => onNavigate('knowledge')} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No recent activity yet.</p>
            ) : (
              <ul className="space-y-2">
                {stats.recentEvents.map((e, i) => (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={e.type === 'generation' ? 'default' : 'secondary'} className="text-[10px] capitalize">
                        {e.type}
                      </Badge>
                      <span className="text-sm truncate">{e.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(e.ts)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const KpiCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  gradient: string;
  accent?: 'ok' | 'warn';
  onClick?: () => void;
}> = ({ icon: Icon, title, value, delta, deltaLabel, gradient, accent, onClick }) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <Card
      onClick={onClick}
      className={cn(
        'relative overflow-hidden border transition-all',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-md'
      )}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br pointer-events-none', gradient)} />
      <CardContent className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 rounded-lg bg-background/80 border border-border/50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          {onClick && <ArrowUpRight className="w-4 h-4 text-muted-foreground" />}
        </div>
        <p className="text-xs text-muted-foreground mb-1">{title}</p>
        <p className={cn('text-3xl font-bold', accent === 'warn' && 'text-amber-500')}>{value}</p>
        {delta !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">+{delta}</span> {deltaLabel}
          </p>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="p-3 rounded-lg bg-muted/40">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-bold">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </div>
);

const ResourceRow: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted transition-colors"
  >
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm">{label}</span>
    </div>
    <span className="text-sm font-semibold">{value}</span>
  </button>
);

function timeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default AdminOverview;
