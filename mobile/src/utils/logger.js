/**
 * Production-safe logger utility
 * In production builds, only errors and warnings are logged
 */

const __DEV__ = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => {
    if (__DEV__) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    console.warn(...args);
  },
  
  error: (...args) => {
    console.error(...args);
  },
  
  info: (...args) => {
    if (__DEV__) {
      console.info(...args);
    }
  },
  
  debug: (...args) => {
    if (__DEV__) {
      console.debug(...args);
    }
  }
};

export default logger;
