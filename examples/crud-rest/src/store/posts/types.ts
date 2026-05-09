/**
 * Action-type constants for the posts module.
 *
 * The split between **intent** actions and **lifecycle** actions is
 * intentional:
 *
 * - Intent actions (`FETCH`, `CREATE`, `UPDATE`, `DELETE`) are dispatched
 *   by components. They carry user input only — they do not touch the
 *   reducer. The corresponding sagas listen for them.
 *
 * - Lifecycle actions (`*_PENDING`, `*_FULFILLED`, `*_REJECTED`) are emitted
 *   by sagas with fully-formed payloads (temp ids, optimistic snapshots,
 *   rollback metadata) and consumed by the reducer.
 *
 * Keeping the two namespaces apart means the reducer never has to defensively
 * inspect "is this the user's intent or is it the saga's lifecycle event?".
 */
export const types = {
  // intent
  FETCH: 'posts/FETCH',
  CREATE: 'posts/CREATE',
  UPDATE: 'posts/UPDATE',
  DELETE: 'posts/DELETE',

  // lifecycle: list
  FETCH_PENDING: 'posts/FETCH_PENDING',
  FETCH_FULFILLED: 'posts/FETCH_FULFILLED',
  FETCH_REJECTED: 'posts/FETCH_REJECTED',

  // lifecycle: create
  CREATE_PENDING: 'posts/CREATE_PENDING',
  CREATE_FULFILLED: 'posts/CREATE_FULFILLED',
  CREATE_REJECTED: 'posts/CREATE_REJECTED',

  // lifecycle: update
  UPDATE_PENDING: 'posts/UPDATE_PENDING',
  UPDATE_FULFILLED: 'posts/UPDATE_FULFILLED',
  UPDATE_REJECTED: 'posts/UPDATE_REJECTED',

  // lifecycle: delete
  DELETE_PENDING: 'posts/DELETE_PENDING',
  DELETE_FULFILLED: 'posts/DELETE_FULFILLED',
  DELETE_REJECTED: 'posts/DELETE_REJECTED',

  // ui
  CLEAR_ERROR: 'posts/CLEAR_ERROR',
} as const;

export type PostsActionType = (typeof types)[keyof typeof types];
