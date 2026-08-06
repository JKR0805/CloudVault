const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { API_VERSION } = require('./utils/constants');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// ─── Route imports ────────────────────────────────
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const fileRoutes = require('./routes/file.routes');

// ─── App ──────────────────────────────────────────
const app = express();

// ─── Global middleware ────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── API routes ───────────────────────────────────
const prefix = `/api/${API_VERSION}`;

app.use(`${prefix}/health`, healthRoutes);
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/files`, fileRoutes);

// ─── Error handling (must be last) ────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
