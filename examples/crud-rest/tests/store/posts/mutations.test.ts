import { produce } from 'immer';

import type { ErrorLike } from '../../../src/lib/xhr';
import { mutations } from '../../../src/store/posts/mutations';
import {
  initialState,
  type Post,
  type PostsState,
} from '../../../src/store/posts/state';
import { types } from '../../../src/store/posts/types';

/**
 * Tiny helper: applies a mutation through immer and returns the next state,
 * exactly as redux-box would in production.
 */
function apply(
  state: PostsState,
  action: { type: string; [k: string]: any }
): PostsState {
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

const err = (message: string): ErrorLike => ({ name: 'Error', message });

/**
 * Build a state pre-populated with the given posts in the entity cache,
 * matching what a successful FETCH_FULFILLED would produce.
 */
const stateWith = (...posts: Post[]): PostsState => ({
  ...initialState,
  list: {
    ...initialState.list,
    data: {
      byId: Object.fromEntries(posts.map(p => [p.id, p])),
      allIds: posts.map(p => p.id),
    },
  },
});

// --- list ----------------------------------------------------------------

describe('mutations / FETCH', () => {
  test('FETCH_PENDING flips list.loading and clears any prior list.error', () => {
    const start: PostsState = {
      ...initialState,
      list: { ...initialState.list, error: err('oops') },
    };
    const next = apply(start, { type: types.FETCH_PENDING });
    expect(next.list.loading).toBe(true);
    expect(next.list.error).toBeNull();
  });

  test('FETCH_FULFILLED replaces list.data with the new payload', () => {
    const a = post({ id: 1, title: 'A' });
    const b = post({ id: 2, title: 'B' });
    const next = apply(initialState, {
      type: types.FETCH_FULFILLED,
      posts: [a, b],
    });
    expect(next.list.loading).toBe(false);
    expect(next.list.data.allIds).toEqual([1, 2]);
    expect(next.list.data.byId).toEqual({ 1: a, 2: b });
  });

  test('FETCH_REJECTED stores the ErrorLike on list and clears loading', () => {
    const start: PostsState = {
      ...initialState,
      list: { ...initialState.list, loading: true },
    };
    const next = apply(start, {
      type: types.FETCH_REJECTED,
      error: err('boom'),
    });
    expect(next.list.loading).toBe(false);
    expect(next.list.error).toEqual(err('boom'));
  });
});

// --- create --------------------------------------------------------------

describe('mutations / CREATE', () => {
  test('CREATE_PENDING flips create.loading and inserts the optimistic post at the top', () => {
    const existing = post({ id: 1, title: 'A' });
    const optimistic = post({ id: -42, title: 'New' });

    const next = apply(stateWith(existing), {
      type: types.CREATE_PENDING,
      tempId: -42,
      post: optimistic,
    });

    expect(next.create.loading).toBe(true);
    expect(next.list.data.allIds).toEqual([-42, 1]);
    expect(next.list.data.byId[-42]).toEqual(optimistic);
  });

  test('CREATE_FULFILLED stores the saved post and swaps the temp id in place', () => {
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

    expect(next.create.loading).toBe(false);
    expect(next.create.data).toEqual(saved);
    expect(next.list.data.allIds).toEqual([101]);
    expect(next.list.data.byId[101]).toEqual(saved);
    expect(next.list.data.byId[-42]).toBeUndefined();
  });

  test('CREATE_REJECTED removes the optimistic insert and surfaces the error on the create slot', () => {
    const optimistic = post({ id: -42, title: 'New' });
    const start = apply(stateWith(post({ id: 1 })), {
      type: types.CREATE_PENDING,
      tempId: -42,
      post: optimistic,
    });

    const next = apply(start, {
      type: types.CREATE_REJECTED,
      tempId: -42,
      error: err('nope'),
    });

    expect(next.create.loading).toBe(false);
    expect(next.create.error).toEqual(err('nope'));
    expect(next.list.data.allIds).toEqual([1]);
    expect(next.list.data.byId[-42]).toBeUndefined();
  });
});

// --- update --------------------------------------------------------------

describe('mutations / UPDATE', () => {
  test('UPDATE_PENDING flips update.loading and applies the new fields immediately', () => {
    const start = stateWith(post({ id: 1, title: 'old' }));
    const next = apply(start, {
      type: types.UPDATE_PENDING,
      post: post({ id: 1, title: 'new' }),
    });
    expect(next.update.loading).toBe(true);
    expect(next.list.data.byId[1]?.title).toBe('new');
  });

  test('UPDATE_REJECTED restores the snapshot and surfaces the error on the update slot', () => {
    const previous = post({ id: 1, title: 'old' });
    const start = apply(stateWith(previous), {
      type: types.UPDATE_PENDING,
      post: post({ id: 1, title: 'new' }),
    });
    const next = apply(start, {
      type: types.UPDATE_REJECTED,
      previous,
      error: err('nope'),
    });
    expect(next.update.loading).toBe(false);
    expect(next.update.error).toEqual(err('nope'));
    expect(next.list.data.byId[1]).toEqual(previous);
  });
});

// --- delete --------------------------------------------------------------

describe('mutations / DELETE', () => {
  test('DELETE_PENDING flips remove.loading and removes the post from the cache', () => {
    const start = stateWith(post({ id: 1 }), post({ id: 2 }));
    const next = apply(start, { type: types.DELETE_PENDING, id: 1 });
    expect(next.remove.loading).toBe(true);
    expect(next.list.data.byId[1]).toBeUndefined();
    expect(next.list.data.allIds).toEqual([2]);
  });

  test('DELETE_REJECTED restores the post at its original index and stores the error', () => {
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
      error: err('nope'),
    });

    expect(restored.remove.error).toEqual(err('nope'));
    expect(restored.list.data.byId[2]).toEqual(b);
    expect(restored.list.data.allIds).toEqual([1, 2, 3]);
  });

  test('DELETE_REJECTED clamps an out-of-bounds index to the end', () => {
    const a = post({ id: 1 });
    const start = stateWith(a);
    const next = apply(start, {
      type: types.DELETE_REJECTED,
      previous: post({ id: 99 }),
      index: 999,
      error: err('nope'),
    });
    expect(next.list.data.allIds).toEqual([1, 99]);
  });
});

// --- error UI ------------------------------------------------------------

describe('mutations / CLEAR_ERROR', () => {
  test('CLEAR_ERROR resets the error field on every XHR slot', () => {
    const start: PostsState = {
      list: { ...initialState.list, error: err('list') },
      create: { ...initialState.create, error: err('create') },
      update: { ...initialState.update, error: err('update') },
      remove: { ...initialState.remove, error: err('remove') },
    };
    const next = apply(start, { type: types.CLEAR_ERROR });
    expect(next.list.error).toBeNull();
    expect(next.create.error).toBeNull();
    expect(next.update.error).toBeNull();
    expect(next.remove.error).toBeNull();
  });
});

// --- immutability check --------------------------------------------------

describe('mutations / immutability', () => {
  test('an unrelated action returns the same reference', () => {
    const start = stateWith(post({ id: 1 }));
    const next = apply(start, { type: 'something/UNRELATED' });
    expect(next).toBe(start);
  });

  test('list.data references are preserved when only the remove slot changes', () => {
    const start = stateWith(post({ id: 1 }));
    const next = apply(start, { type: types.DELETE_FULFILLED, id: 1 });
    expect(next.list.data.byId).toBe(start.list.data.byId);
    expect(next.list.data.allIds).toBe(start.list.data.allIds);
  });
});
