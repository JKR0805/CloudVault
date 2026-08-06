const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = Router();

// ─── Public routes (no auth required) ─────────────

/**
 * POST /api/v1/auth/signup
 *
 * Register a new user with email + password.
 * Body: { email, password, full_name? }
 */
router.post('/signup', authController.signUp);

/**
 * POST /api/v1/auth/login
 *
 * Sign in with email + password.
 * Body: { email, password }
 * Returns: { user, session } — session contains access_token
 */
router.post('/login', authController.signIn);

/**
 * POST /api/v1/auth/reset-password
 *
 * Send a password reset email.
 * Body: { email }
 */
router.post('/reset-password', authController.resetPassword);

// ─── Authenticated routes ─────────────────────────

/**
 * POST /api/v1/auth/logout
 *
 * Invalidate the current session.
 * Requires a valid Supabase JWT in the Authorization header.
 */
router.post('/logout', authenticate, authController.signOut);

/**
 * GET /api/v1/auth/me
 *
 * Returns the authenticated user's profile + storage usage.
 * Requires a valid Supabase JWT.
 */
router.get('/me', authenticate, authController.getMe);

module.exports = router;
