import { useCallback, useEffect } from 'react';
import { connectStore } from 'redux-box';

import type { ErrorLike } from '../lib/xhr';
import { dispatchers as postDispatchers, type Post } from '../store/posts';
import {
  getError,
  getIsLoading,
  getIsSaving,
  getPostsMatching,
} from '../store/posts/selectors';
import { dispatchers as uiDispatchers } from '../store/ui';
import { getSearch } from '../store/ui/selectors';
import { useDebounce } from '../hooks/useDebounce';
import PostItem from './PostItem';

interface Props {
  isLoading: boolean;
  isSaving: boolean;
  error: ErrorLike | null;
  search: string;
  fetchPosts: () => unknown;
  setSearch: (value: string) => unknown;
  openEditor: (postId?: number | null) => unknown;
  requestConfirmDelete: (postId: number) => unknown;
  clearError: () => unknown;
  getPostsMatching: (needle: string) => Post[];
}

function PostList({
  isLoading,
  isSaving,
  error,
  search,
  fetchPosts,
  setSearch,
  openEditor,
  requestConfirmDelete,
  clearError,
  getPostsMatching,
}: Props) {
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Debounce the lazy filter call so we only re-derive the visible list
  // when the user pauses typing.
  const debouncedSearch = useDebounce(search, 200);
  const visible = getPostsMatching(debouncedSearch);

  const handleEdit = useCallback(
    (id: number) => openEditor(id),
    [openEditor]
  );
  const handleDelete = useCallback(
    (id: number) => requestConfirmDelete(id),
    [requestConfirmDelete]
  );

  return (
    <section className="posts-pane">
      <header className="posts-toolbar">
        <input
          aria-label="Search posts"
          placeholder="Search posts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button type="button" onClick={() => openEditor(null)}>
          New post
        </button>
      </header>

      {error && (
        <div role="alert" className="posts-error">
          <span>{error.message}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {isLoading && visible.length === 0 ? (
        <p className="posts-empty">Loading posts…</p>
      ) : visible.length === 0 ? (
        <p className="posts-empty">
          {search
            ? `No posts match "${search}".`
            : 'No posts yet — create one!'}
        </p>
      ) : (
        <ul className="posts-list" aria-label="Posts">
          {visible.map(post => (
            <PostItem
              key={post.id}
              post={post}
              isSaving={isSaving}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default connectStore({
  mapSelectors: {
    isLoading: getIsLoading,
    isSaving: getIsSaving,
    error: getError,
    search: getSearch,
  },
  mapLazySelectors: { getPostsMatching },
  mapDispatchers: {
    fetchPosts: postDispatchers.fetchPosts,
    clearError: postDispatchers.clearError,
    setSearch: uiDispatchers.setSearch,
    openEditor: uiDispatchers.openEditor,
    requestConfirmDelete: uiDispatchers.requestConfirmDelete,
  },
})(PostList as any);
