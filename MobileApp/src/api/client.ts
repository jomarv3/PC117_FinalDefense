import type { ApiError } from '@/types/api';

const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/+$/, '');
const apiKey = (process.env.EXPO_PUBLIC_LIBRARY_API_KEY ?? '').trim();

function ensureConfig() {
  if (!baseUrl) {
    throw new Error('Missing EXPO_PUBLIC_API_URL.');
  }

  if (!apiKey) {
    throw new Error('Missing EXPO_PUBLIC_LIBRARY_API_KEY.');
  }
}

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const searchParams = new URLSearchParams();

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      searchParams.set(key, String(value));
    });
  }

  const url = `${baseUrl}${cleanPath}`;
  const queryString = searchParams.toString();

  return queryString ? `${url}?${queryString}` : url;
}

function safeParseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message;
  }

  const errors = record.errors;

  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors as Record<string, unknown[]>)
      .flat()
      .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);

    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  return fallback;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
}

export function formatApiError(error: unknown, fallback: string): string {
  if (isApiError(error)) {
    if (error.errors) {
      const messages = Object.values(error.errors).flat().filter(Boolean);

      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    return error.message || fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function createApiError(status: number, payload: unknown): ApiError {
  return {
    status,
    message: extractMessage(payload, `Request failed with status ${status}.`),
    errors:
      payload && typeof payload === 'object' && 'errors' in payload
        ? (payload as ApiError).errors
        : undefined,
    raw: payload,
  };
}

export async function requestJson<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    query?: Record<string, string | number | boolean | null | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  ensureConfig();

  const url = buildUrl(path, options.query);
  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey,
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network request failed';

    throw new Error(
      `Cannot reach the library API at ${url}. Make sure your phone and PC are on the same Wi-Fi, Laravel is running with "composer run serve:lan", and Windows Firewall allows port 8000. (${message})`,
    );
  }

  const text = await response.text();
  const payload = text ? safeParseJson(text) : {};

  if (!response.ok) {
    throw createApiError(response.status, payload);
  }

  return payload as T;
}
