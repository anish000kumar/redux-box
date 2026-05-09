import {
  clearError,
  setData,
  setError,
  startLoading,
  type ErrorLike,
} from '../../lib/xhr';
import { types } from './types';
import type { Post, PostsState } from './state';

/**
 * Local mirror of the redux-box `Mutations` shape so the examples don't
 * reach into the library's internal types. A mutation is a plain function
 * that receives an immer draft + an action and mutates the draft in
 * place.
 */
type Mutations = Record<string, (state: any, action: any) => void>;

/**
 * Reducer pieces. Redux Box wraps each one in immer's `produce`, so the
 * `state` argument is a draft you can mutate in place.
 *
 * The CRUD flow uses an **optimistic update** strategy:
 *
 *   PENDING    → write the change locally with a temporary id (create) or
 *                snapshot the old value (update / delete)
 *   FULFILLED  → reconcile (swap the temp id for the real one, clear flags)
 *   REJECTED   → roll back to the snapshot and surface an error
 *
 * Both halves use the `XhrState<T>` slots on `state.{list,create,update,
 * remove}`: the slot tracks the *request* lifecycle (loading + error +
 * last response) while the entity cache (`state.list.data.byId/allIds`)
 * is mutated synchronously to drive the optimistic UI.
 */
export const mutations: Mutations = {
  // --- list ----------------------------------------------------------------

  [types.FETCH_PENDING]: (state: PostsState) => {
    startLoading(state.list);
  },

  [types.FETCH_FULFILLED]: (
    state: PostsState,
    action: { posts: Post[] }
  ) => {
    setData(state.list, {
      byId: Object.fromEntries(action.posts.map(p => [p.id, p])),
      allIds: action.posts.map(p => p.id),
    });
  },

  [types.FETCH_REJECTED]: (
    state: PostsState,
    action: { error: ErrorLike }
  ) => {
    setError(state.list, action.error);
  },

  // --- create (optimistic) -------------------------------------------------

  [types.CREATE_PENDING]: (
    state: PostsState,
    action: { tempId: number; post: Post }
  ) => {
    startLoading(state.create);
    state.list.data.byId[action.tempId] = action.post;
    state.list.data.allIds.unshift(action.tempId);
  },

  [types.CREATE_FULFILLED]: (
    state: PostsState,
    action: { tempId: number; post: Post }
  ) => {
    setData(state.create, action.post);
    delete state.list.data.byId[action.tempId];
    const idx = state.list.data.allIds.indexOf(action.tempId);
    if (idx !== -1) state.list.data.allIds[idx] = action.post.id;
    state.list.data.byId[action.post.id] = action.post;
  },

  [types.CREATE_REJECTED]: (
    state: PostsState,
    action: { tempId: number; error: ErrorLike }
  ) => {
    setError(state.create, action.error);
    delete state.list.data.byId[action.tempId];
    state.list.data.allIds = state.list.data.allIds.filter(
      id => id !== action.tempId
    );
  },

  // --- update (optimistic) -------------------------------------------------

  [types.UPDATE_PENDING]: (
    state: PostsState,
    action: { post: Post }
  ) => {
    startLoading(state.update);
    state.list.data.byId[action.post.id] = action.post;
  },

  [types.UPDATE_FULFILLED]: (
    state: PostsState,
    action: { post: Post }
  ) => {
    setData(state.update, action.post);
    state.list.data.byId[action.post.id] = action.post;
  },

  [types.UPDATE_REJECTED]: (
    state: PostsState,
    action: { previous: Post; error: ErrorLike }
  ) => {
    setError(state.update, action.error);
    state.list.data.byId[action.previous.id] = action.previous;
  },

  // --- delete (optimistic) -------------------------------------------------

  [types.DELETE_PENDING]: (
    state: PostsState,
    action: { id: number }
  ) => {
    startLoading(state.remove);
    delete state.list.data.byId[action.id];
    state.list.data.allIds = state.list.data.allIds.filter(
      id => id !== action.id
    );
  },

  [types.DELETE_FULFILLED]: (
    state: PostsState,
    action: { id: number }
  ) => {
    setData(state.remove, action.id);
  },

  [types.DELETE_REJECTED]: (
    state: PostsState,
    action: { previous: Post; index: number; error: ErrorLike }
  ) => {
    setError(state.remove, action.error);
    state.list.data.byId[action.previous.id] = action.previous;
    const insertAt = Math.min(
      Math.max(action.index, 0),
      state.list.data.allIds.length
    );
    state.list.data.allIds.splice(insertAt, 0, action.previous.id);
  },

  // --- error UI ------------------------------------------------------------

  /**
   * Clears every XHR slot's `error` field. Cheaper than asking the UI to
   * remember which slot the visible error came from — and matches what
   * "Dismiss" actually means to the user (make this banner go away).
   */
  [types.CLEAR_ERROR]: (state: PostsState) => {
    clearError(state.list);
    clearError(state.create);
    clearError(state.update);
    clearError(state.remove);
  },
};
