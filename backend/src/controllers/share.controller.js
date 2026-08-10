const shareService = require('../services/share.service');
const { sendSuccess, sendError } = require('../utils/response');
const logger = require('../config/logger');

class ShareController {
  async createSharedLink(req, res) {
    try {
      const fileId = req.params.id;
      const userId = req.user.id;

      if (!fileId) {
        return sendError(res, 'File ID is required', 400);
      }

      const shortCode = await shareService.createSharedLink(fileId, userId);

      return sendSuccess(res, 'Shared link created successfully', { shortCode }, 201);
    } catch (err) {
      logger.error('createSharedLink failed:', err.message);
      return sendError(res, err.message);
    }
  }

  async getSharedFile(req, res) {
    try {
      const shortCode = req.params.shortCode;

      if (!shortCode) {
        return sendError(res, 'Short code is required', 400);
      }

      const fileData = await shareService.getSharedFileDownloadUrl(shortCode);

      return sendSuccess(res, 'Shared file retrieved', fileData);
    } catch (err) {
      logger.error('getSharedFile failed:', err.message);
      // Return 404 for invalid links so frontend knows it's broken
      return sendError(res, 'Invalid or expired share link', 404);
    }
  }
}

module.exports = new ShareController();
