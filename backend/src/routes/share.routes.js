const { Router } = require('express');
const shareController = require('../controllers/share.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

/**
 * POST /api/v1/share/:id
 * Generate a short code for a specific file. Requires auth.
 */
router.post('/:id', authenticate, shareController.createSharedLink);

/**
 * GET /api/v1/share/:shortCode
 * Retrieve file metadata and a fresh signed URL using the short code. Public route.
 */
router.get('/:shortCode', shareController.getSharedFile);

module.exports = router;
