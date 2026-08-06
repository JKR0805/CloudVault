const authService = require('../services/auth.service');
const profileService = require('../services/profile.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * AuthController
 *
 * Handles all authentication endpoints:
 *   POST /auth/signup          — register a new user
 *   POST /auth/login           — sign in with email + password
 *   POST /auth/logout          — invalidate session (authenticated)
 *   POST /auth/reset-password  — send password reset email
 *   GET  /me                   — return the authenticated user's profile
 */
class AuthController {
  // ─── Public (no auth required) ──────────────────

  /**
   * POST /auth/signup
   * Body: { email, password, full_name? }
   */
  async signUp(req, res) {
    try {
      const { email, password, full_name } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      // Pass optional metadata — the DB trigger picks these up
      const metadata = {};
      if (full_name) metadata.full_name = full_name;

      const data = await authService.signUp(email, password, metadata);

      return sendSuccess(res, 'User registered successfully', {
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        session: data.session,
      }, 201);
    } catch (err) {
      logger.error('signUp failed:', err.message);
      return sendError(res, err.message, 400);
    }
  }

  /**
   * POST /auth/login
   * Body: { email, password }
   */
  async signIn(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
      }

      const data = await authService.signIn(email, password);

      return sendSuccess(res, 'Login successful', {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_in: data.session.expires_in,
          expires_at: data.session.expires_at,
        },
      });
    } catch (err) {
      logger.error('signIn failed:', err.message);
      return sendError(res, err.message, 401);
    }
  }

  /**
   * POST /auth/logout
   * Requires: Authorization header with a valid JWT
   */
  async signOut(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return sendError(res, 'No token provided', 401);
      }

      await authService.signOut(token);

      return sendSuccess(res, 'Logged out successfully');
    } catch (err) {
      logger.error('signOut failed:', err.message);
      return sendError(res, err.message);
    }
  }

  /**
   * POST /auth/reset-password
   * Body: { email }
   */
  async resetPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return sendError(res, 'Email is required', 400);
      }

      await authService.resetPassword(email);

      // Always return success to prevent email enumeration
      return sendSuccess(res, 'If an account exists with that email, a reset link has been sent');
    } catch (err) {
      logger.error('resetPassword failed:', err.message);
      // Still return success to prevent email enumeration
      return sendSuccess(res, 'If an account exists with that email, a reset link has been sent');
    }
  }

  // ─── Authenticated ─────────────────────────────

  /**
   * GET /me
   * Requires: Authorization header with a valid JWT
   */
  async getMe(req, res) {
    try {
      const profile = await profileService.getProfile(req.user.id);
      const storage = await profileService.getStorageUsage(req.user.id);

      return sendSuccess(res, 'User profile retrieved', {
        id: req.user.id,
        email: req.user.email,
        ...profile,
        storage,
      });
    } catch (err) {
      logger.error('getMe failed:', err.message);
      return sendError(res, err.message, 404);
    }
  }
}

module.exports = new AuthController();

