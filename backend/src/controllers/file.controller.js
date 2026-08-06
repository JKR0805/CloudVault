const fileService = require('../services/file.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

/**
 * FileController
 *
 * Handles HTTP for all /files endpoints.
 * Never touches Supabase directly — delegates everything to FileService.
 */
class FileController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return sendError(res, 'No file provided', 400);
      }

      const result = await fileService.uploadFile(req.user.id, req.file);

      return sendSuccess(res, 'File uploaded successfully', result, 201);
    } catch (err) {
      logger.error('Upload failed:', err.message);
      return sendError(res, err.message);
    }
  }

  async getFiles(req, res) {
    try {
      const files = await fileService.getFilesByUser(req.user.id);

      return sendSuccess(res, 'Files retrieved', files);
    } catch (err) {
      logger.error('getFiles failed:', err.message);
      return sendError(res, err.message);
    }
  }

  async getFile(req, res) {
    try {
      const file = await fileService.getFileById(req.params.id, req.user.id);

      return sendSuccess(res, 'File retrieved', file);
    } catch (err) {
      logger.error('getFile failed:', err.message);
      return sendError(res, err.message, 404);
    }
  }

  async downloadFile(req, res) {
    try {
      const { file, signedUrl } = await fileService.getDownloadUrl(
        req.params.id,
        req.user.id
      );

      return sendSuccess(res, 'Download URL generated', {
        file,
        downloadUrl: signedUrl,
      });
    } catch (err) {
      logger.error('downloadFile failed:', err.message);
      return sendError(res, err.message, 404);
    }
  }

  async deleteFile(req, res) {
    try {
      const deleted = await fileService.deleteFile(req.params.id, req.user.id);

      return sendSuccess(res, 'File deleted successfully', { id: deleted.id });
    } catch (err) {
      logger.error('deleteFile failed:', err.message);
      return sendError(res, err.message);
    }
  }

  async renameFile(req, res) {
    try {
      const { name } = req.body;

      if (!name || !name.trim()) {
        return sendError(res, 'New file name is required', 400);
      }

      const updated = await fileService.renameFile(
        req.params.id,
        req.user.id,
        name.trim()
      );

      return sendSuccess(res, 'File renamed successfully', updated);
    } catch (err) {
      logger.error('renameFile failed:', err.message);
      return sendError(res, err.message);
    }
  }
}

module.exports = new FileController();
