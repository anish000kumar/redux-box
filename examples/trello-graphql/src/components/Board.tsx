import { useEffect } from 'react';
import { connectStore } from 'redux-box';

import {
  COLUMN_IDS,
  dispatchers as boardDispatchers,
} from '../store/board';
import {
  getCardCount,
  getError,
  getIsLoading,
} from '../store/board/selectors';
import Column from './Column';

interface Props {
  isLoading: boolean;
  error: string | null;
  cardCount: number;
  fetchBoard: typeof boardDispatchers.fetchBoard;
  clearError: typeof boardDispatchers.clearError;
}

function Board({
  isLoading,
  error,
  cardCount,
  fetchBoard,
  clearError,
}: Props) {
  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  return (
    <div className="board-pane">
      <header className="board-header">
        <h1>Roadmap</h1>
        <p>{cardCount} cards across the board</p>
      </header>

      {error && (
        <div role="alert" className="board-error">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      {isLoading && cardCount === 0 ? (
        <p className="board-empty">Loading board…</p>
      ) : (
        <div className="board-columns">
          {COLUMN_IDS.map(id => (
            <Column key={id} column={id} />
          ))}
        </div>
      )}
    </div>
  );
}

export default connectStore({
  mapSelectors: {
    isLoading: getIsLoading,
    error: getError,
    cardCount: getCardCount,
  },
  mapDispatchers: {
    fetchBoard: boardDispatchers.fetchBoard,
    clearError: boardDispatchers.clearError,
  },
})(Board as any);
