import { request } from './client';

/**
 * Wire types as returned by the JSONPlaceholder REST API. Keep these tight to
 * the API; richer domain types live in `src/store/posts/state.ts`.
 */
export interface RemotePost {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type PostDraft = Omit<RemotePost, 'id'>;

export const postsApi = {
  list(): Promise<RemotePost[]> {
    return request<RemotePost[]>('/posts');
  },

  get(id: number): Promise<RemotePost> {
    return request<RemotePost>(`/posts/${id}`);
  },

  create(draft: PostDraft): Promise<RemotePost> {
    return request<RemotePost>('/posts', { method: 'POST', body: draft });
  },

  update(post: RemotePost): Promise<RemotePost> {
    return request<RemotePost>(`/posts/${post.id}`, {
      method: 'PUT',
      body: post,
    });
  },

  remove(id: number): Promise<void> {
    return request<void>(`/posts/${id}`, { method: 'DELETE' });
  },
};
