// ─── API ──────────────────────────────────────────
const API_VERSION = 'v1';

// ─── Upload limits ────────────────────────────────
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',

  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',

  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',

  // Media
  'video/mp4',
  'audio/mpeg',
];

// ─── Storage ──────────────────────────────────────
const STORAGE_BUCKET = 'user-files';
const DEFAULT_SIGNED_URL_EXPIRY = 60 * 60; // 1 hour (seconds)

module.exports = {
  API_VERSION,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  STORAGE_BUCKET,
  DEFAULT_SIGNED_URL_EXPIRY,
};
