import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDB } from './db/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import rewardsRoutes from './routes/rewards.js';
import historyRoutes from './routes/history.js';
import machinesRoutes from './routes/machines.js';
import gamificationRoutes from './routes/gamification.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Middlewares ─────────────────────────────────────────────────────
app.use(helmet()); // Protège contre les failles Web classiques (XSS, Clickjacking...)

// Limite les requêtes pour empêcher les attaques Force Brute et DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par "window" (ici 15 minutes)
  message: 'Trop de requêtes depuis cette adresse IP, veuillez réessayer après 15 minutes.'
});
app.use(limiter);

// ─── Standard Middlewares ─────────────────────────────────────────────────────
app.use(cors()); // Allow all for development to avoid "Network Error"
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Init Database ────────────────────────────────────────────────────────────
initDB();

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/machines', machinesRoutes);
app.use('/api/gamification', gamificationRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🌱 EcoReward API running at http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
