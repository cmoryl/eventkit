import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FolderKanban, Image, Zap, TrendingUp, 
  Clock, Activity, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalGenerations: number;
  totalFeedback: number;
  averageSuccessRate: number;
  generationsByType: { type: string; count: number }[];
  recentActivity: { date: string; generations: number }[];
  topEngines: { engine: string; count: number }[];
}

const AdminAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // Fetch counts from various tables
      const [
        profilesResult,
        projectsResult,
        generationsResult,
        feedbackResult,
        templatesResult
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('ai_generations').select('asset_type, render_engine, created_at'),
        supabase.from('ai_feedback').select('rating'),
        supabase.from('prompt_templates').select('success_rate')
      ]);

      // Calculate generation stats
      const generations = generationsResult.data || [];
      const generationsByType = generations.reduce((acc, g) => {
        const type = g.asset_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const engineCounts = generations.reduce((acc, g) => {
        const engine = g.render_engine || 'lovable';
        acc[engine] = (acc[engine] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate success rate
      const templates = templatesResult.data || [];
      const avgSuccessRate = templates.length > 0
        ? templates.reduce((sum, t) => sum + (t.success_rate || 0.5), 0) / templates.length
        : 0.5;

      // Group generations by date (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const activityByDate = last7Days.map(date => ({
        date,
        generations: generations.filter(g => 
          g.created_at && g.created_at.startsWith(date)
        ).length
      }));

      setData({
        totalUsers: profilesResult.count || 0,
        totalProjects: projectsResult.count || 0,
        totalGenerations: generations.length,
        totalFeedback: feedbackResult.data?.length || 0,
        averageSuccessRate: avgSuccessRate,
        generationsByType: Object.entries(generationsByType)
          .map(([type, count]) => ({ type, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10),
        recentActivity: activityByDate,
        topEngines: Object.entries(engineCounts)
          .map(([engine, count]) => ({ engine, count }))
          .sort((a, b) => b.count - a.count)
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    description?: string;
    trend?: number;
  }> = ({ title, value, icon: Icon, description, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="hover:border-primary/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <p className="text-3xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-3 text-xs ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
          <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Overview of system usage and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.totalUsers}
          icon={Users}
        />
        <StatCard
          title="Projects"
          value={data.totalProjects}
          icon={FolderKanban}
        />
        <StatCard
          title="Generations"
          value={data.totalGenerations}
          icon={Image}
        />
        <StatCard
          title="Avg. Success Rate"
          value={`${(data.averageSuccessRate * 100).toFixed(0)}%`}
          icon={Zap}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {data.recentActivity.map((day, i) => {
                const maxCount = Math.max(...data.recentActivity.map(d => d.generations), 1);
                const height = (day.generations / maxCount) * 100;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      className="w-full bg-primary/20 rounded-t-md relative group"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border border-border rounded px-2 py-1 text-xs whitespace-nowrap">
                        {day.generations} generations
                      </div>
                      <div 
                        className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all"
                        style={{ height: `${Math.max(height, 5)}%` }}
                      />
                    </motion.div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Generations by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Generations by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.generationsByType.slice(0, 6).map((item, i) => {
                const maxCount = Math.max(...data.generationsByType.map(d => d.count), 1);
                const width = (item.count / maxCount) * 100;
                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-1"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize">{item.type.replace('_', ' ')}</span>
                      <span className="text-muted-foreground">{item.count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Render Engines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Top Render Engines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.topEngines.map((engine, i) => (
              <motion.div
                key={engine.engine}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 rounded-lg bg-muted/50"
              >
                <p className="text-2xl font-bold">{engine.count}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {engine.engine.replace('_', ' ')}
                </p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
