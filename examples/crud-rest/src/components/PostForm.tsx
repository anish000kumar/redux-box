import { useEffect, useState, type FormEvent } from 'react';
import { connectStore } from 'redux-box';

import {
  dispatchers as postDispatchers,
  type Post,
} from '../store/posts';
import { getPostById } from '../store/posts/selectors';
import { dispatchers as uiDispatchers } from '../store/ui';
import {
  getEditingPostId,
  getIsEditorOpen,
} from '../store/ui/selectors';

interface Props {
  isOpen: boolean;
  editingPostId: number | null;
  getPostById: (id: number) => Post | undefined;
  createPost: (typeof postDispatchers)['createPost'];
  updatePost: (typeof postDispatchers)['updatePost'];
  closeEditor: () => void;
}

const DEFAULT_DRAFT = { title: '', body: '', userId: 1 };

function PostForm({
  isOpen,
  editingPostId,
  getPostById,
  createPost,
  updatePost,
  closeEditor,
}: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  // When the editor opens for an existing post, prime the inputs with the
  // current values. `getPostById` is a stable lazy callable, so it's safe
  // to leave it out of deps.
  useEffect(() => {
    if (!isOpen) return;
    if (editingPostId == null) {
      setTitle(DEFAULT_DRAFT.title);
      setBody(DEFAULT_DRAFT.body);
      return;
    }
    const post = getPostById(editingPostId);
    setTitle(post?.title ?? '');
    setBody(post?.body ?? '');
  }, [isOpen, editingPostId, getPostById]);

  if (!isOpen) return null;

  const isEditing = editingPostId != null;
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    if (isEditing) {
      const existing = getPostById(editingPostId);
      if (!existing) return;
      updatePost({ ...existing, title: title.trim(), body: body.trim() });
    } else {
      createPost({
        title: title.trim(),
        body: body.trim(),
        userId: DEFAULT_DRAFT.userId,
      });
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={onSubmit}>
        <h2>{isEditing ? 'Edit post' : 'New post'}</h2>

        <label>
          Title
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="A short, descriptive title"
            autoFocus
          />
        </label>

        <label>
          Body
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write something..."
            rows={5}
          />
        </label>

        <div className="modal-actions">
          <button type="button" onClick={closeEditor}>
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit}>
            {isEditing ? 'Save changes' : 'Create post'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default connectStore({
  mapSelectors: {
    isOpen: getIsEditorOpen,
    editingPostId: getEditingPostId,
  },
  mapLazySelectors: { getPostById },
  mapDispatchers: {
    createPost: postDispatchers.createPost,
    updatePost: postDispatchers.updatePost,
    closeEditor: uiDispatchers.closeEditor,
  },
})(PostForm as any);
