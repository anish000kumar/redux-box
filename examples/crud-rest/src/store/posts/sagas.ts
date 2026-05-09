import { call, put, select } from 'redux-saga/effects';
import { createSagas } from 'redux-box';

import { postsApi, type RemotePost, type PostDraft } from '../../api/posts';
import { toErrorLike } from '../../lib/xhr';
import { types } from './types';
import type { Post } from './state';

/**
 * Workers are split out (rather than inlined into `createSagas`) for two
 * reasons:
 *
 *   1. Each worker can be unit-tested in isolation by stepping its generator
 *      manually with `.next()` / `.throw()`.
 *   2. Action payload shapes stay self-documenting at the worker signature.
 *
 * The dispatch flow is consistent across all four workers:
 *
 *   intent action     ──▶  saga puts PENDING (with optimistic payload)
 *                          saga calls api
 *                          on success: saga puts FULFILLED
 *                          on failure: saga puts REJECTED with an
 *                                      `ErrorLike` (via `toErrorLike`)
 *                                      so the reducer can store it as-is.
 */

// Workers are typed as `Generator<any, any, any>` so manual stepping in
// the unit tests (`gen.next(value)`) doesn't fight redux-saga's effect
// types — `value` can be a Post, an array, an index, etc., depending on
// which yield point we're feeding.
export function* fetchPostsWorker(): Generator<any, any, any> {
  yield put({ type: types.FETCH_PENDING });
  try {
    const posts: RemotePost[] = yield call(postsApi.list);
    yield put({ type: types.FETCH_FULFILLED, posts });
  } catch (error: unknown) {
    yield put({ type: types.FETCH_REJECTED, error: toErrorLike(error) });
  }
}

/**
 * Negative ids are used as **temporary** ids for optimistically-inserted
 * posts. They never collide with JSONPlaceholder ids (always positive) and
 * sort to the top, so the freshly-created post appears at the start of the
 * list immediately. `Date.now()` keeps temp ids monotonically unique even
 * across rapid clicks.
 */
export function nextTempId(): number {
  return -Date.now();
}

export function* createPostWorker(action: {
  type: typeof types.CREATE;
  draft: PostDraft;
}): Generator<any, any, any> {
  const tempId = nextTempId();
  const optimistic: Post = { id: tempId, ...action.draft };

  yield put({ type: types.CREATE_PENDING, tempId, post: optimistic });

  try {
    const saved: RemotePost = yield call(postsApi.create, action.draft);
    yield put({ type: types.CREATE_FULFILLED, tempId, post: saved });
  } catch (error: unknown) {
    yield put({
      type: types.CREATE_REJECTED,
      tempId,
      error: toErrorLike(error),
    });
  }
}

export function* updatePostWorker(action: {
  type: typeof types.UPDATE;
  post: Post;
}): Generator<any, any, any> {
  const previous: Post | undefined = yield select(
    (state: any) => state.posts.list.data.byId[action.post.id]
  );
  if (!previous) return;

  yield put({ type: types.UPDATE_PENDING, post: action.post });

  try {
    const saved: RemotePost = yield call(postsApi.update, action.post);
    yield put({ type: types.UPDATE_FULFILLED, post: saved });
  } catch (error: unknown) {
    yield put({
      type: types.UPDATE_REJECTED,
      previous,
      error: toErrorLike(error),
    });
  }
}

export function* deletePostWorker(action: {
  type: typeof types.DELETE;
  id: number;
}): Generator<any, any, any> {
  const previous: Post | undefined = yield select(
    (state: any) => state.posts.list.data.byId[action.id]
  );
  const index: number = yield select((state: any) =>
    state.posts.list.data.allIds.indexOf(action.id)
  );
  if (!previous || index === -1) return;

  yield put({ type: types.DELETE_PENDING, id: action.id });

  try {
    yield call(postsApi.remove, action.id);
    yield put({ type: types.DELETE_FULFILLED, id: action.id });
  } catch (error: unknown) {
    yield put({
      type: types.DELETE_REJECTED,
      previous,
      index,
      error: toErrorLike(error),
    });
  }
}

/**
 * Watchers. `createSagas` defaults to `takeLatest`, which is what we want
 * for the read (a duplicate refresh discards the older response). For the
 * writes we opt into `takeEvery` via the `__@every` suffix so rapid clicks
 * — "delete this", "delete that", "create another" — all run to completion
 * instead of cancelling each other.
 */
export const sagas = createSagas({
  [types.FETCH]: fetchPostsWorker,
  [`${types.CREATE}__@every`]: createPostWorker,
  [`${types.UPDATE}__@every`]: updatePostWorker,
  [`${types.DELETE}__@every`]: deletePostWorker,
});
