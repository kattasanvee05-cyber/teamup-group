import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes          from './routes/auth.routes.js';
import opportunitiesRoutes from './routes/opportunities.routes.js';
import internshipsRoutes   from './routes/internships.routes.js';
import applicationsRoutes  from './routes/applications.routes.js';
import teamsRoutes         from './routes/teams.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import studiesRoutes       from './routes/studies.routes.js';
import exchangeRoutes      from './routes/exchange.routes.js';
import uploadsRoutes       from './routes/uploads.routes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/internships',   internshipsRoutes);
app.use('/api/applications',  applicationsRoutes);
app.use('/api/teams',         teamsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/studies',      studiesRoutes);
app.use('/api/exchange',     exchangeRoutes);
app.use('/api/uploads',      uploadsRoutes);

// 404 + Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
