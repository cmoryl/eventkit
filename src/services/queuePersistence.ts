import { GenerationJob, JobStatus, GenerationPriority } from './generationQueue';
import { AssetType } from '@/types';

const STORAGE_KEY = 'eventkit_generation_queue';
const STORAGE_VERSION = 1;

interface PersistedQueueState {
  version: number;
  savedAt: number;
  jobs: SerializedJob[];
  context: SerializedContext | null;
}

interface SerializedJob {
  id: string;
  assetId: string;
  assetType: string;
  assetTitle: string;
  priority: number;
  status: string;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  // Note: result is NOT persisted (too large for localStorage)
}

interface SerializedContext {
  eventName: string;
  eventDescription: string;
  styleDesc?: string;
  // Base64 images are NOT persisted (too large)
  // User will need to re-upload if they want to resume
}

// Convert job to serializable format
function serializeJob(job: GenerationJob): SerializedJob {
  return {
    id: job.id,
    assetId: job.assetId,
    assetType: job.assetType,
    assetTitle: job.assetTitle,
    priority: job.priority,
    status: job.status,
    retryCount: job.retryCount,
    maxRetries: job.maxRetries,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    error: job.error,
  };
}

// Convert serialized job back to GenerationJob
function deserializeJob(serialized: SerializedJob): GenerationJob {
  return {
    id: serialized.id,
    assetId: serialized.assetId,
    assetType: serialized.assetType as AssetType,
    assetTitle: serialized.assetTitle,
    priority: serialized.priority as GenerationPriority,
    status: serialized.status as JobStatus,
    retryCount: serialized.retryCount,
    maxRetries: serialized.maxRetries,
    createdAt: serialized.createdAt,
    startedAt: serialized.startedAt,
    completedAt: serialized.completedAt,
    error: serialized.error,
    result: undefined, // Results are not persisted
  };
}

// Save queue state to localStorage
export function saveQueueState(
  jobs: GenerationJob[],
  context?: { eventName: string; eventDescription: string; styleDesc?: string }
): boolean {
  try {
    // Only save pending/retrying jobs (not completed/failed)
    const jobsToSave = jobs.filter(
      j => j.status === JobStatus.Pending || 
           j.status === JobStatus.Processing ||
           j.status === JobStatus.Retrying
    );

    if (jobsToSave.length === 0) {
      // Clear storage if no pending jobs
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }

    const state: PersistedQueueState = {
      version: STORAGE_VERSION,
      savedAt: Date.now(),
      jobs: jobsToSave.map(serializeJob),
      context: context ? {
        eventName: context.eventName,
        eventDescription: context.eventDescription,
        styleDesc: context.styleDesc,
      } : null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log(`Queue state saved: ${jobsToSave.length} pending jobs`);
    return true;
  } catch (error) {
    console.error('Failed to save queue state:', error);
    return false;
  }
}

// Load queue state from localStorage
export function loadQueueState(): PersistedQueueState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const state: PersistedQueueState = JSON.parse(stored);
    
    // Version check
    if (state.version !== STORAGE_VERSION) {
      console.warn('Queue state version mismatch, clearing');
      clearQueueState();
      return null;
    }

    // Check if state is too old (24 hours)
    const MAX_AGE_MS = 24 * 60 * 60 * 1000;
    if (Date.now() - state.savedAt > MAX_AGE_MS) {
      console.warn('Queue state expired, clearing');
      clearQueueState();
      return null;
    }

    return state;
  } catch (error) {
    console.error('Failed to load queue state:', error);
    clearQueueState();
    return null;
  }
}

// Check if there's a restorable queue
export function hasRestorableQueue(): boolean {
  const state = loadQueueState();
  return state !== null && state.jobs.length > 0;
}

// Get pending jobs from stored state
export function getStoredPendingJobs(): GenerationJob[] {
  const state = loadQueueState();
  if (!state) return [];

  return state.jobs.map(deserializeJob);
}

// Get stored context info
export function getStoredContext(): SerializedContext | null {
  const state = loadQueueState();
  return state?.context ?? null;
}

// Get summary of stored queue for display
export function getQueueSummary(): {
  pendingCount: number;
  savedAt: Date;
  eventName?: string;
} | null {
  const state = loadQueueState();
  if (!state || state.jobs.length === 0) return null;

  return {
    pendingCount: state.jobs.length,
    savedAt: new Date(state.savedAt),
    eventName: state.context?.eventName,
  };
}

// Clear queue state
export function clearQueueState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Queue state cleared');
  } catch (error) {
    console.error('Failed to clear queue state:', error);
  }
}

// Auto-save debouncer
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSaveQueueState(
  jobs: GenerationJob[],
  context?: { eventName: string; eventDescription: string; styleDesc?: string },
  delay = 1000
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveQueueState(jobs, context);
    saveTimeout = null;
  }, delay);
}

// Force immediate save (for page unload)
export function forceSaveQueueState(
  jobs: GenerationJob[],
  context?: { eventName: string; eventDescription: string; styleDesc?: string }
): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
    saveTimeout = null;
  }
  saveQueueState(jobs, context);
}
