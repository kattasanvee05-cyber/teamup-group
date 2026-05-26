import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { env } from './config/env.js';
import authRoutes          from './routes/auth.routes.js';
import opportunitiesRoutes from './routes/opportunities.routes.js';
import internshipsRoutes   from './routes/internships.routes.js';
import applicationsRoutes  from './routes/applications.routes.js';
import projectsRoutes      from './routes/projects.routes.js';
import clubsRoutes         from './routes/clubs.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import studiesRoutes       from './routes/studies.routes.js';
import exchangeRoutes      from './routes/exchange.routes.js';
import uploadsRoutes       from './routes/uploads.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Auth-specific rate limit (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

// Global rate limit — high enough to accommodate polling
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth',          authLimiter, authRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/internships',   internshipsRoutes);
app.use('/api/applications',  applicationsRoutes);
app.use('/api/projects',      projectsRoutes);
app.use('/api/clubs',         clubsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/studies',      studiesRoutes);
app.use('/api/exchange',     exchangeRoutes);
app.use('/api/uploads',      uploadsRoutes);

// Serve React client build (SPA catch-all — must come after all API routes)
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // 404 only for API-only mode (no client build present)
  app.use(notFound);
}

app.use(errorHandler);

export default app;
