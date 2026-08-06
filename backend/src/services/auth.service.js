const { supabase } = require('../config/supabase');
const logger = require('../config/logger');

/**
 * AuthService
 *
 * Handles the full authentication lifecycle via Supabase Auth:
 *   • Sign up (email + password)
 *   • Sign in (email + password)
 *   • Sign out (invalidate session)
 *   • Password reset (send reset email)
 *   • JWT verification (for the auth middleware)
 */
class AuthService {
  /**
   * Verify a Supabase JWT and return the user object.
   */
  async verifyToken(token) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      logger.warn('Token verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }

    return data.user;
  }

  /**
   * Register a new user with email and password.
   * Supabase Auth creates the auth.users row, and the on_auth_user_created
   * trigger automatically creates the matching profiles row.
   *
   * @param {string} email
   * @param {string} password
   * @param {object} [metadata] - Optional user metadata (full_name, avatar_url)
   * @returns {{ user, session }} The created user and session
   */
  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // → stored in raw_user_meta_data, picked up by the trigger
      },
    });

    if (error) {
      logger.error('Sign-up failed:', error.message);
      throw new Error(error.message);
    }

    logger.info(`User signed up: ${email}`);
    return data;
  }

  /**
   * Sign in an existing user with email and password.
   *
   * @param {string} email
   * @param {string} password
   * @returns {{ user, session }} The authenticated user and session (contains access_token)
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn('Sign-in failed:', error.message);
      throw new Error(error.message);
    }

    logger.info(`User signed in: ${email}`);
    return data;
  }

  /**
   * Sign out the current user by invalidating their session.
   * Requires a valid JWT in the Authorization header.
   *
   * @param {string} token - The user's access token
   */
  async signOut(token) {
    // Set the session so Supabase knows which user to sign out
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: '',
    });

    if (sessionError) {
      logger.warn('Failed to set session for sign-out:', sessionError.message);
      // Continue with sign-out attempt anyway
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error('Sign-out failed:', error.message);
      throw new Error('Failed to sign out');
    }

    logger.info('User signed out');
  }

  /**
   * Send a password reset email.
   * Supabase handles the email delivery and reset flow.
   *
   * @param {string} email
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      logger.error('Password reset request failed:', error.message);
      throw new Error(error.message);
    }

    logger.info(`Password reset email sent to: ${email}`);
  }
}

module.exports = new AuthService();
