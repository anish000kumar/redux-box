import { GraphQLError, gqlRequest } from '../../src/graphql/client';

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

const QUERY = '{ ping }';

describe('gqlRequest', () => {
  test('POSTs query + variables as JSON to the GraphQL endpoint', async () => {
    const fetchMock = mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: { ping: 'pong' } }),
    });

    const result = await gqlRequest<{ ping: string }>(QUERY, { x: 1 });

    expect(result).toEqual({ ping: 'pong' });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe('https://graphqlzero.almansi.me/api');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toMatchObject({
      'content-type': 'application/json',
    });
    expect(JSON.parse(init?.body as string)).toEqual({
      query: QUERY,
      variables: { x: 1 },
    });
  });

  test('throws on a non-2xx HTTP response', async () => {
    mockFetch({ ok: false, status: 500 });
    await expect(gqlRequest(QUERY)).rejects.toThrow(/HTTP 500/);
  });

  test('throws GraphQLError when the response carries `errors`', async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          errors: [{ message: 'invalid id' }, { message: 'not found' }],
        }),
    });

    await expect(gqlRequest(QUERY)).rejects.toBeInstanceOf(GraphQLError);
    await expect(gqlRequest(QUERY)).rejects.toMatchObject({
      message: 'invalid id; not found',
    });
  });

  test('throws when neither data nor errors are present', async () => {
    mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    });
    await expect(gqlRequest(QUERY)).rejects.toThrow(/no data/);
  });
});
