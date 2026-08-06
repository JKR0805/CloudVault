const config = require('./env');

// ─── Log levels ───────────────────────────────────
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = config.isProduction ? levels.info : levels.debug;

function timestamp() {
  return new Date().toISOString();
}

// ─── Logger ───────────────────────────────────────
const logger = {
  error: (...args) => {
    if (currentLevel >= levels.error) {
      console.error(`[${timestamp()}] ERROR:`, ...args);
    }
  },

  warn: (...args) => {
    if (currentLevel >= levels.warn) {
      console.warn(`[${timestamp()}] WARN:`, ...args);
    }
  },

  info: (...args) => {
    if (currentLevel >= levels.info) {
      console.info(`[${timestamp()}] INFO:`, ...args);
    }
  },

  debug: (...args) => {
    if (currentLevel >= levels.debug) {
      console.debug(`[${timestamp()}] DEBUG:`, ...args);
    }
  },
};

module.exports = logger;
