import { memo } from 'react';

import type { Post } from '../store/posts';

interface Props {
  post: Post;
  isSaving: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Memoised so an unrelated state change (e.g. a different post saving)
 * doesn't re-render every row. The parent passes a stable lazy callable
 * for `onEdit`/`onDelete`, which is exactly the use case `mapLazySelectors`
 * was designed for.
 */
function PostItem({ post, isSaving, onEdit, onDelete }: Props) {
  const isPending = post.id < 0;

  return (
    <li
      className={`post ${isPending ? 'post--pending' : ''}`}
      aria-busy={isPending}
      data-testid={`post-${post.id}`}
    >
      <div className="post-body">
        <h3>{post.title}</h3>
        <p>{post.body}</p>
      </div>

      <div className="post-actions">
        <button
          type="button"
          onClick={() => onEdit(post.id)}
          disabled={isPending || isSaving}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(post.id)}
          disabled={isPending || isSaving}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default memo(PostItem);
