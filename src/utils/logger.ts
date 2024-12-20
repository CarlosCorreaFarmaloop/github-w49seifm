/**
 * Custom logger with context-aware logging
 */
export const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  },
  
  error: (message: string, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...context
    }));
  }
};