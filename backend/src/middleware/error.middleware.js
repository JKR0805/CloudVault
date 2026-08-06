const multer = require('multer');
const { sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Global error handler — must be the LAST middleware registered.
 * Catches Multer errors, known app errors, and unexpected failures.
 */
function errorHandler(err, req, res, _next) {
  logger.error('Unhandled error:', err.message);

  // ── Multer-specific errors ─────────────────────
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds the maximum allowed limit', 413);
    }
    return sendError(res, `Upload error: ${err.message}`, 400);
  }

  // ── File filter rejection ──────────────────────
  if (err.message?.startsWith('File type not allowed')) {
    return sendError(res, err.message, 400);
  }

  // ── Everything else ────────────────────────────
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return sendError(res, message, statusCode);
}

/**
 * 404 catch-all for unmatched routes.
 */
function notFoundHandler(req, res) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

module.exports = { errorHandler, notFoundHandler };
