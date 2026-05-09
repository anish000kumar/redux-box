/**
 * Tiny GraphQL-over-HTTP client. We deliberately do not pull in `apollo`
 * or `graphql-request` — the example is small enough that a 30-line
 * `fetch` wrapper makes the testing story (mock `fetch` once) much
 * simpler.
 *
 * For a production app, prefer a real client: it gives you query batching,
 * a cache, persisted queries, etc. The Redux Box layer would be
 * unchanged — the saga calls a singleton client, and that's the only line
 * that needs to swap.
 */

const GRAPHQL_ENDPOINT = 'https://graphqlzero.almansi.me/api';

export class GraphQLError extends Error {
  errors: Array<{ message: string }>;
  constructor(errors: Array<{ message: string }>) {
    super(errors.map(e => e.message).join('; ') || 'GraphQL request failed');
    this.name = 'GraphQLError';
    this.errors = errors;
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function gqlRequest<TData, TVars extends object = object>(
  query: string,
  variables: TVars = {} as TVars
): Promise<TData> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL HTTP ${res.status}`);
  }

  const json = (await res.json()) as GraphQLResponse<TData>;

  if (json.errors && json.errors.length > 0) {
    throw new GraphQLError(json.errors);
  }
  if (!json.data) {
    throw new Error('GraphQL response had no data');
  }
  return json.data;
}
