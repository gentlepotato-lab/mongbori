import type { DifficultyKey } from '../types';

export type DifficultyConfig = {
  baseSpeed: number;
  speedRamp: number;
  baseSpawnMs: number;
  spawnRampMs: number;
  minSpawnMs: number;
  lateralSpeed: number;
};

export const DIFFICULTY_CONFIG: Record<DifficultyKey, DifficultyConfig> = {
  easy: {
    baseSpeed: 70,
    speedRamp: 1.4,
    baseSpawnMs: 1400,
    spawnRampMs: 5,
    minSpawnMs: 650,
    lateralSpeed: 170
  },
  normal: {
    baseSpeed: 85,
    speedRamp: 1.8,
    baseSpawnMs: 1200,
    spawnRampMs: 6,
    minSpawnMs: 540,
    lateralSpeed: 200
  },
  hard: {
    baseSpeed: 100,
    speedRamp: 2.2,
    baseSpawnMs: 1000,
    spawnRampMs: 7,
    minSpawnMs: 450,
    lateralSpeed: 220
  }
};

export const getSpeed = (config: DifficultyConfig, elapsedSec: number, burstBoost: number) => {
  return config.baseSpeed + config.speedRamp * elapsedSec + burstBoost;
};

export const getSpawnInterval = (config: DifficultyConfig, elapsedSec: number) => {
  return Math.max(config.minSpawnMs, config.baseSpawnMs - config.spawnRampMs * elapsedSec);
};