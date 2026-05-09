import { delay, put, takeEvery, takeLatest } from 'redux-saga/effects';

import type { ErrorLike } from '../../lib/xhr';
import { types as postsTypes } from '../posts/types';
import { types } from './types';
import { dispatchers } from './dispatchers';

/**
 * Cross-module wiring: when a post lifecycle action lands, surface a toast
 * and clean up the relevant modal. Living here (instead of inside the posts
 * module) keeps the posts module focused on the entity store and lets the
 * UI module decide *how* CRUD outcomes are presented.
 */

function* onCreated() {
  yield put(dispatchers.closeEditor());
  yield put(dispatchers.showToast('success', 'Post created.'));
}

function* onUpdated() {
  yield put(dispatchers.closeEditor());
  yield put(dispatchers.showToast('success', 'Post updated.'));
}

function* onDeleted() {
  yield put(dispatchers.cancelConfirmDelete());
  yield put(dispatchers.showToast('success', 'Post deleted.'));
}

function* onRejected(action: { error?: ErrorLike }) {
  yield put(
    dispatchers.showToast(
      'error',
      action.error?.message ?? 'Something went wrong.'
    )
  );
}

/**
 * Auto-dismiss the toast after 3.5s. `takeLatest` guarantees a freshly
 * shown toast resets the timer instead of stacking timers.
 */
function* watchToastAutoDismiss() {
  yield delay(3500);
  yield put(dispatchers.dismissToast());
}

/**
 * Hand-rolled watchers (rather than `createSagas`) so we can subscribe to
 * actions across modules and pick the right take semantics per-event.
 */
function* uiRootSaga() {
  yield takeEvery(postsTypes.CREATE_FULFILLED, onCreated);
  yield takeEvery(postsTypes.UPDATE_FULFILLED, onUpdated);
  yield takeEvery(postsTypes.DELETE_FULFILLED, onDeleted);
  // `takeEvery`'s array overload exists at runtime but isn't reflected
  // in the typings for this version of redux-saga; the cast here keeps
  // the multi-pattern subscription concise without losing runtime
  // behaviour.
  yield takeEvery(
    [
      postsTypes.CREATE_REJECTED,
      postsTypes.UPDATE_REJECTED,
      postsTypes.DELETE_REJECTED,
      postsTypes.FETCH_REJECTED,
    ] as any,
    onRejected
  );
  yield takeLatest(types.SHOW_TOAST, watchToastAutoDismiss);
}

// Pass the generator function (factory) rather than an already-started
// generator instance, so each `createStore` call gets a fresh watcher.
// See `createSagas` in redux-box for the same pattern.
export const sagas = [uiRootSaga];
