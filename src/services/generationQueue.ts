import { AssetType } from '@/types';
import type { EventDetails, ColorInfo, GeneratedAsset } from '@/types';
import type { RenderEngine } from '@/services/aiBrain/types';

// Priority levels for asset generation
export enum GenerationPriority {
  Critical = 0,  // Palette, core branding
  High = 1,      // Visible/hero assets
  Medium = 2,    // Standard assets
  Low = 3,       // Background/optional assets
}

// Job status
export enum JobStatus {
  Pending = 'pending',
  Processing = 'processing',
  Completed = 'completed',
  Failed = 'failed',
  Retrying = 'retrying',
}

// Generation job interface
export interface GenerationJob {
  id: string;
  assetId: string;
  assetType: AssetType;
  assetTitle: string;
  priority: GenerationPriority;
  status: JobStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  result?: string | string[] | ColorInfo[];
}

// Queue events
export type QueueEventType = 
  | 'job-added'
  | 'job-started'
  | 'job-completed'
  | 'job-failed'
  | 'job-retrying'
  | 'queue-empty'
  | 'queue-paused'
  | 'queue-resumed';

export interface QueueEvent {
  type: QueueEventType;
  job?: GenerationJob;
  queueLength?: number;
}

type QueueListener = (event: QueueEvent) => void;

// Configuration for the queue
interface QueueConfig {
  maxConcurrent: number;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 3,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterMs: 500,
};

// Priority mapping for asset types
const ASSET_PRIORITY_MAP: Partial<Record<AssetType, GenerationPriority>> = {
  [AssetType.Palette]: GenerationPriority.Critical,
  [AssetType.Logo]: GenerationPriority.Critical,
  [AssetType.LogoMonochrome]: GenerationPriority.Critical,
  [AssetType.LogoReversed]: GenerationPriority.Critical,
  [AssetType.Banner]: GenerationPriority.High,
  [AssetType.SocialPost]: GenerationPriority.High,
  [AssetType.InvitationCard]: GenerationPriority.High,
  [AssetType.TicketDesign]: GenerationPriority.High,
  [AssetType.NameTag]: GenerationPriority.Medium,
  [AssetType.Lanyard]: GenerationPriority.Medium,
  [AssetType.CertificateAward]: GenerationPriority.Medium,
  [AssetType.SeamlessPattern]: GenerationPriority.Low,
  [AssetType.Favicon]: GenerationPriority.Low,
};

export function getAssetPriority(assetType: AssetType): GenerationPriority {
  return ASSET_PRIORITY_MAP[assetType] ?? GenerationPriority.Medium;
}

// Calculate exponential backoff delay with jitter
function calculateBackoffDelay(
  retryCount: number, 
  config: QueueConfig
): number {
  // Exponential backoff: baseDelay * 2^retryCount
  const exponentialDelay = config.baseDelayMs * Math.pow(2, retryCount);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Add random jitter to prevent thundering herd
  const jitter = Math.random() * config.jitterMs;
  
  return cappedDelay + jitter;
}

// Generation function type
type GenerateFn = (
  assetType: AssetType,
  eventDetails: EventDetails,
  colorPalette: ColorInfo[],
  logoBase64?: string,
  styleDesc?: string,
  vibeImageBase64?: string | string[],
  masterPatternBase64?: string | string[],
  venueImageBase64?: string,
  renderEngine?: RenderEngine
) => Promise<string | string[] | ColorInfo[]>;

class GenerationQueue {
  private queue: GenerationJob[] = [];
  private activeJobs: Map<string, GenerationJob> = new Map();
  private config: QueueConfig;
  private isPaused: boolean = false;
  private listeners: Set<QueueListener> = new Set();
  private generateFn: GenerateFn | null = null;
  private generationContext: {
    eventDetails: EventDetails;
    colorPalette: ColorInfo[];
    logoBase64?: string;
    styleDesc?: string;
    vibeImageBase64?: string | string[];
    masterPatternBase64?: string | string[];
    venueImageBase64?: string;
    renderEngine?: RenderEngine;
  } | null = null;

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Set the generation function and context
  setGenerationContext(
    generateFn: GenerateFn,
    context: {
      eventDetails: EventDetails;
      colorPalette: ColorInfo[];
      logoBase64?: string;
      styleDesc?: string;
      vibeImageBase64?: string | string[];
      masterPatternBase64?: string | string[];
      venueImageBase64?: string;
      renderEngine?: RenderEngine;
    }
  ): void {
    this.generateFn = generateFn;
    this.generationContext = context;
  }

  // Update color palette (after palette generation)
  updateColorPalette(palette: ColorInfo[]): void {
    if (this.generationContext) {
      this.generationContext.colorPalette = palette;
    }
  }

  // Add a job to the queue
  addJob(asset: GeneratedAsset): GenerationJob {
    const job: GenerationJob = {
      id: `job-${asset.id}-${Date.now()}`,
      assetId: asset.id,
      assetType: asset.type,
      assetTitle: asset.title,
      priority: getAssetPriority(asset.type),
      status: JobStatus.Pending,
      retryCount: 0,
      maxRetries: this.config.maxRetries,
      createdAt: Date.now(),
    };

    // Insert in priority order
    this.insertByPriority(job);
    
    this.emit({ type: 'job-added', job, queueLength: this.queue.length });
    
    // Start processing if not paused
    if (!this.isPaused) {
      this.processNext();
    }

    return job;
  }

  // Add multiple jobs at once
  addJobs(assets: GeneratedAsset[]): GenerationJob[] {
    const jobs = assets.map(asset => {
      const job: GenerationJob = {
        id: `job-${asset.id}-${Date.now()}`,
        assetId: asset.id,
        assetType: asset.type,
        assetTitle: asset.title,
        priority: getAssetPriority(asset.type),
        status: JobStatus.Pending,
        retryCount: 0,
        maxRetries: this.config.maxRetries,
        createdAt: Date.now(),
      };
      return job;
    });

    // Sort by priority and add all
    jobs.sort((a, b) => a.priority - b.priority);
    jobs.forEach(job => this.insertByPriority(job));

    this.emit({ type: 'job-added', queueLength: this.queue.length });
    
    if (!this.isPaused) {
      this.processNext();
    }

    return jobs;
  }

  // Insert job in priority order (lower number = higher priority)
  private insertByPriority(job: GenerationJob): void {
    const insertIndex = this.queue.findIndex(j => j.priority > job.priority);
    if (insertIndex === -1) {
      this.queue.push(job);
    } else {
      this.queue.splice(insertIndex, 0, job);
    }
  }

  // Process next jobs up to concurrency limit
  private async processNext(): Promise<void> {
    if (this.isPaused || !this.generateFn || !this.generationContext) {
      return;
    }

    // Fill up to max concurrent
    while (
      this.activeJobs.size < this.config.maxConcurrent &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift();
      if (!job) break;

      this.processJob(job);
    }
  }

  // Process a single job
  private async processJob(job: GenerationJob): Promise<void> {
    if (!this.generateFn || !this.generationContext) {
      job.status = JobStatus.Failed;
      job.error = 'Generation context not set';
      this.emit({ type: 'job-failed', job });
      return;
    }

    job.status = JobStatus.Processing;
    job.startedAt = Date.now();
    this.activeJobs.set(job.id, job);
    
    this.emit({ type: 'job-started', job });

    try {
      const result = await this.generateFn(
        job.assetType,
        this.generationContext.eventDetails,
        this.generationContext.colorPalette,
        this.generationContext.logoBase64,
        this.generationContext.styleDesc,
        this.generationContext.vibeImageBase64,
        this.generationContext.masterPatternBase64,
        this.generationContext.venueImageBase64,
        this.generationContext.renderEngine
      );

      job.status = JobStatus.Completed;
      job.completedAt = Date.now();
      job.result = result;

      this.activeJobs.delete(job.id);
      this.emit({ type: 'job-completed', job });

      // Update palette if this was a palette generation
      if (job.assetType === AssetType.Palette && Array.isArray(result)) {
        this.updateColorPalette(result as ColorInfo[]);
      }

    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      
      job.error = error instanceof Error ? error.message : 'Unknown error';
      this.activeJobs.delete(job.id);

      // Check if retryable
      if (this.shouldRetry(job, error)) {
        await this.retryJob(job);
      } else {
        job.status = JobStatus.Failed;
        job.completedAt = Date.now();
        this.emit({ type: 'job-failed', job });
      }
    }

    // Process next job
    this.processNext();

    // Check if queue is empty
    if (this.queue.length === 0 && this.activeJobs.size === 0) {
      this.emit({ type: 'queue-empty' });
    }
  }

  // Determine if error is retryable
  private shouldRetry(job: GenerationJob, error: unknown): boolean {
    if (job.retryCount >= job.maxRetries) {
      return false;
    }

    // Check error type
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Non-retryable errors
    const nonRetryablePatterns = [
      'PAYMENT_REQUIRED',
      'Invalid API key',
      'Unauthorized',
      'Content policy violation',
    ];

    for (const pattern of nonRetryablePatterns) {
      if (errorMessage.includes(pattern)) {
        return false;
      }
    }

    // Retryable errors (rate limits, timeouts, network issues)
    const retryablePatterns = [
      'RATE_LIMIT',
      'timeout',
      'TIMEOUT',
      'network',
      'ECONNRESET',
      'ETIMEDOUT',
      '429',
      '503',
      '502',
      '500',
    ];

    for (const pattern of retryablePatterns) {
      if (errorMessage.includes(pattern)) {
        return true;
      }
    }

    // Default: retry on unknown errors
    return true;
  }

  // Retry a failed job with exponential backoff
  private async retryJob(job: GenerationJob): Promise<void> {
    job.retryCount++;
    job.status = JobStatus.Retrying;
    
    const delay = calculateBackoffDelay(job.retryCount, this.config);
    
    console.log(`Retrying job ${job.id} (attempt ${job.retryCount}/${job.maxRetries}) after ${delay}ms`);
    
    this.emit({ type: 'job-retrying', job });

    await new Promise(resolve => setTimeout(resolve, delay));

    // Re-add to queue with same priority (at front for retries)
    job.status = JobStatus.Pending;
    this.queue.unshift(job);
    
    this.processNext();
  }

  // Pause queue processing
  pause(): void {
    this.isPaused = true;
    this.emit({ type: 'queue-paused' });
  }

  // Resume queue processing
  resume(): void {
    this.isPaused = false;
    this.emit({ type: 'queue-resumed' });
    this.processNext();
  }

  // Cancel a specific job
  cancelJob(jobId: string): boolean {
    const queueIndex = this.queue.findIndex(j => j.id === jobId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      return true;
    }
    return false;
  }

  // Cancel all pending jobs
  cancelAll(): void {
    this.queue = [];
    // Active jobs will complete, but no new ones will start
  }

  // Clear completed/failed jobs from history
  clear(): void {
    this.queue = [];
    this.activeJobs.clear();
  }

  // Get queue status
  getStatus(): {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    isPaused: boolean;
  } {
    return {
      pending: this.queue.length,
      processing: this.activeJobs.size,
      completed: 0, // Would need job history for this
      failed: 0,
      isPaused: this.isPaused,
    };
  }

  // Get all jobs (for UI display)
  getJobs(): GenerationJob[] {
    return [...this.queue, ...Array.from(this.activeJobs.values())];
  }

  // Get job by ID
  getJob(jobId: string): GenerationJob | undefined {
    const inQueue = this.queue.find(j => j.id === jobId);
    if (inQueue) return inQueue;
    return this.activeJobs.get(jobId);
  }

  // Get job by asset ID
  getJobByAssetId(assetId: string): GenerationJob | undefined {
    const inQueue = this.queue.find(j => j.assetId === assetId);
    if (inQueue) return inQueue;
    return Array.from(this.activeJobs.values()).find(j => j.assetId === assetId);
  }

  // Event subscription
  subscribe(listener: QueueListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: QueueEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Queue listener error:', err);
      }
    });
  }

  // Update config
  updateConfig(config: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Get context info for persistence
  getContextInfo(): { eventName: string; eventDescription: string; styleDesc?: string } | null {
    if (!this.generationContext) return null;
    return {
      eventName: this.generationContext.eventDetails.name,
      eventDescription: this.generationContext.eventDetails.description || '',
      styleDesc: this.generationContext.styleDesc,
    };
  }

  // Restore jobs from persisted state
  restoreJobs(jobs: GenerationJob[]): void {
    // Reset status of processing jobs to pending (they were interrupted)
    const restoredJobs = jobs.map(job => ({
      ...job,
      status: job.status === JobStatus.Processing ? JobStatus.Pending : job.status,
      startedAt: undefined,
    }));

    // Sort by priority and add to queue
    restoredJobs.sort((a, b) => a.priority - b.priority);
    this.queue = restoredJobs;

    console.log(`Restored ${restoredJobs.length} jobs to queue`);
    this.emit({ type: 'job-added', queueLength: this.queue.length });
  }

  // Check if queue has pending work
  hasPendingWork(): boolean {
    return this.queue.length > 0 || this.activeJobs.size > 0;
  }
}

// Singleton instance
export const generationQueue = new GenerationQueue();

// Hook for using the queue in React components
export function useGenerationQueue() {
  return generationQueue;
}
