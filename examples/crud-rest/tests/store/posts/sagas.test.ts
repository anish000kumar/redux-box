import { call, put, select } from 'redux-saga/effects';

import { postsApi } from '../../../src/api/posts';
import {
  createPostWorker,
  deletePostWorker,
  fetchPostsWorker,
  updatePostWorker,
} from '../../../src/store/posts/sagas';
import { types } from '../../../src/store/posts/types';
import type { Post } from '../../../src/store/posts/state';

const post = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
  ...overrides,
});

// --- fetch ---------------------------------------------------------------

describe('fetchPostsWorker', () => {
  test('happy path: PENDING → call → FULFILLED with the response', () => {
    const gen = fetchPostsWorker();

    expect(gen.next().value).toEqual(put({ type: types.FETCH_PENDING }));
    expect(gen.next().value).toEqual(call(postsApi.list));

    const fakePosts = [post({ id: 1 }), post({ id: 2 })];
    expect(gen.next(fakePosts).value).toEqual(
      put({ type: types.FETCH_FULFILLED, posts: fakePosts })
    );
    expect(gen.next().done).toBe(true);
  });

  test('sad path: API throws → REJECTED with message', () => {
    const gen = fetchPostsWorker();
    gen.next(); // PENDING
    gen.next(); // call

    expect(gen.throw(new Error('boom')).value).toEqual(
      put({ type: types.FETCH_REJECTED, error: 'boom' })
    );
    expect(gen.next().done).toBe(true);
  });

  test('non-Error rejections fall back to a generic message', () => {
    const gen = fetchPostsWorker();
    gen.next();
    gen.next();
    expect(gen.throw('weird' as any).value).toEqual(
      put({ type: types.FETCH_REJECTED, error: 'Unknown error' })
    );
  });
});

// --- create --------------------------------------------------------------

describe('createPostWorker', () => {
  const draft = { title: 'New', body: 'Body', userId: 1 };

  test('emits PENDING with a temp id, calls API, then FULFILLED', () => {
    const gen = createPostWorker({ type: types.CREATE, draft });

    const pending = gen.next().value as any;
    expect(pending.type).toBe('PUT');
    expect(pending.payload.action.type).toBe(types.CREATE_PENDING);
    expect(pending.payload.action.tempId).toBeLessThan(0);
    expect(pending.payload.action.post).toMatchObject({
      ...draft,
      id: pending.payload.action.tempId,
    });

    const tempId = pending.payload.action.tempId;
    expect(gen.next().value).toEqual(call(postsApi.create, draft));

    const saved = post({ id: 101, ...draft });
    expect(gen.next(saved).value).toEqual(
      put({ type: types.CREATE_FULFILLED, tempId, post: saved })
    );
    expect(gen.next().done).toBe(true);
  });

  test('on API failure emits REJECTED with the same temp id', () => {
    const gen = createPostWorker({ type: types.CREATE, draft });
    const pending = gen.next().value as any;
    const tempId = pending.payload.action.tempId;
    gen.next(); // call(...)

    expect(gen.throw(new Error('nope')).value).toEqual(
      put({ type: types.CREATE_REJECTED, tempId, error: 'nope' })
    );
  });
});

// --- update --------------------------------------------------------------

describe('updatePostWorker', () => {
  test('selects previous, puts PENDING, calls API, then FULFILLED', () => {
    const previous = post({ id: 1, title: 'old' });
    const next = post({ id: 1, title: 'new' });

    const gen = updatePostWorker({ type: types.UPDATE, post: next });

    expect((gen.next().value as any).type).toBe('SELECT');
    expect(gen.next(previous).value).toEqual(
      put({ type: types.UPDATE_PENDING, post: next })
    );
    expect(gen.next().value).toEqual(call(postsApi.update, next));
    expect(gen.next(next).value).toEqual(
      put({ type: types.UPDATE_FULFILLED, post: next })
    );
    expect(gen.next().done).toBe(true);
  });

  test('rolls back to the snapshot when the API rejects', () => {
    const previous = post({ id: 1, title: 'old' });
    const next = post({ id: 1, title: 'new' });

    const gen = updatePostWorker({ type: types.UPDATE, post: next });
    gen.next();
    gen.next(previous); // PENDING
    gen.next(); // call

    expect(gen.throw(new Error('oh no')).value).toEqual(
      put({
        type: types.UPDATE_REJECTED,
        previous,
        error: 'oh no',
      })
    );
  });

  test('does nothing if the post is not in state (deleted concurrently)', () => {
    const next = post({ id: 1, title: 'new' });
    const gen = updatePostWorker({ type: types.UPDATE, post: next });
    gen.next(); // SELECT
    expect(gen.next(undefined).done).toBe(true);
  });
});

// --- delete --------------------------------------------------------------

describe('deletePostWorker', () => {
  test('captures previous + index, puts PENDING, calls API, FULFILLED', () => {
    const previous = post({ id: 7, title: 'doomed' });
    const gen = deletePostWorker({ type: types.DELETE, id: 7 });

    expect((gen.next().value as any).type).toBe('SELECT');
    expect((gen.next(previous).value as any).type).toBe('SELECT');
    expect(gen.next(2).value).toEqual(
      put({ type: types.DELETE_PENDING, id: 7 })
    );
    expect(gen.next().value).toEqual(call(postsApi.remove, 7));
    expect(gen.next().value).toEqual(
      put({ type: types.DELETE_FULFILLED, id: 7 })
    );
    expect(gen.next().done).toBe(true);
  });

  test('rolls back with previous + original index on failure', () => {
    const previous = post({ id: 7 });
    const gen = deletePostWorker({ type: types.DELETE, id: 7 });
    gen.next();
    gen.next(previous);
    gen.next(3); // PENDING
    gen.next(); // call(...)

    expect(gen.throw(new Error('nope')).value).toEqual(
      put({
        type: types.DELETE_REJECTED,
        previous,
        index: 3,
        error: 'nope',
      })
    );
  });

  test('aborts cleanly when the post no longer exists', () => {
    const gen = deletePostWorker({ type: types.DELETE, id: 999 });
    gen.next(); // SELECT previous
    gen.next(undefined); // SELECT index
    expect(gen.next(-1).done).toBe(true);
  });
});

// --- select inputs are well-formed --------------------------------------

describe('saga select inputs', () => {
  test('updatePostWorker reads previous from state.posts.byId', () => {
    const next = post({ id: 5 });
    const gen = updatePostWorker({ type: types.UPDATE, post: next });
    const sel = gen.next().value as ReturnType<typeof select>;
    const fakeState = {
      posts: { byId: { 5: post({ id: 5, title: 'snapshot' }) } },
    };
    expect((sel as any).payload.selector(fakeState)).toEqual(
      post({ id: 5, title: 'snapshot' })
    );
  });

  test('deletePostWorker reads index from state.posts.allIds', () => {
    const gen = deletePostWorker({ type: types.DELETE, id: 9 });
    gen.next(); // SELECT previous
    const sel = gen.next(post({ id: 9 })).value as ReturnType<typeof select>;
    const fakeState = { posts: { allIds: [1, 9, 12] } };
    expect((sel as any).payload.selector(fakeState)).toBe(1);
  });
});
