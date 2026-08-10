const { supabaseAdmin } = require('../config/supabase');
const storageService = require('./storage.service');
const fileService = require('./file.service');
const logger = require('../config/logger');
const crypto = require('crypto');

class ShareService {
  /**
   * Generates a random short code of a given length.
   */
  _generateShortCode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i] % chars.length];
    }
    return result;
  }

  /**
   * Creates a new shared link for a file, or returns an existing one.
   */
  async createSharedLink(fileId, userId) {
    // 1. Verify the user owns the file
    await fileService.getFileById(fileId, userId);

    // 2. Check if a link already exists
    const { data: existing } = await supabaseAdmin
      .from('shared_links')
      .select('short_code')
      .eq('file_id', fileId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return existing.short_code;
    }

    // 3. Generate a unique short code and insert it
    const shortCode = this._generateShortCode();
    
    const { error } = await supabaseAdmin
      .from('shared_links')
      .insert({
        file_id: fileId,
        user_id: userId,
        short_code: shortCode,
      });

    if (error) {
      logger.error('Failed to create shared link:', error.message);
      throw new Error('Failed to create shared link');
    }

    return shortCode;
  }

  /**
   * Retrieves a file using a short code and returns a signed download URL.
   * This is a public method that bypasses the user ownership check.
   */
  async getSharedFileDownloadUrl(shortCode) {
    // 1. Find the shared link
    const { data: linkData, error: linkError } = await supabaseAdmin
      .from('shared_links')
      .select('file_id')
      .eq('short_code', shortCode)
      .single();

    if (linkError || !linkData) {
      logger.warn('Invalid or expired short code accessed:', shortCode);
      throw new Error('Invalid or expired share link');
    }

    // 2. Fetch the file metadata using the service role to bypass RLS, 
    // or we can use the backend admin credentials. 
    // fileService.getFileById is bound to a user, so we query directly here.
    const { data: file, error: fileError } = await supabaseAdmin
      .from('files')
      .select('*')
      .eq('id', linkData.file_id)
      .single();

    if (fileError || !file) {
      throw new Error('Shared file no longer exists');
    }

    // 3. Generate a signed URL for download
    const signedUrl = await storageService.getSignedUrl(file.storage_path);

    return {
      file: {
        id: file.id,
        original_name: file.original_name,
        size: file.size,
        mime_type: file.mime_type
      },
      downloadUrl: signedUrl
    };
  }
}

module.exports = new ShareService();
