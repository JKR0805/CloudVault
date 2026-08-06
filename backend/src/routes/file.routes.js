const { Router } = require('express');
const fileController = require('../controllers/file.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

const router = Router();

// Every file route requires authentication
router.use(authenticate);

/**
 * GET /api/v1/files
 * List all files for the authenticated user.
 */
router.get('/', fileController.getFiles);

/**
 * GET /api/v1/files/:id
 * Get a single file's metadata.
 */
router.get('/:id', fileController.getFile);

/**
 * POST /api/v1/files/upload
 * Upload a file. Multer processes the multipart form data.
 * Field name: "file"
 */
router.post('/upload', upload.single('file'), fileController.uploadFile);

/**
 * GET /api/v1/files/:id/download
 * Generate a signed download URL.
 */
router.get('/:id/download', fileController.downloadFile);

/**
 * PATCH /api/v1/files/:id
 * Rename a file.
 */
router.patch('/:id', fileController.renameFile);

/**
 * DELETE /api/v1/files/:id
 * Delete a file from storage and database.
 */
router.delete('/:id', fileController.deleteFile);

module.exports = router;
