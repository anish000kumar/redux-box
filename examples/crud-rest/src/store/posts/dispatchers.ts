import type { PostDraft } from '../../api/posts';
import { types } from './types';
import type { Post } from './state';

/**
 * Pure action creators. These are the public, callable surface of the
 * module — components import them via `connectStore({ mapDispatchers })` and
 * never touch action-type strings directly.
 *
 * Only **intent** actions live here; the reducer has no handler for them
 * (sagas do). Lifecycle actions (`*_PENDING`, `*_FULFILLED`, `*_REJECTED`)
 * are emitted from sagas with fully-formed payloads — components never need
 * to construct one.
 */
export const dispatchers = {
  fetchPosts: () => ({ type: types.FETCH }) as const,

  createPost: (draft: PostDraft) =>
    ({ type: types.CREATE, draft }) as const,

  updatePost: (post: Post) =>
    ({ type: types.UPDATE, post }) as const,

  deletePost: (id: number) =>
    ({ type: types.DELETE, id }) as const,

  clearError: () => ({ type: types.CLEAR_ERROR }) as const,
};
