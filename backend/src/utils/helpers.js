const crypto = require('crypto');
const path = require('path');

/**
 * Generate a UUID-based stored filename.
 * Original: "Resume.pdf"  →  Stored: "a9e72b91-...pdf"
 */
function generateStoredName(originalName) {
  const ext = path.extname(originalName);
  const uuid = crypto.randomUUID();
  return `${uuid}${ext}`;
}

/**
 * Build the storage path: "<userId>/<storedName>"
 * e.g. "13bd72d5-…/a9e72b91-….pdf"
 */
function generateStoragePath(userId, storedName) {
  return `${userId}/${storedName}`;
}

/**
 * Extract the lowercase file extension.
 */
function getFileExtension(filename) {
  return path.extname(filename).toLowerCase();
}

/**
 * Human-readable byte formatter.
 * 1048576 → "1 MB"
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}

module.exports = {
  generateStoredName,
  generateStoragePath,
  getFileExtension,
  formatBytes,
};
