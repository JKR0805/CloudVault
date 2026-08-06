const { supabaseAdmin } = require('../config/supabase');
const storageService = require('./storage.service');
const logger = require('../config/logger');
const { generateStoredName, generateStoragePath } = require('../utils/helpers');
const config = require('../config/env');

/**
 * FileService
 *
 * Orchestrates file metadata (DB) and storage operations.
 * Enforces: storage first, then database. Rollback on failure.
 */
class FileService {
  // ─── Upload ──────────────────────────────────────

  /**
   * Upload a file: storage first, DB record second.
   * If the DB insert fails, the storage upload is rolled back.
   */
  async uploadFile(userId, file) {
    const storedName = generateStoredName(file.originalname);
    const storagePath = generateStoragePath(userId, storedName);

    // 1. Upload to Supabase Storage
    await storageService.uploadFile(storagePath, file.buffer, file.mimetype);

    // 2. Insert metadata into the files table
    const { data, error } = await supabaseAdmin
      .from('files')
      .insert({
        user_id: userId,
        original_name: file.originalname,
        stored_name: storedName,
        storage_path: storagePath,
        bucket_name: config.supabase.bucketName,
        mime_type: file.mimetype,
        size: file.size,
      })
      .select()
      .single();

    if (error) {
      // Rollback: remove the orphaned storage object
      logger.error('DB insert failed, rolling back storage:', error.message);
      await storageService.deleteFile(storagePath).catch((rollbackErr) => {
        logger.error('Storage rollback failed:', rollbackErr.message);
      });
      throw new Error('Failed to save file metadata');
    }

    // 3. Increment the user's storage_used counter
    await this._updateStorageUsed(userId, file.size);

    return data;
  }

  // ─── List ────────────────────────────────────────

  /**
   * List all files for a user, newest first.
   */
  async getFilesByUser(userId) {
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to list files:', error.message);
      throw new Error('Failed to retrieve files');
    }

    return data;
  }

  // ─── Get ─────────────────────────────────────────

  /**
   * Fetch a single file by ID. Includes owner check.
   */
  async getFileById(fileId, userId) {
    const { data, error } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (error) {
      logger.error('Failed to fetch file:', error.message);
      throw new Error('File not found');
    }

    return data;
  }

  // ─── Download ────────────────────────────────────

  /**
   * Generate a signed download URL for a file.
   * Backend never sends the actual bytes — Supabase does.
   */
  async getDownloadUrl(fileId, userId) {
    const file = await this.getFileById(fileId, userId);
    const signedUrl = await storageService.getSignedUrl(file.storage_path);

    return { file, signedUrl };
  }

  // ─── Delete ──────────────────────────────────────

  /**
   * Delete a file: verify owner → delete storage → delete DB.
   * Never delete the DB record first — avoids orphaned storage objects.
   */
  async deleteFile(fileId, userId) {
    const file = await this.getFileById(fileId, userId);

    // 1. Delete from storage first
    await storageService.deleteFile(file.storage_path);

    // 2. Delete the database record
    const { error } = await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (error) {
      logger.error('Failed to delete file record:', error.message);
      throw new Error('Failed to delete file record');
    }

    // 3. Decrement the user's storage_used counter
    await this._updateStorageUsed(userId, -file.size);

    return file;
  }

  // ─── Rename ──────────────────────────────────────

  /**
   * Rename a file (updates original_name in DB only).
   * The stored_name in Supabase Storage stays the same.
   */
  async renameFile(fileId, userId, newName) {
    // Verify ownership
    await this.getFileById(fileId, userId);

    const { data, error } = await supabaseAdmin
      .from('files')
      .update({
        original_name: newName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', fileId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to rename file:', error.message);
      throw new Error('Failed to rename file');
    }

    return data;
  }

  // ─── Internal ────────────────────────────────────

  /**
   * Update the storage_used counter on the user's profile.
   * Non-critical — logs a warning on failure but doesn't throw.
   */
  async _updateStorageUsed(userId, sizeChange) {
    try {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('storage_used')
        .eq('id', userId)
        .single();

      const currentUsage = profile?.storage_used || 0;
      const newUsage = Math.max(0, currentUsage + sizeChange);

      await supabaseAdmin
        .from('profiles')
        .update({
          storage_used: newUsage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (err) {
      logger.warn('Failed to update storage usage:', err.message);
    }
  }
}

module.exports = new FileService();
