const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

/**
 * Middleware that checks express-validator results.
 * Returns 400 with the first validation error if any exist.
 *
 * Usage in routes:
 *   router.post('/upload',
 *     [body('name').notEmpty().withMessage('Name is required')],
 *     validate,
 *     controller.handler
 *   );
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;
    return sendError(res, firstError, 400);
  }

  next();
}

module.exports = { validate };
