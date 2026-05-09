import { createStore } from 'redux-box';

import postsModule, { type Post } from '../../../src/store/posts';
import {
  getError,
  getIsLoading,
  getIsSaving,
  getPostById,
  getPostCount,
  getPosts,
  getPostsMatching,
} from '../../../src/store/posts/selectors';

/**
 * Selectors are built with `module.select` / `module.lazySelect`, which
 * resolve the slice through `moduleRegistry`. To make them resolve to the
 * right key in tests, we register the module via `createStore` once.
 */
function setupStore() {
  return createStore({ posts: postsModule });
}

const post = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
  ...overrides,
});

const stateWith = (...posts: Post[]) => ({
  posts: {
    byId: Object.fromEntries(posts.map(p => [p.id, p])),
    allIds: posts.map(p => p.id),
    isLoading: false,
    isSaving: false,
    error: null,
  },
});

beforeAll(setupStore);

describe('eager selectors', () => {
  test('getPosts returns posts in allIds order', () => {
    const a = post({ id: 1, title: 'A' });
    const b = post({ id: 2, title: 'B' });
    expect(getPosts(stateWith(b, a))).toEqual([b, a]);
  });

  test('getPostCount counts everything in allIds', () => {
    expect(getPostCount(stateWith(post({ id: 1 }), post({ id: 2 })))).toBe(2);
  });

  test('getIsLoading / getIsSaving / getError surface their flags', () => {
    const state = {
      posts: {
        byId: {},
        allIds: [],
        isLoading: true,
        isSaving: true,
        error: 'oh no',
      },
    };
    expect(getIsLoading(state)).toBe(true);
    expect(getIsSaving(state)).toBe(true);
    expect(getError(state)).toBe('oh no');
  });

  test('getPosts is reselect-memoised: same slice -> same array reference', () => {
    const state = stateWith(post({ id: 1 }), post({ id: 2 }));
    const a = getPosts(state);
    const b = getPosts(state);
    expect(b).toBe(a);
  });
});

describe('lazy selectors', () => {
  test('getPostById returns the matching post', () => {
    const target = post({ id: 7, title: 'lookup me' });
    const state = stateWith(post({ id: 1 }), target);
    expect(getPostById(state, 7)).toEqual(target);
    expect(getPostById(state, 999)).toBeUndefined();
  });

  test('getPostById is slice-keyed memoised: repeat lookups return the same ref', () => {
    const target = post({ id: 7, title: 'lookup me' });
    const state = stateWith(target);
    const a = getPostById(state, 7);
    const b = getPostById(state, 7);
    expect(b).toBe(a);
  });

  test('getPostsMatching returns the full list when needle is empty', () => {
    const a = post({ id: 1, title: 'apples', body: 'red' });
    const b = post({ id: 2, title: 'bananas', body: 'yellow' });
    expect(getPostsMatching(stateWith(a, b), '')).toEqual([a, b]);
    expect(getPostsMatching(stateWith(a, b), '   ')).toEqual([a, b]);
  });

  test('getPostsMatching filters case-insensitively across title and body', () => {
    const a = post({ id: 1, title: 'apples', body: 'red fruit' });
    const b = post({ id: 2, title: 'pears', body: 'GREEN' });
    const state = stateWith(a, b);

    expect(getPostsMatching(state, 'green')).toEqual([b]);
    expect(getPostsMatching(state, 'APPLE')).toEqual([a]);
    expect(getPostsMatching(state, 'banana')).toEqual([]);
  });
});
