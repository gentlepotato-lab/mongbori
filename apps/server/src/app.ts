import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { authRouter } from './routes/auth';
import { runsRouter } from './routes/runs';
import { leaderboardRouter } from './routes/leaderboard';

export const app = express();

const corsOrigin = config.corsOrigin === '*'
  ? true
  : config.corsOrigin.split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/runs', runsRouter);
app.use('/api/leaderboard', leaderboardRouter);
