import { call, put, select } from 'redux-saga/effects';
import { createSagas } from 'redux-box';

import { gqlRequest } from '../../graphql/client';
import {
  CREATE_TODO,
  DELETE_TODO,
  GET_TODOS,
  UPDATE_TODO,
  type CreateTodoData,
  type CreateTodoVariables,
  type DeleteTodoData,
  type DeleteTodoVariables,
  type GetTodosData,
  type RemoteTodo,
  type UpdateTodoData,
  type UpdateTodoVariables,
} from '../../graphql/documents';
import { types, type ColumnId } from './types';
import type { Card } from './state';

/**
 * The remote API only knows about a `completed: boolean` field. We have
 * three columns, so the rule is:
 *
 *   - "done"     ⇄ completed: true
 *   - everything else ⇄ completed: false
 *
 * "todo" vs "in-progress" is a client-side distinction. Moving a card
 * between those two columns still triggers an UPDATE saga (so the visible
 * loading flag is consistent), but the network call no-ops on the server
 * because `completed` doesn't change.
 */
export function cardToCompleted(column: ColumnId): boolean {
  return column === 'done';
}

export function todoToCard(t: RemoteTodo): Card {
  return {
    id: t.id,
    title: t.title,
    column: t.completed ? 'done' : 'todo',
    assignee: t.user?.name ?? null,
  };
}

export function nextTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}

// --- workers -------------------------------------------------------------

// Workers are typed as `Generator<any, any, any>` so the unit tests
// can step them by hand (`gen.next(value)`) with whichever value matches
// the yield point being fed — Card, RemoteTodo, response payload, etc.
export function* fetchBoardWorker(action: {
  type: typeof types.FETCH;
  limit: number;
}): Generator<any, any, any> {
  yield put({ type: types.FETCH_PENDING });
  try {
    const data: GetTodosData = yield call(gqlRequest, GET_TODOS, {
      limit: action.limit,
    });
    const cards = data.todos.data.map(todoToCard);
    yield put({ type: types.FETCH_FULFILLED, cards });
  } catch (error: unknown) {
    yield put({ type: types.FETCH_REJECTED, error: messageOf(error) });
  }
}

export function* createCardWorker(action: {
  type: typeof types.CREATE;
  title: string;
  column: ColumnId;
}): Generator<any, any, any> {
  const tempId = nextTempId();
  const optimistic: Card = {
    id: tempId,
    title: action.title,
    column: action.column,
    assignee: null,
  };

  yield put({ type: types.CREATE_PENDING, tempId, card: optimistic });

  try {
    const data: CreateTodoData = yield call(
      gqlRequest as <T, V extends object>(q: string, v?: V) => Promise<T>,
      CREATE_TODO,
      {
        input: {
          title: action.title,
          completed: cardToCompleted(action.column),
        },
      } satisfies CreateTodoVariables
    );

    const card: Card = {
      ...optimistic,
      id: data.createTodo.id,
    };
    yield put({ type: types.CREATE_FULFILLED, tempId, card });
  } catch (error: unknown) {
    yield put({
      type: types.CREATE_REJECTED,
      tempId,
      column: action.column,
      error: messageOf(error),
    });
  }
}

export function* renameCardWorker(action: {
  type: typeof types.RENAME;
  cardId: string;
  title: string;
}): Generator<any, any, any> {
  const previous: Card | undefined = yield select(
    (state: any) => state.board.byId[action.cardId]
  );
  if (!previous) return;

  yield put({
    type: types.RENAME_PENDING,
    cardId: action.cardId,
    title: action.title,
  });

  try {
    yield call(
      gqlRequest as <T, V extends object>(q: string, v?: V) => Promise<T>,
      UPDATE_TODO,
      {
        id: action.cardId,
        input: { title: action.title },
      } satisfies UpdateTodoVariables
    );
    yield put({ type: types.RENAME_FULFILLED, cardId: action.cardId });
  } catch (error: unknown) {
    yield put({
      type: types.RENAME_REJECTED,
      cardId: action.cardId,
      previous,
      error: messageOf(error),
    });
  }
}

export function* deleteCardWorker(action: {
  type: typeof types.DELETE;
  cardId: string;
}): Generator<any, any, any> {
  const previous: Card | undefined = yield select(
    (state: any) => state.board.byId[action.cardId]
  );
  if (!previous) return;

  const index: number = yield select((state: any) =>
    state.board.columns[previous.column].indexOf(action.cardId)
  );

  yield put({
    type: types.DELETE_PENDING,
    cardId: action.cardId,
    column: previous.column,
  });

  try {
    const data: DeleteTodoData = yield call(
      gqlRequest as <T, V extends object>(q: string, v?: V) => Promise<T>,
      DELETE_TODO,
      { id: action.cardId } satisfies DeleteTodoVariables
    );
    if (!data.deleteTodo) {
      throw new Error('Server refused to delete the card');
    }
    yield put({ type: types.DELETE_FULFILLED, cardId: action.cardId });
  } catch (error: unknown) {
    yield put({
      type: types.DELETE_REJECTED,
      cardId: action.cardId,
      previous,
      column: previous.column,
      index,
      error: messageOf(error),
    });
  }
}

export function* moveCardWorker(action: {
  type: typeof types.MOVE;
  cardId: string;
  toColumn: ColumnId;
  toIndex?: number;
}): Generator<any, any, any> {
  const previous: Card | undefined = yield select(
    (state: any) => state.board.byId[action.cardId]
  );
  if (!previous) return;
  const fromColumn = previous.column;
  if (fromColumn === action.toColumn && action.toIndex === undefined) {
    // No-op: dropped on the same column without specifying an index.
    return;
  }
  const fromIndex: number = yield select((state: any) =>
    state.board.columns[fromColumn].indexOf(action.cardId)
  );

  const targetIndex: number = yield select((state: any) =>
    action.toIndex ?? state.board.columns[action.toColumn].length
  );

  yield put({
    type: types.MOVE_PENDING,
    cardId: action.cardId,
    toColumn: action.toColumn,
    toIndex: targetIndex,
  });

  // If the new column maps to the same `completed` value as the old one,
  // we can skip the network call entirely — saves a round-trip when
  // shuffling between Todo and In Progress.
  if (cardToCompleted(action.toColumn) === cardToCompleted(fromColumn)) {
    yield put({ type: types.MOVE_FULFILLED, cardId: action.cardId });
    return;
  }

  try {
    const data: UpdateTodoData = yield call(
      gqlRequest as <T, V extends object>(q: string, v?: V) => Promise<T>,
      UPDATE_TODO,
      {
        id: action.cardId,
        input: { completed: cardToCompleted(action.toColumn) },
      } satisfies UpdateTodoVariables
    );
    if (!data?.updateTodo) {
      throw new Error('Server refused to update the card');
    }
    yield put({ type: types.MOVE_FULFILLED, cardId: action.cardId });
  } catch (error: unknown) {
    yield put({
      type: types.MOVE_REJECTED,
      cardId: action.cardId,
      previous,
      fromColumn,
      fromIndex,
      error: messageOf(error),
    });
  }
}

/**
 * Watchers. Reads (`FETCH`) use `takeLatest` so a refresh discards the
 * older response. Writes use `takeEvery` so multiple cards can be
 * mutated concurrently — Trello users drag two cards in quick succession
 * and expect both to land.
 */
export const sagas = createSagas({
  [types.FETCH]: fetchBoardWorker,
  [`${types.CREATE}__@every`]: createCardWorker,
  [`${types.RENAME}__@every`]: renameCardWorker,
  [`${types.DELETE}__@every`]: deleteCardWorker,
  [`${types.MOVE}__@every`]: moveCardWorker,
});
