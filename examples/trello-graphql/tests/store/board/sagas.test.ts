import { call, put } from 'redux-saga/effects';

import { gqlRequest } from '../../../src/graphql/client';
import {
  CREATE_TODO,
  DELETE_TODO,
  GET_TODOS,
  UPDATE_TODO,
} from '../../../src/graphql/documents';
import {
  cardToCompleted,
  createCardWorker,
  deleteCardWorker,
  fetchBoardWorker,
  moveCardWorker,
  nextTempId,
  renameCardWorker,
  todoToCard,
} from '../../../src/store/board/sagas';
import { types } from '../../../src/store/board/types';
import type { Card } from '../../../src/store/board/state';

const card = (overrides: Partial<Card> = {}): Card => ({
  id: '1',
  title: 'A',
  column: 'todo',
  assignee: null,
  ...overrides,
});

// --- helpers -------------------------------------------------------------

describe('helpers', () => {
  test('cardToCompleted maps "done" → true and everything else → false', () => {
    expect(cardToCompleted('done')).toBe(true);
    expect(cardToCompleted('todo')).toBe(false);
    expect(cardToCompleted('in-progress')).toBe(false);
  });

  test('todoToCard infers column from completed and copies assignee name', () => {
    expect(
      todoToCard({
        id: '1',
        title: 't',
        completed: false,
        user: { id: 'u', name: 'Alice' },
      })
    ).toEqual({ id: '1', title: 't', column: 'todo', assignee: 'Alice' });

    expect(
      todoToCard({ id: '2', title: 't', completed: true, user: null })
    ).toEqual({ id: '2', title: 't', column: 'done', assignee: null });
  });

  test('nextTempId is unique per call and prefixed with "temp-"', () => {
    const a = nextTempId();
    const b = nextTempId();
    expect(a.startsWith('temp-')).toBe(true);
    expect(a).not.toBe(b);
  });
});

// --- fetch ---------------------------------------------------------------

describe('fetchBoardWorker', () => {
  test('happy path: PENDING → call → FULFILLED with mapped cards', () => {
    const gen = fetchBoardWorker({ type: types.FETCH, limit: 5 });

    expect(gen.next().value).toEqual(put({ type: types.FETCH_PENDING }));
    expect(gen.next().value).toEqual(
      call(gqlRequest, GET_TODOS, { limit: 5 })
    );

    const data = {
      todos: {
        data: [
          { id: '1', title: 'a', completed: false },
          { id: '2', title: 'b', completed: true, user: { id: 'u', name: 'X' } },
        ],
      },
    };
    expect(gen.next(data).value).toEqual(
      put({
        type: types.FETCH_FULFILLED,
        cards: [
          card({ id: '1', title: 'a', column: 'todo' }),
          card({
            id: '2',
            title: 'b',
            column: 'done',
            assignee: 'X',
          }),
        ],
      })
    );
    expect(gen.next().done).toBe(true);
  });

  test('sad path: throws → REJECTED with message', () => {
    const gen = fetchBoardWorker({ type: types.FETCH, limit: 5 });
    gen.next(); // PENDING
    gen.next(); // call

    expect(gen.throw(new Error('down')).value).toEqual(
      put({ type: types.FETCH_REJECTED, error: 'down' })
    );
  });
});

// --- create --------------------------------------------------------------

describe('createCardWorker', () => {
  test('emits PENDING with a temp id, calls API, then FULFILLED with real id', () => {
    const gen = createCardWorker({
      type: types.CREATE,
      title: 'New',
      column: 'in-progress',
    });

    const pending = gen.next().value as any;
    expect(pending.type).toBe('PUT');
    expect(pending.payload.action.type).toBe(types.CREATE_PENDING);
    expect(pending.payload.action.tempId).toMatch(/^temp-/);
    expect(pending.payload.action.card).toMatchObject({
      id: pending.payload.action.tempId,
      title: 'New',
      column: 'in-progress',
    });

    const tempId = pending.payload.action.tempId;
    const apiCall = gen.next().value as any;
    expect(apiCall.type).toBe('CALL');
    expect(apiCall.payload.args[0]).toBe(CREATE_TODO);
    expect(apiCall.payload.args[1]).toEqual({
      input: { title: 'New', completed: false },
    });

    const data = { createTodo: { id: '99', title: 'New', completed: false } };
    expect(gen.next(data).value).toEqual(
      put({
        type: types.CREATE_FULFILLED,
        tempId,
        card: card({ id: '99', title: 'New', column: 'in-progress' }),
      })
    );
    expect(gen.next().done).toBe(true);
  });

  test('on rejection emits CREATE_REJECTED with the same tempId', () => {
    const gen = createCardWorker({
      type: types.CREATE,
      title: 'X',
      column: 'todo',
    });
    const pending = gen.next().value as any;
    const tempId = pending.payload.action.tempId;
    gen.next(); // call

    expect(gen.throw(new Error('nope')).value).toEqual(
      put({
        type: types.CREATE_REJECTED,
        tempId,
        column: 'todo',
        error: 'nope',
      })
    );
  });
});

// --- rename --------------------------------------------------------------

describe('renameCardWorker', () => {
  test('selects previous, puts PENDING, calls API, then FULFILLED', () => {
    const previous = card({ id: '1', title: 'old' });
    const gen = renameCardWorker({
      type: types.RENAME,
      cardId: '1',
      title: 'new',
    });

    expect((gen.next().value as any).type).toBe('SELECT');
    expect(gen.next(previous).value).toEqual(
      put({ type: types.RENAME_PENDING, cardId: '1', title: 'new' })
    );

    const apiCall = gen.next().value as any;
    expect(apiCall.payload.args[0]).toBe(UPDATE_TODO);
    expect(apiCall.payload.args[1]).toEqual({
      id: '1',
      input: { title: 'new' },
    });

    expect(gen.next({ updateTodo: { id: '1' } }).value).toEqual(
      put({ type: types.RENAME_FULFILLED, cardId: '1' })
    );
    expect(gen.next().done).toBe(true);
  });

  test('rolls back on failure', () => {
    const previous = card({ id: '1', title: 'old' });
    const gen = renameCardWorker({
      type: types.RENAME,
      cardId: '1',
      title: 'new',
    });
    gen.next();
    gen.next(previous);
    gen.next();

    expect(gen.throw(new Error('boom')).value).toEqual(
      put({
        type: types.RENAME_REJECTED,
        cardId: '1',
        previous,
        error: 'boom',
      })
    );
  });

  test('aborts cleanly when the card is gone', () => {
    const gen = renameCardWorker({
      type: types.RENAME,
      cardId: 'missing',
      title: 'x',
    });
    gen.next(); // SELECT
    expect(gen.next(undefined).done).toBe(true);
  });
});

// --- delete --------------------------------------------------------------

describe('deleteCardWorker', () => {
  test('captures previous + index, puts PENDING, calls API, FULFILLED', () => {
    const previous = card({ id: '7', column: 'done' });
    const gen = deleteCardWorker({ type: types.DELETE, cardId: '7' });

    expect((gen.next().value as any).type).toBe('SELECT');
    expect((gen.next(previous).value as any).type).toBe('SELECT');
    expect(gen.next(2).value).toEqual(
      put({
        type: types.DELETE_PENDING,
        cardId: '7',
        column: 'done',
      })
    );

    const apiCall = gen.next().value as any;
    expect(apiCall.payload.args[0]).toBe(DELETE_TODO);
    expect(apiCall.payload.args[1]).toEqual({ id: '7' });

    expect(gen.next({ deleteTodo: true }).value).toEqual(
      put({ type: types.DELETE_FULFILLED, cardId: '7' })
    );
    expect(gen.next().done).toBe(true);
  });

  test('treats `deleteTodo: false` as a failure', () => {
    const previous = card({ id: '7', column: 'done' });
    const gen = deleteCardWorker({ type: types.DELETE, cardId: '7' });
    gen.next();
    gen.next(previous);
    gen.next(0); // PENDING
    gen.next(); // call

    const rejected = gen.next({ deleteTodo: false }).value as any;
    expect(rejected.payload.action.type).toBe(types.DELETE_REJECTED);
    expect(rejected.payload.action.cardId).toBe('7');
    expect(rejected.payload.action.previous).toEqual(previous);
  });
});

// --- move ----------------------------------------------------------------

describe('moveCardWorker', () => {
  test('aborts when the card is missing', () => {
    const gen = moveCardWorker({
      type: types.MOVE,
      cardId: 'gone',
      toColumn: 'done',
    });
    gen.next();
    expect(gen.next(undefined).done).toBe(true);
  });

  test('skips the network call when source and target map to same completed', () => {
    const previous = card({ id: '1', column: 'todo' });
    const gen = moveCardWorker({
      type: types.MOVE,
      cardId: '1',
      toColumn: 'in-progress',
    });
    gen.next(); // SELECT card
    gen.next(previous); // SELECT fromIndex
    gen.next(0); // SELECT targetIndex
    expect((gen.next(0).value as any).payload.action.type).toBe(
      types.MOVE_PENDING
    );
    // Because both columns map to completed=false, the saga puts FULFILLED
    // directly with no `call`.
    expect(gen.next().value).toEqual(
      put({ type: types.MOVE_FULFILLED, cardId: '1' })
    );
    expect(gen.next().done).toBe(true);
  });

  test('moves to "done" → calls UPDATE_TODO with completed: true', () => {
    const previous = card({ id: '1', column: 'todo' });
    const gen = moveCardWorker({
      type: types.MOVE,
      cardId: '1',
      toColumn: 'done',
    });
    gen.next(); // SELECT card
    gen.next(previous); // SELECT fromIndex
    gen.next(0); // SELECT targetIndex
    gen.next(0); // PENDING

    const apiCall = gen.next().value as any;
    expect(apiCall.payload.args[0]).toBe(UPDATE_TODO);
    expect(apiCall.payload.args[1]).toEqual({
      id: '1',
      input: { completed: true },
    });

    expect(gen.next({ updateTodo: { id: '1' } }).value).toEqual(
      put({ type: types.MOVE_FULFILLED, cardId: '1' })
    );
  });

  test('rejection rolls back to the previous column + index', () => {
    const previous = card({ id: '1', column: 'todo' });
    const gen = moveCardWorker({
      type: types.MOVE,
      cardId: '1',
      toColumn: 'done',
    });
    gen.next(); // SELECT card
    gen.next(previous);
    gen.next(2); // fromIndex
    gen.next(0); // targetIndex
    gen.next(); // PENDING

    expect(gen.throw(new Error('nope')).value).toEqual(
      put({
        type: types.MOVE_REJECTED,
        cardId: '1',
        previous,
        fromColumn: 'todo',
        fromIndex: 2,
        error: 'nope',
      })
    );
  });
});
