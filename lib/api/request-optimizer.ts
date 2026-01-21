/**
 * Request Optimizer
 *
 * Provides utilities for optimizing API requests:
 * - Request batching
 * - Request deduplication
 * - Payload compression
 * - Request queuing
 */

interface PendingRequest {
  key: string;
  promise: Promise<unknown>;
  timestamp: number;
}

class RequestOptimizer {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly DEDUP_WINDOW = 100; // 100ms window for deduplication
  private readonly MAX_PAYLOAD_SIZE = 100 * 1024; // 100KB

  /**
   * Deduplicate requests - if same request is made within window, return existing promise
   */
  deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = this.pendingRequests.get(key);

    // If request exists and is within deduplication window, return existing promise
    if (existing && now - existing.timestamp < this.DEDUP_WINDOW) {
      return existing.promise as Promise<T>;
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Clean up after request completes
      setTimeout(() => {
        this.pendingRequests.delete(key);
      }, this.DEDUP_WINDOW);
    });

    this.pendingRequests.set(key, {
      key,
      promise,
      timestamp: now,
    });

    return promise;
  }

  /**
   * Batch multiple requests into a single call (if backend supports it)
   */
  async batch<T>(requests: Array<() => Promise<T>>): Promise<T[]> {
    // Execute requests in parallel but limit concurrency
    const BATCH_SIZE = 5;
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(batch.map((req) => req()));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Optimize payload by removing unnecessary fields
   */
  optimizePayload<T extends Record<string, unknown>>(payload: T): T {
    const optimized = { ...payload };

    // Remove undefined, null, and empty string values
    Object.keys(optimized).forEach((key) => {
      const value = optimized[key];
      if (value === undefined || value === null || value === '') {
        delete optimized[key];
      }
    });

    return optimized;
  }

  /**
   * Check if payload size is acceptable
   */
  validatePayloadSize(payload: unknown): boolean {
    const size = JSON.stringify(payload).length;
    return size <= this.MAX_PAYLOAD_SIZE;
  }

  /**
   * Create optimized query params
   */
  optimizeQueryParams(params: Record<string, unknown>): Record<string, string> {
    const optimized: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        optimized[key] = String(value);
      }
    });

    return optimized;
  }

  /**
   * Clear pending requests (useful for cleanup)
   */
  clear(): void {
    this.pendingRequests.clear();
  }
}

export const requestOptimizer = new RequestOptimizer();
