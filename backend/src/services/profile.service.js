const { supabaseAdmin } = require('../config/supabase');
const logger = require('../config/logger');

/**
 * ProfileService
 *
 * Single responsibility: application-level user data from the profiles table.
 * auth.users stores authentication; profiles stores everything else.
 */
class ProfileService {
  /**
   * Fetch the full profile for a user.
   */
  async getProfile(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Failed to fetch profile:', error.message);
      throw new Error('Profile not found');
    }

    return data;
  }

  /**
   * Update allowed profile fields.
   * Only whitelisted keys are written — everything else is silently dropped.
   */
  async updateProfile(userId, updates) {
    const allowedFields = ['full_name', 'avatar_url'];
    const sanitized = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitized[field] = updates[field];
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No valid fields to update');
    }

    sanitized.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(sanitized)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update profile:', error.message);
      throw new Error('Failed to update profile');
    }

    return data;
  }

  /**
   * Return storage usage stats for a user.
   */
  async getStorageUsage(userId) {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('storage_used, storage_limit')
      .eq('id', userId)
      .single();

    if (error) {
      logger.error('Failed to fetch storage usage:', error.message);
      throw new Error('Failed to retrieve storage usage');
    }

    return {
      used: data.storage_used,
      limit: data.storage_limit,
      percentage: parseFloat(
        ((data.storage_used / data.storage_limit) * 100).toFixed(2)
      ),
    };
  }
}

module.exports = new ProfileService();
