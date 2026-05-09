import { connectStore } from 'redux-box';

import {
  dispatchers as boardDispatchers,
  type Card,
} from '../store/board';
import { getCardById } from '../store/board/selectors';
import { dispatchers as uiDispatchers } from '../store/ui';
import { getPendingDeleteId } from '../store/ui/selectors';

interface Props {
  pendingDeleteId: string | null;
  getCardById: (cardId: string) => Card | undefined;
  deleteCard: (cardId: string) => unknown;
  cancelConfirmDelete: () => unknown;
}

function ConfirmDialog({
  pendingDeleteId,
  getCardById,
  deleteCard,
  cancelConfirmDelete,
}: Props) {
  if (pendingDeleteId == null) return null;
  const card = getCardById(pendingDeleteId);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal modal--confirm">
        <h2>Delete card?</h2>
        <p>
          Are you sure you want to delete{' '}
          <strong>“{card?.title ?? 'this card'}”</strong>? This cannot be undone.
        </p>
        <div className="modal-actions">
          <button type="button" onClick={cancelConfirmDelete}>
            Cancel
          </button>
          <button
            type="button"
            className="danger"
            onClick={() => deleteCard(pendingDeleteId)}
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
  mapLazySelectors: { getCardById },
  mapDispatchers: {
    deleteCard: boardDispatchers.deleteCard,
    cancelConfirmDelete: uiDispatchers.cancelConfirmDelete,
  },
})(ConfirmDialog as any);
