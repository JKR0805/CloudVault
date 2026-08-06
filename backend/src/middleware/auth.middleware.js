const { supabase } = require('../config/supabase');
const { sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Verify the Supabase JWT from the Authorization header.
 * Attaches the authenticated user to req.user on success.
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      logger.warn('Authentication failed:', error?.message);
      return sendError(res, 'Invalid or expired token', 401);
    }

    // Attach user to the request for downstream layers
    req.user = data.user;
    next();
  } catch (err) {
    logger.error('Authentication error:', err.message);
    return sendError(res, 'Authentication failed', 401);
  }
}

module.exports = { authenticate };
