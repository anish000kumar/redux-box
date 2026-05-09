import { produce } from 'immer';

import { mutations } from '../../../src/store/posts/mutations';
import { initialState, type Post } from '../../../src/store/posts/state';
import { types } from '../../../src/store/posts/types';

/**
 * Tiny helper: applies a mutation through immer and returns the next state,
 * exactly as redux-box would in production.
 */
function apply(
  state: typeof initialState,
  action: { type: string; [k: string]: any }
) {
  const fn = mutations[action.type];
  if (!fn) return state;
  return produce(state, draft => {
    fn(draft, action);
  });
}

const post = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
  ...overrides,
});

const stateWith = (...posts: Post[]) =>
  posts.reduce<typeof initialState>(
    (acc, p) => ({
      ...acc,
      byId: { ...acc.byId, [p.id]: p },
      allIds: [...acc.allIds, p.id],
    }),
    initialState
  );

// --- list ----------------------------------------------------------------

describe('mutations / FETCH', () => {
  test('FETCH_PENDING sets loading and clears any prior error', () => {
    const next = apply(
      { ...initialState, error: 'oops' },
      { type: types.FETCH_PENDING }
    );
    expect(next.isLoading).toBe(true);
    expect(next.error).toBeNull();
  });

  test('FETCH_FULFILLED replaces byId/allIds with the new payload', () => {
    const a = post({ id: 1, title: 'A' });
    const b = post({ id: 2, title: 'B' });
    const next = apply(initialState, {
      type: types.FETCH_FULFILLED,
      posts: [a, b],
    });
    expect(next.isLoading).toBe(false);
    expect(next.allIds).toEqual([1, 2]);
    expect(next.byId).toEqual({ 1: a, 2: b });
  });

  test('FETCH_REJECTED stores the error message', () => {
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
  test('CREATE_PENDING inserts the optimistic post at the top of allIds', () => {
    const existing = post({ id: 1, title: 'A' });
    const optimistic = post({ id: -42, title: 'New' });

    const next = apply(stateWith(existing), {
      type: types.CREATE_PENDING,
      tempId: -42,
      post: optimistic,
    });

    expect(next.isSaving).toBe(true);
    expect(next.allIds).toEqual([-42, 1]);
    expect(next.byId[-42]).toEqual(optimistic);
  });

  test('CREATE_FULFILLED swaps the temp id for the server id in place', () => {
    const optimistic = post({ id: -42, title: 'New' });
    const saved = post({ id: 101, title: 'New' });
    const start = apply(initialState, {
      type: types.CREATE_PENDING,
      tempId: -42,
      post: optimistic,
    });

    const next = apply(start, {
      type: types.CREATE_FULFILLED,
      tempId: -42,
      post: saved,
    });

    expect(next.isSaving).toBe(false);
    expect(next.allIds).toEqual([101]);
    expect(next.byId[101]).toEqual(saved);
    expect(next.byId[-42]).toBeUndefined();
  });

  test('CREATE_REJECTED removes the optimistic insert and surfaces the error', () => {
    const optimistic = post({ id: -42, title: 'New' });
    const start = apply(stateWith(post({ id: 1 })), {
      type: types.CREATE_PENDING,
      tempId: -42,
      post: optimistic,
    });

    const next = apply(start, {
      type: types.CREATE_REJECTED,
      tempId: -42,
      error: 'nope',
    });

    expect(next.isSaving).toBe(false);
    expect(next.error).toBe('nope');
    expect(next.allIds).toEqual([1]);
    expect(next.byId[-42]).toBeUndefined();
  });
});

// --- update --------------------------------------------------------------

describe('mutations / UPDATE', () => {
  test('UPDATE_PENDING applies the new fields immediately', () => {
    const start = stateWith(post({ id: 1, title: 'old' }));
    const next = apply(start, {
      type: types.UPDATE_PENDING,
      post: post({ id: 1, title: 'new' }),
    });
    expect(next.isSaving).toBe(true);
    expect(next.byId[1]?.title).toBe('new');
  });

  test('UPDATE_REJECTED restores the snapshot', () => {
    const previous = post({ id: 1, title: 'old' });
    const start = apply(stateWith(previous), {
      type: types.UPDATE_PENDING,
      post: post({ id: 1, title: 'new' }),
    });
    const next = apply(start, {
      type: types.UPDATE_REJECTED,
      previous,
      error: 'nope',
    });
    expect(next.isSaving).toBe(false);
    expect(next.error).toBe('nope');
    expect(next.byId[1]).toEqual(previous);
  });
});

// --- delete --------------------------------------------------------------

describe('mutations / DELETE', () => {
  test('DELETE_PENDING removes the post from byId and allIds', () => {
    const start = stateWith(post({ id: 1 }), post({ id: 2 }));
    const next = apply(start, { type: types.DELETE_PENDING, id: 1 });
    expect(next.isSaving).toBe(true);
    expect(next.byId[1]).toBeUndefined();
    expect(next.allIds).toEqual([2]);
  });

  test('DELETE_REJECTED restores the post at its original index', () => {
    const a = post({ id: 1, title: 'A' });
    const b = post({ id: 2, title: 'B' });
    const c = post({ id: 3, title: 'C' });
    const start = stateWith(a, b, c);
    const afterDelete = apply(start, {
      type: types.DELETE_PENDING,
      id: 2,
    });
    const restored = apply(afterDelete, {
      type: types.DELETE_REJECTED,
      previous: b,
      index: 1,
      error: 'nope',
    });

    expect(restored.error).toBe('nope');
    expect(restored.byId[2]).toEqual(b);
    expect(restored.allIds).toEqual([1, 2, 3]);
  });

  test('DELETE_REJECTED clamps an out-of-bounds index to the end', () => {
    const a = post({ id: 1 });
    const start = stateWith(a);
    const next = apply(start, {
      type: types.DELETE_REJECTED,
      previous: post({ id: 99 }),
      index: 999,
      error: 'nope',
    });
    expect(next.allIds).toEqual([1, 99]);
  });
});

// --- error UI ------------------------------------------------------------

describe('mutations / CLEAR_ERROR', () => {
  test('CLEAR_ERROR resets the error field', () => {
    const next = apply(
      { ...initialState, error: 'something' },
      { type: types.CLEAR_ERROR }
    );
    expect(next.error).toBeNull();
  });
});

// --- immutability check --------------------------------------------------

describe('mutations / immutability', () => {
  test('an unrelated action returns the same reference', () => {
    const start = stateWith(post({ id: 1 }));
    const next = apply(start, { type: 'something/UNRELATED' });
    expect(next).toBe(start);
  });

  test('byId reference is preserved when only `isSaving` flips', () => {
    const start = stateWith(post({ id: 1 }));
    const next = apply(start, { type: types.DELETE_FULFILLED });
    expect(next.byId).toBe(start.byId);
    expect(next.allIds).toBe(start.allIds);
  });
});
