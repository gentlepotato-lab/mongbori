import dotenv from 'dotenv';
import process from 'node:process';

dotenv.config();

const env = (key: string, fallback?: string) => {
  const value = process.env[key];
  return value !== undefined && value !== '' ? value : fallback;
};

const required = (key: string) => {
  const value = env(key);
  if (!value) {
    throw new Error(`Missing required env: ${key}`);
  }
  return value;
};

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: toNumber(env('PORT', '4000'), 4000),
  db: {
    host: env('DB_HOST', 'localhost') as string,
    port: toNumber(env('DB_PORT', '5432'), 5432),
    name: env('DB_NAME', 'postgres') as string,
    user: env('DB_USER', 'postgres') as string,
    pass: env('DB_PASS', 'postgres') as string
  },
  jwtSecret: required('JWT_SECRET'),
  corsOrigin: env('CORS_ORIGIN', '*') as string,
  dbInit: env('DB_INIT', '0') === '1'
};
