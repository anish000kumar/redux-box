/**
 * Tiny `fetch` wrapper used by every endpoint module under `src/api/`.
 *
 * Why a wrapper?
 *
 * - Centralises base URL, headers and JSON parsing so endpoint files stay
 *   declarative.
 * - Throws an `ApiError` on non-2xx responses so callers (and sagas) can use
 *   plain `try / catch`.
 * - Lets tests mock a single `fetch` instead of every endpoint individually.
 */

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
}

export async function request<T>(
  path: string,
  { method = 'GET', body, signal }: RequestOptions = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: body !== undefined ? { 'content-type': 'application/json' } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new ApiError(
      `${method} ${path} failed with status ${res.status}`,
      res.status
    );
  }

  // DELETE returns an empty body on JSONPlaceholder; bail out before parsing.
  if (res.status === 204 || method === 'DELETE') {
    return undefined as T;
  }

  return (await res.json()) as T;
}
