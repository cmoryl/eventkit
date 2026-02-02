import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Pause, 
  Play, 
  RotateCcw, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  Clock,
  Zap
} from 'lucide-react';
import { GenerationJob, JobStatus, GenerationPriority } from '@/services/generationQueue';
import { cn } from '@/lib/utils';

interface GenerationQueueStatusProps {
  jobs: GenerationJob[];
  stats: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    retrying: number;
    isPaused: boolean;
    totalJobs: number;
    completionPercentage: number;
  };
  onPause: () => void;
  onResume: () => void;
  onRetryFailed: () => void;
  onCancel: () => void;
  compact?: boolean;
}

const priorityLabels: Record<GenerationPriority, string> = {
  [GenerationPriority.Critical]: 'Critical',
  [GenerationPriority.High]: 'High',
  [GenerationPriority.Medium]: 'Medium',
  [GenerationPriority.Low]: 'Low',
};

const priorityColors: Record<GenerationPriority, string> = {
  [GenerationPriority.Critical]: 'bg-destructive text-destructive-foreground',
  [GenerationPriority.High]: 'bg-warning text-warning-foreground',
  [GenerationPriority.Medium]: 'bg-secondary text-secondary-foreground',
  [GenerationPriority.Low]: 'bg-muted text-muted-foreground',
};

const statusIcons: Record<JobStatus, React.ReactNode> = {
  [JobStatus.Pending]: <Clock className="w-3 h-3 text-muted-foreground" />,
  [JobStatus.Processing]: <Loader2 className="w-3 h-3 text-primary animate-spin" />,
  [JobStatus.Completed]: <CheckCircle2 className="w-3 h-3 text-success" />,
  [JobStatus.Failed]: <AlertCircle className="w-3 h-3 text-destructive" />,
  [JobStatus.Retrying]: <RotateCcw className="w-3 h-3 text-warning animate-spin" />,
};

export const GenerationQueueStatus: React.FC<GenerationQueueStatusProps> = ({
  jobs,
  stats,
  onPause,
  onResume,
  onRetryFailed,
  onCancel,
  compact = false,
}) => {
  const activeJobs = jobs.filter(j => 
    j.status === JobStatus.Processing || 
    j.status === JobStatus.Retrying
  );
  
  const failedJobs = jobs.filter(j => j.status === JobStatus.Failed);

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
        <Progress value={stats.completionPercentage} className="flex-1 h-2" />
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {stats.completed + stats.failed}/{stats.totalJobs}
        </span>
        {stats.processing > 0 && (
          <Badge variant="outline" className="gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            {stats.processing}
          </Badge>
        )}
        {stats.failed > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="w-3 h-3" />
            {stats.failed}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border border-border">
      {/* Header with progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Generation Queue</h3>
          <div className="flex items-center gap-2">
            {stats.isPaused ? (
              <Button variant="ghost" size="sm" onClick={onResume}>
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={onPause}>
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            )}
            {stats.failed > 0 && (
              <Button variant="ghost" size="sm" onClick={onRetryFailed}>
                <RotateCcw className="w-4 h-4 mr-1" />
                Retry Failed
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <Progress value={stats.completionPercentage} className="h-2" />
        
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {stats.pending} pending
          </span>
          <span className="flex items-center gap-1">
            <Loader2 className="w-3 h-3" />
            {stats.processing} processing
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
            {stats.completed} completed
          </span>
          {stats.failed > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="w-3 h-3" />
              {stats.failed} failed
            </span>
          )}
          {stats.retrying > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <RotateCcw className="w-3 h-3" />
              {stats.retrying} retrying
            </span>
          )}
        </div>
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Currently Processing
          </h4>
          <div className="space-y-1">
            {activeJobs.map(job => (
              <div 
                key={job.id}
                className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md text-sm"
              >
                {statusIcons[job.status]}
                <span className="flex-1 truncate">{job.assetTitle}</span>
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', priorityColors[job.priority])}
                >
                  {priorityLabels[job.priority]}
                </Badge>
                {job.retryCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Retry {job.retryCount}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed jobs */}
      {failedJobs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-destructive uppercase tracking-wide">
            Failed
          </h4>
          <div className="space-y-1">
            {failedJobs.slice(0, 5).map(job => (
              <div 
                key={job.id}
                className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md text-sm"
              >
                {statusIcons[job.status]}
                <span className="flex-1 truncate">{job.assetTitle}</span>
                <span className="text-xs text-destructive truncate max-w-32">
                  {job.error}
                </span>
              </div>
            ))}
            {failedJobs.length > 5 && (
              <p className="text-xs text-muted-foreground">
                +{failedJobs.length - 5} more failed
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pause indicator */}
      {stats.isPaused && (
        <div className="flex items-center gap-2 p-2 bg-warning/10 rounded-md text-sm text-warning">
          <Pause className="w-4 h-4" />
          <span>Queue is paused</span>
        </div>
      )}
    </div>
  );
};
