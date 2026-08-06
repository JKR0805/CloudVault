const multer = require('multer');
const { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } = require('../utils/constants');

// ─── Memory storage ──────────────────────────────
// Files stay in memory as buffers — streamed straight to Supabase Storage.
const storage = multer.memoryStorage();

// ─── File filter ──────────────────────────────────
const fileFilter = (_req, file, cb) => {
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// ─── Configured multer instance ───────────────────
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

module.exports = { upload };
