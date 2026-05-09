import { useEffect, useState, type FormEvent } from 'react';
import { connectStore } from 'redux-box';

import {
  COLUMN_LABELS,
  dispatchers as boardDispatchers,
  type ColumnId,
} from '../store/board';
import { dispatchers as uiDispatchers } from '../store/ui';
import { getNewCardColumn } from '../store/ui/selectors';

interface Props {
  newCardColumn: ColumnId | null;
  createCard: typeof boardDispatchers.createCard;
  closeNewCard: () => unknown;
}

function CardForm({ newCardColumn, createCard, closeNewCard }: Props) {
  const [title, setTitle] = useState('');

  // Clear the input every time the form is opened in a new column.
  useEffect(() => {
    if (newCardColumn != null) setTitle('');
  }, [newCardColumn]);

  if (newCardColumn == null) return null;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || newCardColumn == null) return;
    createCard({ title: trimmed, column: newCardColumn });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <form className="modal" onSubmit={onSubmit}>
        <h2>New card in “{COLUMN_LABELS[newCardColumn]}”</h2>

        <label>
          Title
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="What's the task?"
            autoFocus
          />
        </label>

        <div className="modal-actions">
          <button type="button" onClick={closeNewCard}>
            Cancel
          </button>
          <button type="submit" disabled={!title.trim()}>
            Add card
          </button>
        </div>
      </form>
    </div>
  );
}

export default connectStore({
  mapSelectors: { newCardColumn: getNewCardColumn },
  mapDispatchers: {
    createCard: boardDispatchers.createCard,
    closeNewCard: uiDispatchers.closeNewCard,
  },
})(CardForm as any);
