import { connectStore } from 'redux-box';

import {
  dispatchers as postDispatchers,
  type Post,
} from '../store/posts';
import { getPostById } from '../store/posts/selectors';
import { dispatchers as uiDispatchers } from '../store/ui';
import { getPendingDeleteId } from '../store/ui/selectors';

interface Props {
  pendingDeleteId: number | null;
  getPostById: (id: number) => Post | undefined;
  deletePost: (typeof postDispatchers)['deletePost'];
  cancelConfirmDelete: () => unknown;
}

function ConfirmDialog({
  pendingDeleteId,
  getPostById,
  deletePost,
  cancelConfirmDelete,
}: Props) {
  if (pendingDeleteId == null) return null;

  const post = getPostById(pendingDeleteId);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal--confirm">
        <h2>Delete post?</h2>
        <p>
          You are about to delete <strong>“{post?.title ?? 'this post'}”</strong>.
          This cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" onClick={cancelConfirmDelete}>
            Cancel
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => deletePost(pendingDeleteId)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default connectStore({
  mapSelectors: { pendingDeleteId: getPendingDeleteId },
  mapLazySelectors: { getPostById },
  mapDispatchers: {
    deletePost: postDispatchers.deletePost,
    cancelConfirmDelete: uiDispatchers.cancelConfirmDelete,
  },
})(ConfirmDialog as any);
