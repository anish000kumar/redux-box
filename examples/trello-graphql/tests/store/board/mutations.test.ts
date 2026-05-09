import { produce } from 'immer';

import { mutations } from '../../../src/store/board/mutations';
import {
  emptyColumns,
  initialState,
  type Card,
} from '../../../src/store/board/state';
import { types } from '../../../src/store/board/types';

function apply(state: typeof initialState, action: any) {
  const fn = mutations[action.type];
  if (!fn) return state;
  return produce(state, draft => {
    fn(draft, action);
  });
}

const card = (overrides: Partial<Card> = {}): Card => ({
  id: '1',
  title: 'A',
  column: 'todo',
  assignee: null,
  ...overrides,
});

const stateWithCards = (...cards: Card[]) => {
  const cols = emptyColumns();
  const byId: Record<string, Card> = {};
  for (const c of cards) {
    byId[c.id] = c;
    cols[c.column].push(c.id);
  }
  return { ...initialState, byId, columns: cols };
};

// --- list ----------------------------------------------------------------

describe('mutations / FETCH', () => {
  test('FETCH_FULFILLED groups cards into the right columns', () => {
    const cards = [
      card({ id: '1', column: 'todo' }),
      card({ id: '2', column: 'done' }),
      card({ id: '3', column: 'in-progress' }),
    ];
    const next = apply(initialState, {
      type: types.FETCH_FULFILLED,
      cards,
    });
    expect(next.columns.todo).toEqual(['1']);
    expect(next.columns.done).toEqual(['2']);
    expect(next.columns['in-progress']).toEqual(['3']);
  });

  test('FETCH_REJECTED stores the message and clears loading', () => {
    const next = apply(
      { ...initialState, isLoading: true },
      { type: types.FETCH_REJECTED, error: 'boom' }
    );
    expect(next.isLoading).toBe(false);
    expect(next.error).toBe('boom');
  });
});

// --- create --------------------------------------------------------------

describe('mutations / CREATE', () => {
  test('CREATE_PENDING inserts the optimistic card at the top of its column', () => {
    const start = stateWithCards(card({ id: '1', column: 'todo' }));
    const optimistic = card({ id: 'temp', title: 'New', column: 'todo' });
    const next = apply(start, {
      type: types.CREATE_PENDING,
      tempId: 'temp',
      card: optimistic,
    });
    expect(next.columns.todo).toEqual(['temp', '1']);
    expect(next.byId['temp']).toEqual(optimistic);
    expect(next.pendingIds['temp']).toBe(true);
  });

  test('CREATE_FULFILLED swaps the temp id for the server id in place', () => {
    const optimistic = card({ id: 'temp', column: 'in-progress' });
    const start = apply(initialState, {
      type: types.CREATE_PENDING,
      tempId: 'temp',
      card: optimistic,
    });

    const real = card({ id: '99', column: 'in-progress' });
    const next = apply(start, {
      type: types.CREATE_FULFILLED,
      tempId: 'temp',
      card: real,
    });

    expect(next.columns['in-progress']).toEqual(['99']);
    expect(next.byId['temp']).toBeUndefined();
    expect(next.byId['99']).toEqual(real);
    expect(next.pendingIds['temp']).toBeUndefined();
  });

  test('CREATE_REJECTED removes the optimistic card and records the error', () => {
    const optimistic = card({ id: 'temp', column: 'todo' });
    const start = apply(initialState, {
      type: types.CREATE_PENDING,
      tempId: 'temp',
      card: optimistic,
    });

    const next = apply(start, {
      type: types.CREATE_REJECTED,
      tempId: 'temp',
      column: 'todo',
      error: 'nope',
    });
    expect(next.byId['temp']).toBeUndefined();
    expect(next.columns.todo).toEqual([]);
    expect(next.error).toBe('nope');
  });
});

// --- rename --------------------------------------------------------------

describe('mutations / RENAME', () => {
  test('RENAME_PENDING applies the new title in place', () => {
    const start = stateWithCards(card({ id: '1', title: 'old' }));
    const next = apply(start, {
      type: types.RENAME_PENDING,
      cardId: '1',
      title: 'new',
    });
    expect(next.byId['1']?.title).toBe('new');
    expect(next.pendingIds['1']).toBe(true);
  });

  test('RENAME_REJECTED restores the snapshot', () => {
    const previous = card({ id: '1', title: 'old' });
    const start = apply(stateWithCards(previous), {
      type: types.RENAME_PENDING,
      cardId: '1',
      title: 'new',
    });
    const next = apply(start, {
      type: types.RENAME_REJECTED,
      cardId: '1',
      previous,
      error: 'fail',
    });
    expect(next.byId['1']).toEqual(previous);
    expect(next.error).toBe('fail');
  });
});

// --- delete --------------------------------------------------------------

describe('mutations / DELETE', () => {
  test('DELETE_PENDING removes from byId and the column', () => {
    const start = stateWithCards(
      card({ id: '1', column: 'done' }),
      card({ id: '2', column: 'done' })
    );
    const next = apply(start, {
      type: types.DELETE_PENDING,
      cardId: '1',
      column: 'done',
    });
    expect(next.byId['1']).toBeUndefined();
    expect(next.columns.done).toEqual(['2']);
    expect(next.pendingIds['1']).toBe(true);
  });

  test('DELETE_REJECTED restores the card at its original index', () => {
    const a = card({ id: '1', column: 'todo' });
    const b = card({ id: '2', column: 'todo' });
    const c = card({ id: '3', column: 'todo' });
    const start = stateWithCards(a, b, c);

    const afterDelete = apply(start, {
      type: types.DELETE_PENDING,
      cardId: '2',
      column: 'todo',
    });

    const restored = apply(afterDelete, {
      type: types.DELETE_REJECTED,
      cardId: '2',
      previous: b,
      column: 'todo',
      index: 1,
      error: 'oops',
    });
    expect(restored.byId['2']).toEqual(b);
    expect(restored.columns.todo).toEqual(['1', '2', '3']);
    expect(restored.error).toBe('oops');
  });
});

// --- move ----------------------------------------------------------------

describe('mutations / MOVE', () => {
  test('MOVE_PENDING shifts the card to the target column at the given index', () => {
    const a = card({ id: '1', column: 'todo' });
    const b = card({ id: '2', column: 'todo' });
    const start = stateWithCards(a, b);

    const next = apply(start, {
      type: types.MOVE_PENDING,
      cardId: '1',
      toColumn: 'done',
      toIndex: 0,
    });

    expect(next.columns.todo).toEqual(['2']);
    expect(next.columns.done).toEqual(['1']);
    expect(next.byId['1']?.column).toBe('done');
    expect(next.pendingIds['1']).toBe(true);
  });

  test('MOVE_REJECTED restores the card at its original column + index', () => {
    const a = card({ id: '1', column: 'todo' });
    const b = card({ id: '2', column: 'todo' });
    const c = card({ id: '3', column: 'todo' });
    const start = stateWithCards(a, b, c);

    const moved = apply(start, {
      type: types.MOVE_PENDING,
      cardId: '2',
      toColumn: 'done',
      toIndex: 0,
    });

    const restored = apply(moved, {
      type: types.MOVE_REJECTED,
      cardId: '2',
      previous: b,
      fromColumn: 'todo',
      fromIndex: 1,
      error: 'oh',
    });

    expect(restored.columns.todo).toEqual(['1', '2', '3']);
    expect(restored.columns.done).toEqual([]);
    expect(restored.byId['2']?.column).toBe('todo');
    expect(restored.error).toBe('oh');
  });

  test('MOVE_PENDING is a no-op if the card no longer exists', () => {
    const next = apply(initialState, {
      type: types.MOVE_PENDING,
      cardId: 'gone',
      toColumn: 'done',
      toIndex: 0,
    });
    expect(next).toEqual(initialState);
  });
});

describe('mutations / CLEAR_ERROR', () => {
  test('clears the error field', () => {
    const next = apply(
      { ...initialState, error: 'boom' },
      { type: types.CLEAR_ERROR }
    );
    expect(next.error).toBeNull();
  });
});

describe('mutations / immutability', () => {
  test('an unrelated action returns the same reference', () => {
    const start = stateWithCards(card({ id: '1' }));
    const next = apply(start, { type: 'noop' });
    expect(next).toBe(start);
  });
});
