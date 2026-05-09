import postsModule from './index';
import type { ErrorLike } from '../../lib/xhr';
import type { Post, PostsState } from './state';

/**
 * Selectors built on the module helpers (`module.select`, `module.lazySelect`)
 * so they reach into the module's slice without hard-coding the key it was
 * registered under. Renaming `createStore({ posts: ... })` → `{ feed: ... }`
 * would not break a single line below.
 *
 * `select` selectors are **eager**: evaluated on every render via
 * `mapSelectors`. They drive re-renders.
 *
 * `lazySelect` selectors are **parameterised**: exposed via
 * `mapLazySelectors` as a `(...args) => value` callable with a stable
 * function reference. They do NOT drive re-renders (since the wrapper
 * reference never changes); add an eager subscription if the component
 * needs to re-render on the underlying data.
 */

// --- eager ---------------------------------------------------------------

/** True while the GET /posts request is in flight. */
export const getIsLoading = postsModule.select(
  (slice: PostsState) => slice.list.loading
);

/**
 * Combined "is any write in flight?" flag. `XhrState<T>` tracks each
 * write call independently, but components mostly want a single boolean
 * to disable form buttons — that's what this composes.
 */
export const getIsSaving = postsModule.select(
  (slice: PostsState) =>
    slice.create.loading || slice.update.loading || slice.remove.loading
);

/**
 * First non-null error across every XHR slot. The user has one banner;
 * which underlying call failed is rarely interesting at the UI level. We
 * return the full `ErrorLike` so the renderer can branch on `name` /
 * `code` if it wants to.
 */
export const getError = postsModule.select(
  (slice: PostsState): ErrorLike | null =>
    slice.list.error ??
    slice.create.error ??
    slice.update.error ??
    slice.remove.error
);

/**
 * Memoised list of posts in their canonical order. `select` builds the
 * underlying selector with reselect, so as long as `list.data.byId` and
 * `list.data.allIds` are unchanged (immer guarantees this for unrelated
 * dispatches), the same array reference comes back — react-redux's shallow
 * check then skips the render.
 */
export const getPosts = postsModule.select((slice: PostsState): Post[] =>
  slice.list.data.allIds
    .map(id => slice.list.data.byId[id])
    .filter((p): p is Post => Boolean(p))
);

export const getPostCount = postsModule.select(
  (slice: PostsState) => slice.list.data.allIds.length
);

// --- lazy (parameterised) ------------------------------------------------

/**
 * Look up a single post by id. The cache key is `(slice, id)`, so:
 *
 * - Repeated lookups with the same id and same slice ref hit the cache and
 *   return the same Post reference — useful as a `useMemo`/`useEffect` dep.
 * - Unrelated dispatches (anything that doesn't change the posts slice
 *   reference) are cache hits.
 * - A dispatch that updates `byId` invalidates the cache and the next call
 *   recomputes.
 */
export const getPostById = postsModule.lazySelect(
  (slice: PostsState, id: number): Post | undefined =>
    slice.list.data.byId[id]
);

/**
 * Filter posts by a case-insensitive search needle against title + body.
 * Lazy because the needle is decided by the component (typed search box),
 * and we want the callable's reference to stay stable across re-renders so
 * passing it down to a memoised list row doesn't bust memoisation.
 */
export const getPostsMatching = postsModule.lazySelect(
  (slice: PostsState, needle: string): Post[] => {
    const q = needle.trim().toLowerCase();
    const all = slice.list.data.allIds
      .map(id => slice.list.data.byId[id])
      .filter((p): p is Post => Boolean(p));
    if (!q) return all;
    return all.filter(
      p =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q)
    );
  }
);
