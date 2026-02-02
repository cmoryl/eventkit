import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Trash2,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssetTypeStats {
  assetType: string;
  totalCount: number;
  successCount: number;
  failedCount: number;
  successRate: number;
  avgDurationMs: number;
  avgRetries: number;
}

interface AnalyticsSummary {
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  overallSuccessRate: number;
  avgDurationMs: number;
  statsByAssetType: AssetTypeStats[];
  recentErrors: { assetType: string; error: string; createdAt: string }[];
}

interface QueueAnalyticsPanelProps {
  summary: AnalyticsSummary | null;
  isLoading: boolean;
  onRefresh: () => void;
  onClear: () => void;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatAssetType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const QueueAnalyticsPanel: React.FC<QueueAnalyticsPanelProps> = ({
  summary,
  isLoading,
  onRefresh,
  onClear,
}) => {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary || summary.totalGenerations === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Queue Analytics
          </CardTitle>
          <CardDescription>Track generation performance over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No analytics data yet</p>
            <p className="text-sm">Generate some assets to see performance metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Queue Analytics
            </CardTitle>
            <CardDescription>Last 30 days performance</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClear}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-secondary/50">
            <div className="text-2xl font-bold text-foreground">
              {summary.totalGenerations}
            </div>
            <div className="text-xs text-muted-foreground">Total Generations</div>
          </div>
          
          <div className="p-3 rounded-lg bg-success/10">
            <div className="text-2xl font-bold text-success flex items-center gap-1">
              <CheckCircle2 className="w-5 h-5" />
              {summary.successfulGenerations}
            </div>
            <div className="text-xs text-muted-foreground">Successful</div>
          </div>
          
          <div className="p-3 rounded-lg bg-destructive/10">
            <div className="text-2xl font-bold text-destructive flex items-center gap-1">
              <XCircle className="w-5 h-5" />
              {summary.failedGenerations}
            </div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/10">
            <div className="text-2xl font-bold text-primary flex items-center gap-1">
              <Clock className="w-5 h-5" />
              {formatDuration(summary.avgDurationMs)}
            </div>
            <div className="text-xs text-muted-foreground">Avg Duration</div>
          </div>
        </div>

        {/* Success rate bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Overall Success Rate
            </span>
            <span className="font-medium">{summary.overallSuccessRate.toFixed(1)}%</span>
          </div>
          <Progress 
            value={summary.overallSuccessRate} 
            className="h-2"
          />
        </div>

        {/* Per-asset type stats */}
        {summary.statsByAssetType.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">By Asset Type</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {summary.statsByAssetType.slice(0, 10).map((stats) => (
                <div 
                  key={stats.assetType}
                  className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate max-w-32">
                      {formatAssetType(stats.assetType)}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {stats.totalCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={cn(
                      "font-medium",
                      stats.successRate >= 80 ? "text-success" :
                      stats.successRate >= 50 ? "text-warning" :
                      "text-destructive"
                    )}>
                      {stats.successRate.toFixed(0)}%
                    </span>
                    <span className="text-muted-foreground">
                      {formatDuration(stats.avgDurationMs)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent errors */}
        {summary.recentErrors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Recent Errors
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {summary.recentErrors.slice(0, 5).map((err, idx) => (
                <div 
                  key={idx}
                  className="p-2 rounded bg-destructive/10 text-xs"
                >
                  <div className="font-medium text-destructive">
                    {formatAssetType(err.assetType)}
                  </div>
                  <div className="text-muted-foreground truncate">
                    {err.error}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
