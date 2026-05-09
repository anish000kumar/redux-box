import { delay, put, takeEvery, takeLatest } from 'redux-saga/effects';

import { types as boardTypes } from '../board/types';
import { dispatchers } from './dispatchers';
import { types } from './types';

/**
 * Cross-module wiring: react to board lifecycle events with toasts and
 * tear-down of the relevant modal. Living here (not inside the board
 * module) keeps the board focused on the entity store and lets the UI
 * module decide *how* CRUD outcomes are presented.
 */

function* onCreated() {
  yield put(dispatchers.closeNewCard());
  yield put(dispatchers.showToast('success', 'Card added.'));
}

function* onRenamed() {
  yield put(dispatchers.cancelRename());
  yield put(dispatchers.showToast('success', 'Card renamed.'));
}

function* onDeleted() {
  yield put(dispatchers.cancelConfirmDelete());
  yield put(dispatchers.showToast('success', 'Card deleted.'));
}

function* onMoved() {
  yield put(dispatchers.endDrag());
}

function* onRejected(action: { error?: string }) {
  yield put(
    dispatchers.showToast('error', action.error ?? 'Something went wrong.')
  );
  yield put(dispatchers.endDrag());
}

function* watchToastAutoDismiss() {
  yield delay(3000);
  yield put(dispatchers.dismissToast());
}

function* uiRootSaga() {
  yield takeEvery(boardTypes.CREATE_FULFILLED, onCreated);
  yield takeEvery(boardTypes.RENAME_FULFILLED, onRenamed);
  yield takeEvery(boardTypes.DELETE_FULFILLED, onDeleted);
  yield takeEvery(boardTypes.MOVE_FULFILLED, onMoved);
  // The array overload exists at runtime but isn't reflected in the
  // typings for this version of redux-saga; the `as any` cast keeps
  // the multi-pattern subscription concise without losing runtime
  // behaviour.
  yield takeEvery(
    [
      boardTypes.CREATE_REJECTED,
      boardTypes.RENAME_REJECTED,
      boardTypes.DELETE_REJECTED,
      boardTypes.MOVE_REJECTED,
      boardTypes.FETCH_REJECTED,
    ] as any,
    onRejected
  );
  yield takeLatest(types.SHOW_TOAST, watchToastAutoDismiss);
}

// Pass the generator factory (function) rather than an already-started
// generator instance so each `createStore` call gets a fresh watcher.
export const sagas = [uiRootSaga];
