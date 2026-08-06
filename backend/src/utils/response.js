/**
 * Consistent API response helpers.
 *
 * Every endpoint returns:
 *   { success: true,  message: "...", data: {...} }
 *   { success: false, message: "..." }
 */

function sendSuccess(res, message, data = null, statusCode = 200) {
  const payload = { success: true, message };

  if (data !== null) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

function sendError(res, message, statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { sendSuccess, sendError };
