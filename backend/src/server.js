const config = require('./config/env');
const app = require('./app');
const logger = require('./config/logger');

const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`CloudVault API running on port ${PORT}`);
  logger.info(`Environment: ${config.nodeEnv}`);
  logger.info(`Health check: http://localhost:${PORT}/api/v1/health`);
});
