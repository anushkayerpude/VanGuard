/**
 * VANGUARD — environment configuration.
 *
 * Design rule: the server MUST boot and serve a complete operational picture
 * with an entirely empty environment. Nothing here is required. A missing
 * GEMINI_API_KEY degrades AI synthesis to the deterministic engine rather than
 * failing the process — a demo that dies because a key is absent is a demo that
 * loses.
 */

import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env from the repo root first, then from server/, without overriding
// variables that are already present in the real environment.
for (const candidate of ['../.env', '.env']) {
  const path = resolve(process.cwd(), candidate);
  if (existsSync(path)) loadDotenv({ path, override: false });
}

function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(name: string, fallback: boolean): boolean {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase());
}

function str(name: string, fallback: string): string {
  const raw = process.env[name];
  return raw === undefined || raw.trim() === '' ? fallback : raw.trim();
}

export interface VanguardEnv {
  nodeEnv: string;
  port: number;
  host: string;
  corsOrigins: string[];

  /** Empty string when unset — AI synthesis then uses the deterministic engine. */
  geminiApiKey: string;
  geminiModel: string;
  geminiBaseUrl: string;
  /** False when no key is configured. */
  aiEnabled: boolean;

  /** Ollama local AI configuration */
  ollamaBaseUrl: string;
  ollamaModel: string;
  /** 'auto' | 'ollama' | 'gemini' | 'deterministic' */
  aiProvider: 'auto' | 'ollama' | 'gemini' | 'deterministic';
  ollamaEnabled: boolean;

  /** Master pipeline cadence, milliseconds. */
  tickIntervalMs: number;
  /** How often the live Open-Meteo feed is polled, milliseconds. */
  weatherPollIntervalMs: number;
  /** How often a fresh briefing is generated automatically, milliseconds. */
  briefingIntervalMs: number;

  /** Deterministic seed for the simulators — same seed, same demo, every time. */
  simSeed: number;
  /** Simulated events per tick, per simulated feed. */
  simIntensity: number;

  logLevel: 'debug' | 'info' | 'warn' | 'error';
  /** Enables /api/v1/simulation/* operator control endpoints. */
  enableSimulationApi: boolean;
}

const geminiApiKey = str('GEMINI_API_KEY', '').replace(/^your_.*_here$/i, '');
const ollamaBaseUrl = str('OLLAMA_BASE_URL', 'http://localhost:11434');
const ollamaModel = str('OLLAMA_MODEL', 'llama3.2:latest');
const rawAiProvider = str('AI_PROVIDER', 'auto').toLowerCase();
const aiProvider = (['auto', 'ollama', 'gemini', 'deterministic'].includes(rawAiProvider)
  ? rawAiProvider
  : 'auto') as VanguardEnv['aiProvider'];

export const env: VanguardEnv = {
  nodeEnv: str('NODE_ENV', 'development'),
  port: num('PORT', 3001),
  host: str('HOST', '0.0.0.0'),
  corsOrigins: str('CORS_ORIGINS', '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  geminiApiKey,
  geminiModel: str('GEMINI_MODEL', 'gemini-2.0-flash'),
  geminiBaseUrl: str('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
  aiEnabled: geminiApiKey.length > 0,

  ollamaBaseUrl,
  ollamaModel,
  aiProvider,
  ollamaEnabled: aiProvider === 'ollama' || aiProvider === 'auto',

  tickIntervalMs: num('TICK_INTERVAL_MS', 3_000),
  weatherPollIntervalMs: num('WEATHER_POLL_INTERVAL_MS', 120_000),
  briefingIntervalMs: num('BRIEFING_INTERVAL_MS', 45_000),

  simSeed: num('SIM_SEED', 20260908),
  simIntensity: num('SIM_INTENSITY', 1),

  logLevel: str('LOG_LEVEL', 'info') as VanguardEnv['logLevel'],
  enableSimulationApi: bool('ENABLE_SIMULATION_API', true),
};

/** One-line boot banner describing the effective configuration. */
export function describeEnv(): string {
  const activeDesc =
    env.aiProvider === 'ollama'
      ? `ollama (${env.ollamaModel})`
      : env.aiProvider === 'gemini'
      ? `gemini (${env.geminiModel})`
      : env.aiProvider === 'auto'
      ? `auto (ollama: ${env.ollamaModel} / gemini: ${env.geminiModel})`
      : 'deterministic';

  return [
    `env=${env.nodeEnv}`,
    `port=${env.port}`,
    `tick=${env.tickIntervalMs}ms`,
    `ai=${activeDesc}`,
    `seed=${env.simSeed}`,
  ].join(' | ');
}
