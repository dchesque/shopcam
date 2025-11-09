// Monitoring utilities without Sentry dependency
// Simple logging for development and production

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface CustomError {
  message: string;
  context?: Record<string, any>;
  severity?: ErrorSeverity;
  tags?: Record<string, string>;
}

/**
 * Log an error with additional context
 */
export function logError(error: Error | string | CustomError, extra?: Record<string, any>) {
  if (typeof error === 'string') {
    console.error('[Error]', error, extra);
  } else if (error instanceof Error) {
    console.error('[Error]', error.message, error.stack, extra);
  } else {
    // CustomError
    console.error('[Error]', error.message, {
      severity: error.severity,
      context: error.context,
      tags: error.tags,
      extra,
    });
  }
}

/**
 * Log a warning
 */
export function logWarning(message: string, context?: Record<string, any>) {
  console.warn('[Warning]', message, context);
}

/**
 * Track a custom event
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  console.log('[Event]', eventName, properties);
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
}) {
  console.log('[User Context]', user);
}

/**
 * Clear user context
 */
export function clearUserContext() {
  console.log('[User Context] Cleared');
}

/**
 * Performance monitoring
 */
export function startTransaction(name: string, operation: string = 'navigation') {
  const startTime = performance.now();
  console.log(`[Transaction Start] ${name} (${operation})`);

  return {
    finish: () => {
      const duration = performance.now() - startTime;
      console.log(`[Transaction End] ${name} - ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * API call monitoring
 */
export async function monitorApiCall<T>(
  apiCall: () => Promise<T>,
  endpoint: string
): Promise<T> {
  const startTime = performance.now();
  console.log(`[API Call] ${endpoint}`);

  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    console.log(`[API Success] ${endpoint} - ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    console.error(`[API Error] ${endpoint} - ${duration.toFixed(2)}ms`, error);
    logError({
      message: `API call failed: ${endpoint}`,
      context: { endpoint, error: error instanceof Error ? error.message : 'Unknown error' },
      severity: 'medium',
      tags: { component: 'api' },
    });
    throw error;
  }
}

/**
 * Component error boundary
 */
export function captureComponentError(
  error: Error,
  errorInfo: { componentStack: string }
) {
  console.error('[Component Error]', error, errorInfo);
}
