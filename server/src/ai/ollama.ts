/**
 * VANGUARD — Local Ollama LLM client.
 *
 * Provides local neural inference for defensive situation briefings and
 * natural language command queries without external network dependencies.
 * Uses Ollama's /api/chat with grammar-constrained structured JSON output
 * matching VANGUARD's strict schema.
 */

import { OLLAMA_MAX_RETRIES, OLLAMA_TIMEOUT_MS } from '../config/constants.js';
import { env } from '../config/env.js';
import { createLogger } from '../util/logger.js';
import type { GenerateOptions, GenerateResult } from './gemini.js';

const log = createLogger('ai:ollama');

export class OllamaError extends Error {
  constructor(
    message: string,
    readonly retryable: boolean = false,
  ) {
    super(message);
    this.name = 'OllamaError';
  }
}

let cachedOllamaAvailable: { status: boolean; checkedAt: number } | null = null;
const CACHE_TTL_MS = 10_000;

/**
 * Check if the local Ollama daemon is reachable and responding.
 */
export async function isOllamaAvailable(): Promise<boolean> {
  const now = Date.now();
  if (cachedOllamaAvailable && now - cachedOllamaAvailable.checkedAt < CACHE_TTL_MS) {
    return cachedOllamaAvailable.status;
  }

  try {
    const res = await fetch(`${env.ollamaBaseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });
    const status = res.ok;
    cachedOllamaAvailable = { status, checkedAt: now };
    return status;
  } catch {
    cachedOllamaAvailable = { status: false, checkedAt: now };
    return false;
  }
}

/** Synchronous check if Ollama is enabled in config */
export const isOllamaConfigured = (): boolean => env.ollamaEnabled;

interface OllamaChatResponse {
  model?: string;
  message?: {
    role: string;
    content: string;
  };
  done?: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
  error?: string;
}

/**
 * Call local Ollama daemon and parse a structured JSON response conforming to schema.
 */
export async function generateStructuredOllama<T>(
  options: GenerateOptions,
): Promise<GenerateResult<T>> {
  const url = `${env.ollamaBaseUrl}/api/chat`;
  const model = options.model ?? env.ollamaModel;

  const body = {
    model,
    messages: [
      { role: 'system', content: options.systemInstruction },
      { role: 'user', content: options.prompt },
    ],
    format: options.schema,
    options: {
      temperature: options.temperature ?? 0.2,
      num_predict: options.maxOutputTokens ?? 3072,
    },
    stream: false,
  };

  let lastError: OllamaError = new OllamaError('No attempt was made', false);

  for (let attempt = 0; attempt <= OLLAMA_MAX_RETRIES; attempt++) {
    const started = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(OLLAMA_TIMEOUT_MS),
      });

      const json = (await response.json()) as OllamaChatResponse;

      if (!response.ok || json.error) {
        const message = json.error ?? `HTTP ${response.status}`;
        throw new OllamaError(`Ollama API error: ${message}`, response.status >= 500);
      }

      const text = json.message?.content;
      if (!text || text.trim().length === 0) {
        throw new OllamaError('Ollama returned empty response', true);
      }

      let data: T;
      try {
        data = JSON.parse(text) as T;
      } catch {
        const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/i, '$1').trim();
        try {
          data = JSON.parse(cleaned) as T;
        } catch {
          throw new OllamaError(`Ollama returned unparseable JSON: ${text.slice(0, 100)}`, true);
        }
      }

      const latencyMs = Date.now() - started;
      log.debug(`Ollama generation ok in ${latencyMs}ms with model ${model}`);

      return {
        data,
        model,
        latencyMs,
        usage: {
          promptTokens: json.prompt_eval_count,
          responseTokens: json.eval_count,
        },
      };
    } catch (error) {
      lastError =
        error instanceof OllamaError
          ? error
          : new OllamaError(
              error instanceof Error ? error.message : String(error),
              true,
            );

      log.warn(`Ollama attempt ${attempt + 1} failed: ${lastError.message}`);
      if (!lastError.retryable || attempt === OLLAMA_MAX_RETRIES) break;
      await sleep(500);
    }
  }

  throw lastError;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
