import { memo, useCallback, useState, type DragEvent } from 'react';

import type { Card } from '../store/board';

interface Props {
  card: Card;
  isPending: boolean;
  isRenaming: boolean;
  onBeginDrag: (cardId: string) => void;
  onEndDrag: () => void;
  onStartRename: (cardId: string) => void;
  onCancelRename: () => void;
  onRename: (cardId: string, title: string) => void;
  onDelete: (cardId: string) => void;
}

export const DRAG_MIME = 'application/x-trello-card-id';

/**
 * One card in a column. Two interaction modes:
 *
 * - **Display**: shows the title with edit / delete buttons. Card is
 *   `draggable`; on `dragstart` we tell the parent column which card to
 *   lift, and stash the id in the DragEvent so the drop target can read
 *   it back.
 *
 * - **Rename**: an inline form with an input + Save/Cancel. Submitting
 *   the empty string is treated as Cancel.
 *
 * Memoised because lazy-selector callables passed in via the parent are
 * reference-stable, so rapid moves of *other* cards must not re-render
 * the whole column.
 */
function CardView({
  card,
  isPending,
  isRenaming,
  onBeginDrag,
  onEndDrag,
  onStartRename,
  onCancelRename,
  onRename,
  onDelete,
}: Props) {
  const [draftTitle, setDraftTitle] = useState(card.title);

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLLIElement>) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(DRAG_MIME, card.id);
      onBeginDrag(card.id);
    },
    [card.id, onBeginDrag]
  );

  const handleDragEnd = useCallback(() => {
    onEndDrag();
  }, [onEndDrag]);

  if (isRenaming) {
    return (
      <li className="card card--editing" data-testid={`card-${card.id}`}>
        <form
          onSubmit={e => {
            e.preventDefault();
            const next = draftTitle.trim();
            if (!next) {
              onCancelRename();
              return;
            }
            onRename(card.id, next);
          }}
        >
          <input
            aria-label={`Rename ${card.title}`}
            value={draftTitle}
            onChange={e => setDraftTitle(e.target.value)}
            autoFocus
          />
          <div className="card-actions">
            <button type="button" onClick={onCancelRename}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li
      className={`card ${isPending ? 'card--pending' : ''}`}
      draggable={!isPending}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      aria-busy={isPending}
      data-testid={`card-${card.id}`}
    >
      <span className="card-title">{card.title}</span>
      {card.assignee && (
        <span className="card-assignee">{card.assignee}</span>
      )}
      <div className="card-actions">
        <button
          type="button"
          onClick={() => {
            setDraftTitle(card.title);
            onStartRename(card.id);
          }}
          disabled={isPending}
          aria-label={`Edit ${card.title}`}
        >
          ✎
        </button>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          disabled={isPending}
          aria-label={`Delete ${card.title}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}

export default memo(CardView);
