const { supabaseAdmin } = require('../config/supabase');
const config = require('../config/env');
const logger = require('../config/logger');
const { DEFAULT_SIGNED_URL_EXPIRY } = require('../utils/constants');

/**
 * StorageService
 *
 * Single responsibility: Supabase Storage operations.
 * Upload, delete, signed URLs — nothing else.
 */
class StorageService {
  constructor() {
    this.bucket = config.supabase.bucketName;
  }

  /**
   * Upload a file buffer to Supabase Storage.
   */
  async uploadFile(storagePath, buffer, contentType) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(storagePath, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      logger.error('Storage upload failed:', error.message);
      throw new Error('Failed to upload file to storage');
    }

    return data;
  }

  /**
   * Delete a file from Supabase Storage.
   */
  async deleteFile(storagePath) {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove([storagePath]);

    if (error) {
      logger.error('Storage delete failed:', error.message);
      throw new Error('Failed to delete file from storage');
    }
  }

  /**
   * Generate a time-limited signed URL for downloading.
   */
  async getSignedUrl(storagePath, expiresIn = DEFAULT_SIGNED_URL_EXPIRY) {
    const { data, error } = await supabaseAdmin.storage
      .from(this.bucket)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      logger.error('Signed URL generation failed:', error.message);
      throw new Error('Failed to generate download URL');
    }

    return data.signedUrl;
  }
}

module.exports = new StorageService();
