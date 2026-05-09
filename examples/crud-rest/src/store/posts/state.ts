import type { RemotePost } from '../../api/posts';
import { getInitialXhrState, type XhrState } from '../../lib/xhr';

/**
 * The domain shape of a post within the store. Kept identical to `RemotePost`
 * here, but a separate alias means we can grow the client-side model
 * (e.g. `dirty`, `pendingDelete`, `lastEditedAt`) without leaking into the
 * API layer.
 */
export type Post = RemotePost;

/**
 * Normalised entity cache for the posts list:
 *
 *   - O(1) lookup by id (`byId[id]`)
 *   - O(n) ordered iteration (`allIds.map(id => byId[id])`)
 *   - immer's structural sharing keeps unrelated references stable, so
 *     reselect-memoised selectors stay cheap when only one post changes.
 *
 * It lives inside `list.data` (an `XhrState<PostsCache>`) so the
 * read-from-server lifecycle (loading / error / data) is captured in a
 * single, consistent shape — the exact same shape we use for every other
 * XHR slot below.
 */
export interface PostsCache {
  byId: Record<number, Post>;
  allIds: number[];
}

/**
 * Posts state, organised as one `XhrState<T>` per logical XHR call.
 *
 *   list   ↔  GET    /posts        — `data` = the entity cache
 *   create ↔  POST   /posts        — `data` = last successfully saved post
 *   update ↔  PUT    /posts/:id    — `data` = last successfully saved post
 *   remove ↔  DELETE /posts/:id    — `data` = last successfully removed id
 *
 * Optimistic create / update / delete still mutate `list.data.byId` and
 * `list.data.allIds` directly — the entity cache is the single source of
 * truth for what the UI renders. The `create` / `update` / `remove`
 * slots track the *request* lifecycle (loading + error) for that
 * specific call so the UI can show per-operation feedback.
 *
 * For composite "is anything saving?" or "what error should I show?"
 * questions, see the derived selectors in `selectors.ts`.
 */
export interface PostsState {
  list: XhrState<PostsCache>;
  create: XhrState<Post | null>;
  update: XhrState<Post | null>;
  remove: XhrState<number | null>;
}

export const emptyCache = (): PostsCache => ({ byId: {}, allIds: [] });

export const initialState: PostsState = {
  list: getInitialXhrState<PostsCache>(emptyCache()),
  create: getInitialXhrState<Post | null>(null),
  update: getInitialXhrState<Post | null>(null),
  remove: getInitialXhrState<number | null>(null),
};
