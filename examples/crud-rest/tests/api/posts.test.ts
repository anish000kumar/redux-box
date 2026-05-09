import { ApiError } from '../../src/api/client';
import { postsApi, type RemotePost } from '../../src/api/posts';

/**
 * Stubs `globalThis.fetch` once and lets each test override the resolution.
 * Returns the mock so individual tests can assert on the URL/options.
 */
function mockFetch(response: Partial<Response> | Promise<Response>) {
  const fn = jest
    .fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>()
    .mockImplementation(() =>
      response instanceof Promise
        ? response
        : Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve(undefined),
            ...response,
          } as Response)
    );
  globalThis.fetch = fn as any;
  return fn;
}

const samplePost: RemotePost = {
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
};

describe('postsApi.list', () => {
  test('GETs /posts and returns the parsed body', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve([samplePost]),
    });

    const result = await postsApi.list();

    expect(result).toEqual([samplePost]);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://jsonplaceholder.typicode.com/posts');
    expect(init?.method).toBe('GET');
  });

  test('throws ApiError carrying status on a non-2xx response', async () => {
    mockFetch({ ok: false, status: 500 });

    await expect(postsApi.list()).rejects.toBeInstanceOf(ApiError);
    await expect(postsApi.list()).rejects.toMatchObject({ status: 500 });
  });
});

describe('postsApi.create', () => {
  test('POSTs JSON body and returns the saved post', async () => {
    const draft = { title: 'New', body: 'Body', userId: 1 };
    const fetchMock = mockFetch({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ ...draft, id: 101 }),
    });

    const saved = await postsApi.create(draft);

    expect(saved).toMatchObject({ id: 101, title: 'New' });
    const [, init] = fetchMock.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'content-type': 'application/json',
    });
    expect(init?.body).toBe(JSON.stringify(draft));
  });
});

describe('postsApi.update', () => {
  test('PUTs the full post payload', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve(samplePost),
    });

    await postsApi.update(samplePost);

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://jsonplaceholder.typicode.com/posts/1');
    expect(init?.method).toBe('PUT');
    expect(init?.body).toBe(JSON.stringify(samplePost));
  });
});

describe('postsApi.remove', () => {
  test('DELETEs the post and short-circuits JSON parsing', async () => {
    // NB: deliberately do not provide a `json` body; the wrapper must skip
    // parsing for DELETE and not throw on a missing body.
    const fetchMock = mockFetch({ ok: true, status: 200 });

    await expect(postsApi.remove(7)).resolves.toBeUndefined();

    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://jsonplaceholder.typicode.com/posts/7');
    expect(init?.method).toBe('DELETE');
  });
});
