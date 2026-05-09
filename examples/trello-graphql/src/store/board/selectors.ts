import boardModule from './index';
import type { BoardState, Card } from './state';
import type { ColumnId } from './types';

/**
 * Selectors built on the module helpers (`module.select`, `module.lazySelect`)
 * so they reach the slice without hard-coding `state.board.*`. Renaming the
 * mount key in `createStore({ board: ... })` would not break a single line.
 */

// --- eager (drive re-renders) -------------------------------------------

export const getIsLoading = boardModule.select(
  (slice: BoardState) => slice.isLoading
);
export const getError = boardModule.select(
  (slice: BoardState) => slice.error
);

/**
 * Board summary: total cards. Used by the header.
 */
export const getCardCount = boardModule.select(
  (slice: BoardState) =>
    slice.columns.todo.length +
    slice.columns['in-progress'].length +
    slice.columns.done.length
);

// --- lazy (parameterised, stable function reference) -------------------

/**
 * Cards in the order they appear in the given column. Slice-keyed
 * memoised: same column + unchanged slice ⇒ same array reference, so
 * passing the result down to a memoised `<Column>` is cheap.
 */
export const getCardsInColumn = boardModule.lazySelect(
  (slice: BoardState, column: ColumnId): Card[] =>
    slice.columns[column]
      .map(id => slice.byId[id])
      .filter((c): c is Card => Boolean(c))
);

/**
 * Lookup a single card by id (used by edit / delete dialogs).
 */
export const getCardById = boardModule.lazySelect(
  (slice: BoardState, cardId: string): Card | undefined =>
    slice.byId[cardId]
);

/**
 * Quick "is this card mid-mutation?" check for individual rows. Stays
 * stable between unrelated dispatches by virtue of `lazySelect`'s
 * slice-keyed memoisation.
 */
export const getIsCardPending = boardModule.lazySelect(
  (slice: BoardState, cardId: string): boolean =>
    slice.pendingIds[cardId] === true
);
