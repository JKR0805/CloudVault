const { Router } = require('express');
const { sendSuccess } = require('../utils/response');

const router = Router();

/**
 * GET /api/v1/health
 *
 * First endpoint to build. When Docker starts,
 * this tells you everything is working.
 */
router.get('/', (_req, res) => {
  return sendSuccess(res, 'Server is running', {
    status: 'ok',
    server: 'running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
