/**
 * `XhrState<T>` is the canonical shape we keep in the store for *any* async
 * request. Both examples follow the same convention so a slice that wraps
 * "fetch posts" looks identical to one that wraps "rename card":
 *
 *   posts: {
 *     list:   XhrState<EntityCache<Post>>   // GET /posts
 *     create: XhrState<Post | null>          // POST /posts
 *     update: XhrState<Post | null>          // PUT /posts/:id
 *     remove: XhrState<number | null>        // DELETE /posts/:id
 *   }
 *
 * - `data`    is the most recently *successful* response (or whatever
 *             initial value made sense for that slot — `null` for "nothing
 *             yet" or an empty cache for normalised reads).
 * - `error`   is `null` while things are healthy and an `ErrorLike` once
 *             a request rejects. The next PENDING clears it.
 * - `loading` flips to `true` between PENDING and FULFILLED/REJECTED.
 *
 * Reducers should treat the three fields as a unit: every PENDING clears
 * `error`, every FULFILLED clears both `loading` *and* `error`, every
 * REJECTED clears `loading` and sets `error`. The helpers in this module
 * encode that contract so individual reducers don't drift.
 *
 * NOTE: kept as a tiny, dependency-free local module so this example can
 * be copied out of the repo as a standalone starter. The Trello example
 * ships an identical copy.
 */
export interface XhrState<T> {
  data: T;
  error: ErrorLike | null;
  loading: boolean;
}

/**
 * The narrowed, *serialisable* shape we persist for any thrown JS error.
 *
 * Real `Error` instances are not safe to keep in Redux state — they're
 * not serialisable, carry a noisy `stack`, and Redux DevTools will warn
 * when it sees one. `ErrorLike` is what reducers actually store; sagas
 * normalise their `catch` payloads through `toErrorLike()` before they
 * dispatch a `*_REJECTED` action.
 *
 * Fields:
 *   - `name`    `Error.name` if available, else `'UnknownError'`. Lets
 *               callers branch on `'ApiError'` / `'GraphQLError'` etc.
 *   - `message` Always present, always a string.
 *   - `code`    Optional numeric/string code (HTTP status, GraphQL
 *               error code, etc.). Useful for retry policies.
 */
export interface ErrorLike {
  name: string;
  message: string;
  code?: string | number;
}

/** Initial value for any XHR slot — nothing in flight, no error yet. */
export function getInitialXhrState<T>(initialData: T): XhrState<T> {
  return { data: initialData, error: null, loading: false };
}

/**
 * In-place mutators for use inside an immer `produce` reducer. They keep
 * the three-field contract (PENDING clears error, FULFILLED clears
 * loading + error, REJECTED clears loading + sets error) in one spot so
 * individual reducers don't have to remember it.
 */
export function startLoading<T>(slot: XhrState<T>): void {
  slot.loading = true;
  slot.error = null;
}

export function setData<T>(slot: XhrState<T>, data: T): void {
  slot.loading = false;
  slot.error = null;
  slot.data = data;
}

export function setError<T>(slot: XhrState<T>, error: ErrorLike): void {
  slot.loading = false;
  slot.error = error;
}

export function clearError<T>(slot: XhrState<T>): void {
  slot.error = null;
}

/**
 * Normalise *any* thrown value into an `ErrorLike`. The four cases we
 * actually see at runtime are:
 *
 *   1. `Error` (and subclasses like `ApiError`, `GraphQLError`,
 *      `TypeError`) — copy `name` + `message`, lift `status`/`code` if
 *      present.
 *   2. A plain object that *quacks* like an error (`{ message: '...' }`).
 *      `fetch` polyfills, GraphQL clients and 3rd-party SDKs sometimes
 *      throw these.
 *   3. A bare string (`throw 'oops'`). Rare but valid JS.
 *   4. Anything else (`throw 42`, `throw null`) — we fall back to
 *      `'Unknown error'` so the UI never shows `undefined`.
 *
 * The result is always safe to put in Redux state and always renderable
 * with `error.message`.
 */
export function toErrorLike(thrown: unknown): ErrorLike {
  if (thrown instanceof Error) {
    const code = numericOrStringField(thrown, ['status', 'code']);
    return {
      name: thrown.name || 'Error',
      message: thrown.message || 'Unknown error',
      ...(code !== undefined ? { code } : {}),
    };
  }
  if (thrown && typeof thrown === 'object') {
    const obj = thrown as Record<string, unknown>;
    const message =
      typeof obj.message === 'string' && obj.message.length > 0
        ? obj.message
        : 'Unknown error';
    const name =
      typeof obj.name === 'string' && obj.name.length > 0
        ? obj.name
        : 'Error';
    const code = numericOrStringField(obj, ['status', 'code']);
    return code !== undefined ? { name, message, code } : { name, message };
  }
  if (typeof thrown === 'string' && thrown.length > 0) {
    return { name: 'Error', message: thrown };
  }
  return { name: 'UnknownError', message: 'Unknown error' };
}

function numericOrStringField(
  src: object,
  keys: readonly string[]
): string | number | undefined {
  for (const key of keys) {
    const v = (src as Record<string, unknown>)[key];
    if (typeof v === 'string' || typeof v === 'number') return v;
  }
  return undefined;
}
