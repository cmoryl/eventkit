// AI Error Handling Service
// Centralized error handling for all AI operations with user-friendly toasts

import { toast } from "@/hooks/use-toast";

export type AIErrorType = 
  | 'RATE_LIMIT' 
  | 'PAYMENT_REQUIRED' 
  | 'TIMEOUT' 
  | 'API_ERROR' 
  | 'NETWORK_ERROR' 
  | 'UNKNOWN';

export interface AIError {
  type: AIErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfterMs?: number;
}

// Parse error from various sources into a standardized AIError
export function parseAIError(error: unknown): AIError {
  // Handle string errors
  if (typeof error === 'string') {
    return classifyErrorMessage(error);
  }
  
  // Handle Error objects
  if (error instanceof Error) {
    return classifyErrorMessage(error.message);
  }
  
  // Handle response objects from Supabase
  if (typeof error === 'object' && error !== null) {
    const err = error as Record<string, unknown>;
    
    // Check for status code
    if (err.status === 429 || err.code === '429') {
      return createRateLimitError();
    }
    if (err.status === 402 || err.code === '402') {
      return createPaymentError();
    }
    
    // Check for error message
    if (typeof err.message === 'string') {
      return classifyErrorMessage(err.message);
    }
    if (typeof err.error === 'string') {
      return classifyErrorMessage(err.error);
    }
  }
  
  return createUnknownError();
}

function classifyErrorMessage(message: string): AIError {
  const lowerMessage = message.toLowerCase();
  
  // Rate limit detection
  if (
    lowerMessage.includes('429') ||
    lowerMessage.includes('rate limit') ||
    lowerMessage.includes('too many requests') ||
    lowerMessage.includes('quota exceeded')
  ) {
    return createRateLimitError(message);
  }
  
  // Payment/credits detection
  if (
    lowerMessage.includes('402') ||
    lowerMessage.includes('payment required') ||
    lowerMessage.includes('credits exhausted') ||
    lowerMessage.includes('insufficient credits') ||
    lowerMessage.includes('billing')
  ) {
    return createPaymentError(message);
  }
  
  // Timeout detection
  if (
    lowerMessage.includes('timeout') ||
    lowerMessage.includes('timed out') ||
    lowerMessage.includes('deadline exceeded')
  ) {
    return createTimeoutError(message);
  }
  
  // Network error detection
  if (
    lowerMessage.includes('network') ||
    lowerMessage.includes('fetch') ||
    lowerMessage.includes('connection') ||
    lowerMessage.includes('offline')
  ) {
    return createNetworkError(message);
  }
  
  // API error detection
  if (
    lowerMessage.includes('api') ||
    lowerMessage.includes('service') ||
    lowerMessage.includes('gateway') ||
    lowerMessage.includes('500') ||
    lowerMessage.includes('502') ||
    lowerMessage.includes('503')
  ) {
    return createAPIError(message);
  }
  
  return createUnknownError(message);
}

function createRateLimitError(originalMessage?: string): AIError {
  return {
    type: 'RATE_LIMIT',
    message: originalMessage || 'Rate limit exceeded',
    userMessage: 'Slow down! Too many requests. Please wait a moment and try again.',
    retryable: true,
    retryAfterMs: 5000,
  };
}

function createPaymentError(originalMessage?: string): AIError {
  return {
    type: 'PAYMENT_REQUIRED',
    message: originalMessage || 'Payment required',
    userMessage: 'AI credits exhausted. Please add credits to continue generating assets.',
    retryable: false,
  };
}

function createTimeoutError(originalMessage?: string): AIError {
  return {
    type: 'TIMEOUT',
    message: originalMessage || 'Request timed out',
    userMessage: 'The request took too long. Please try again.',
    retryable: true,
    retryAfterMs: 2000,
  };
}

function createNetworkError(originalMessage?: string): AIError {
  return {
    type: 'NETWORK_ERROR',
    message: originalMessage || 'Network error',
    userMessage: 'Network issue detected. Please check your connection and try again.',
    retryable: true,
    retryAfterMs: 3000,
  };
}

function createAPIError(originalMessage?: string): AIError {
  return {
    type: 'API_ERROR',
    message: originalMessage || 'API error',
    userMessage: 'AI service temporarily unavailable. Please try again in a moment.',
    retryable: true,
    retryAfterMs: 3000,
  };
}

function createUnknownError(originalMessage?: string): AIError {
  return {
    type: 'UNKNOWN',
    message: originalMessage || 'Unknown error',
    userMessage: 'Something went wrong. Please try again.',
    retryable: true,
    retryAfterMs: 2000,
  };
}

// Show appropriate toast for an AI error
export function showAIErrorToast(error: AIError): void {
  const variant = error.retryable ? 'default' : 'destructive';
  
  // Map error types to appropriate icons/titles
  const titles: Record<AIErrorType, string> = {
    'RATE_LIMIT': '⏱️ Rate Limited',
    'PAYMENT_REQUIRED': '💳 Credits Exhausted',
    'TIMEOUT': '⏰ Timeout',
    'NETWORK_ERROR': '📶 Connection Issue',
    'API_ERROR': '⚠️ Service Error',
    'UNKNOWN': '❌ Error',
  };
  
  toast({
    title: titles[error.type],
    description: error.userMessage,
    variant,
    duration: error.type === 'PAYMENT_REQUIRED' ? 10000 : 5000,
  });
}

// Handle an AI error: parse, show toast, and return the parsed error
export function handleAIError(error: unknown): AIError {
  const parsedError = parseAIError(error);
  showAIErrorToast(parsedError);
  return parsedError;
}

// Utility to wrap async AI operations with standardized error handling
export async function withAIErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    showToast?: boolean;
    onError?: (error: AIError) => void;
  }
): Promise<{ success: true; data: T } | { success: false; error: AIError }> {
  const { showToast = true, onError } = options || {};
  
  try {
    const data = await operation();
    return { success: true, data };
  } catch (e) {
    const parsedError = parseAIError(e);
    
    if (showToast) {
      showAIErrorToast(parsedError);
    }
    
    if (onError) {
      onError(parsedError);
    }
    
    return { success: false, error: parsedError };
  }
}

// Retry wrapper with exponential backoff for retryable errors
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    initialDelayMs?: number;
    showToast?: boolean;
  }
): Promise<T> {
  const { maxRetries = 3, initialDelayMs = 1000, showToast = true } = options || {};
  let lastError: AIError | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (e) {
      lastError = parseAIError(e);
      
      // Don't retry non-retryable errors
      if (!lastError.retryable) {
        if (showToast) {
          showAIErrorToast(lastError);
        }
        throw e;
      }
      
      // If this was the last attempt, show error
      if (attempt === maxRetries) {
        if (showToast) {
          showAIErrorToast(lastError);
        }
        throw e;
      }
      
      // Wait before retrying with exponential backoff
      const delay = lastError.retryAfterMs || (initialDelayMs * Math.pow(2, attempt));
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen, but TypeScript needs it
  throw lastError || new Error('Unknown error in retry loop');
}
