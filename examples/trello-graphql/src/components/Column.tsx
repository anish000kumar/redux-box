import { useCallback, useState, type DragEvent } from 'react';
import { connectStore } from 'redux-box';

import {
  COLUMN_LABELS,
  dispatchers as boardDispatchers,
  type Card as CardModel,
  type ColumnId,
} from '../store/board';
import {
  getCardsInColumn,
  getIsCardPending,
} from '../store/board/selectors';
import {
  dispatchers as uiDispatchers,
} from '../store/ui';
import { getRenamingCardId } from '../store/ui/selectors';
import Card, { DRAG_MIME } from './Card';

interface Props {
  column: ColumnId;
  cards: CardModel[];
  renamingCardId: string | null;
  getIsCardPending: (cardId: string) => boolean;
  moveCard: typeof boardDispatchers.moveCard;
  renameCard: typeof boardDispatchers.renameCard;
  deleteCard: typeof boardDispatchers.deleteCard;
  beginDrag: (cardId: string) => unknown;
  endDrag: () => unknown;
  startRename: (cardId: string) => unknown;
  cancelRename: () => unknown;
  openNewCard: (column: ColumnId) => unknown;
  requestConfirmDelete: (cardId: string) => unknown;
}

function ColumnView({
  column,
  cards,
  renamingCardId,
  getIsCardPending,
  moveCard,
  renameCard,
  beginDrag,
  endDrag,
  startRename,
  cancelRename,
  openNewCard,
  requestConfirmDelete,
}: Props) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes(DRAG_MIME)) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setIsOver(true);
    }
  }, []);

  const handleDragLeave = useCallback(() => setIsOver(false), []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsOver(false);
      const cardId = event.dataTransfer.getData(DRAG_MIME);
      if (!cardId) return;
      moveCard({ cardId, toColumn: column });
    },
    [column, moveCard]
  );

  return (
    <section
      className={`column ${isOver ? 'column--over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`column-${column}`}
      aria-label={COLUMN_LABELS[column]}
    >
      <header className="column-header">
        <h2>{COLUMN_LABELS[column]}</h2>
        <span className="column-count">{cards.length}</span>
      </header>

      <ul className="card-list">
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            isPending={getIsCardPending(card.id)}
            isRenaming={renamingCardId === card.id}
            onBeginDrag={beginDrag}
            onEndDrag={endDrag}
            onStartRename={startRename}
            onCancelRename={cancelRename}
            onRename={renameCard}
            onDelete={requestConfirmDelete}
          />
        ))}
      </ul>

      <button
        type="button"
        className="column-add"
        onClick={() => openNewCard(column)}
      >
        + Add a card
      </button>
    </section>
  );
}

/**
 * `cards` is wired through `mapSelectors` (not `mapLazySelectors`) so the
 * column re-renders when the board slice changes — including transitions
 * of the per-card pending flag, which Card otherwise wouldn't see.
 *
 * The selector receives the parent's `(state, ownProps)`, so `ownProps.column`
 * picks the right column and the `getCardsInColumn` lazy selector handles
 * the slice-keyed memoisation underneath.
 */
export default connectStore({
  mapSelectors: {
    renamingCardId: getRenamingCardId,
    cards: (state: any, ownProps: { column: ColumnId }) =>
      getCardsInColumn(state, ownProps.column),
  },
  mapLazySelectors: { getIsCardPending },
  mapDispatchers: {
    moveCard: boardDispatchers.moveCard,
    renameCard: boardDispatchers.renameCard,
    deleteCard: boardDispatchers.deleteCard,
    beginDrag: uiDispatchers.beginDrag,
    endDrag: uiDispatchers.endDrag,
    startRename: uiDispatchers.startRename,
    cancelRename: uiDispatchers.cancelRename,
    openNewCard: uiDispatchers.openNewCard,
    requestConfirmDelete: uiDispatchers.requestConfirmDelete,
  },
})(ColumnView as any);
