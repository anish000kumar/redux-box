import { createStore } from 'redux-box';

import postsModule, {
  dispatchers,
  type Post,
} from '../../../src/store/posts';
import {
  getError,
  getIsLoading,
  getIsSaving,
  getPosts,
} from '../../../src/store/posts/selectors';
import { postsApi } from '../../../src/api/posts';

/**
 * End-to-end coverage of the module. We mock only the API layer; the
 * reducer + saga + selector wiring runs unmodified, so this catches
 * regressions in the action-type strings, the optimistic-update flow and
 * the rollback paths.
 */

jest.mock('../../../src/api/posts', () => ({
  postsApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockedApi = postsApi as jest.Mocked<typeof postsApi>;

const post = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
  ...overrides,
});

// `setImmediate` isn't available in jsdom; a 0-delay `setTimeout` is the
// idiomatic way to give pending microtasks + macrotasks a chance to run.
const flushSagas = () => new Promise(resolve => setTimeout(resolve, 0));

function makeStore() {
  return createStore({ posts: postsModule });
}

describe('posts module — integration', () => {
  test('fetch flow: PENDING flips loading, FULFILLED hydrates byId/allIds', async () => {
    mockedApi.list.mockResolvedValue([
      post({ id: 1, title: 'A' }),
      post({ id: 2, title: 'B' }),
    ]);

    const store = makeStore();

    store.dispatch(dispatchers.fetchPosts());
    expect(getIsLoading(store.getState())).toBe(true);

    await flushSagas();

    expect(getIsLoading(store.getState())).toBe(false);
    expect((getPosts(store.getState()) as Post[]).map(p => p.id)).toEqual([
      1, 2,
    ]);
  });

  test('fetch failure surfaces the error message via getError', async () => {
    mockedApi.list.mockRejectedValue(new Error('network down'));

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();

    expect(getIsLoading(store.getState())).toBe(false);
    expect(getError(store.getState())?.message).toBe('network down');
  });

  test('create flow: optimistic insert at top, then id reconciliation', async () => {
    // Hold the API in flight so we can inspect the optimistic state in
    // between PENDING and FULFILLED. An immediately-resolved
    // `mockResolvedValue` would race with the test's microtasks and
    // the saga would already have reconciled by the time we look.
    let resolveCreate: (value: Post) => void = () => {};
    mockedApi.create.mockImplementation(
      () =>
        new Promise<Post>(resolve => {
          resolveCreate = resolve;
        })
    );

    const store = makeStore();
    store.dispatch(
      dispatchers.createPost({ title: 'Optimistic', body: 'B', userId: 1 })
    );

    await flushSagas();
    const optimisticPosts = getPosts(store.getState());
    expect(optimisticPosts).toHaveLength(1);
    expect(optimisticPosts[0]?.id).toBeLessThan(0); // temp id
    expect(getIsSaving(store.getState())).toBe(true);

    resolveCreate(post({ id: 99, title: 'Optimistic' }));
    await flushSagas();

    const final = getPosts(store.getState());
    expect(final.map(p => p.id)).toEqual([99]);
    expect(getIsSaving(store.getState())).toBe(false);
  });

  test('create rollback: optimistic insert is removed on failure', async () => {
    mockedApi.create.mockRejectedValue(new Error('nope'));

    const store = makeStore();
    store.dispatch(
      dispatchers.createPost({ title: 't', body: 'b', userId: 1 })
    );
    await flushSagas();

    expect(getPosts(store.getState())).toEqual([]);
    expect(getError(store.getState())?.message).toBe('nope');
  });

  test('update flow: optimistic local edit, server confirmation', async () => {
    mockedApi.list.mockResolvedValue([post({ id: 1, title: 'old' })]);
    let resolveUpdate: (value: Post) => void = () => {};
    mockedApi.update.mockImplementation(
      () =>
        new Promise<Post>(resolve => {
          resolveUpdate = resolve;
        })
    );

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();

    store.dispatch(dispatchers.updatePost(post({ id: 1, title: 'new' })));
    await flushSagas();
    expect(getPosts(store.getState())[0]?.title).toBe('new');
    expect(getIsSaving(store.getState())).toBe(true);

    resolveUpdate(post({ id: 1, title: 'new' }));
    await flushSagas();
    expect(getIsSaving(store.getState())).toBe(false);
  });

  test('update rollback: snapshot restored on failure', async () => {
    mockedApi.list.mockResolvedValue([post({ id: 1, title: 'old' })]);
    mockedApi.update.mockRejectedValue(new Error('nope'));

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();

    store.dispatch(dispatchers.updatePost(post({ id: 1, title: 'new' })));
    await flushSagas();

    expect(getPosts(store.getState())[0]?.title).toBe('old');
    expect(getError(store.getState())?.message).toBe('nope');
  });

  test('delete flow: optimistic removal, server confirmation', async () => {
    mockedApi.list.mockResolvedValue([post({ id: 1 }), post({ id: 2 })]);
    let resolveDelete: () => void = () => {};
    mockedApi.remove.mockImplementation(
      () =>
        new Promise<void>(resolve => {
          resolveDelete = resolve;
        })
    );

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();

    store.dispatch(dispatchers.deletePost(1));
    await flushSagas();
    expect(getPosts(store.getState()).map(p => p.id)).toEqual([2]);

    resolveDelete();
    await flushSagas();
    expect(getIsSaving(store.getState())).toBe(false);
  });

  test('delete rollback restores the post at its original index', async () => {
    mockedApi.list.mockResolvedValue([
      post({ id: 1, title: 'A' }),
      post({ id: 2, title: 'B' }),
      post({ id: 3, title: 'C' }),
    ]);
    mockedApi.remove.mockRejectedValue(new Error('nope'));

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();

    store.dispatch(dispatchers.deletePost(2));
    await flushSagas();

    expect(getPosts(store.getState()).map(p => p.id)).toEqual([1, 2, 3]);
    expect(getError(store.getState())?.message).toBe('nope');
  });

  test('clearError dispatcher resets every XHR slot', async () => {
    mockedApi.list.mockRejectedValue(new Error('fail'));

    const store = makeStore();
    store.dispatch(dispatchers.fetchPosts());
    await flushSagas();
    expect(getError(store.getState())?.message).toBe('fail');

    store.dispatch(dispatchers.clearError());
    expect(getError(store.getState())).toBeNull();
  });
});
