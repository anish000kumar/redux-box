import { types, type ColumnId } from './types';
import type { BoardState, Card } from './state';

type Mutations = Record<string, (state: any, action: any) => void>;

/**
 * Reducer pieces. immer makes all writes look like direct mutation; the
 * store stays immutable underneath. Reference identity is preserved for
 * any sub-tree we don't touch — that's what keeps reselect-memoised
 * selectors cheap and react-redux re-renders narrow.
 *
 * Optimistic UI:
 *   PENDING   → apply the change locally, mark the card as pending
 *   FULFILLED → swap any temp id for the real id, clear pending flag
 *   REJECTED  → restore the snapshot, clear pending flag, surface error
 *
 * For moves, the snapshot is `{ fromColumn, fromIndex }` so a failed
 * mutation can put the card back in exactly the slot it was lifted from.
 */

function removeFromColumn(
  state: BoardState,
  column: ColumnId,
  cardId: string
): number {
  const ids = state.columns[column];
  const idx = ids.indexOf(cardId);
  if (idx !== -1) ids.splice(idx, 1);
  return idx;
}

function insertIntoColumn(
  state: BoardState,
  column: ColumnId,
  cardId: string,
  index: number
) {
  const ids = state.columns[column];
  const clamped = Math.min(Math.max(index, 0), ids.length);
  ids.splice(clamped, 0, cardId);
}

export const mutations: Mutations = {
  // --- list ----------------------------------------------------------------

  [types.FETCH_PENDING]: (state: BoardState) => {
    state.isLoading = true;
    state.error = null;
  },

  [types.FETCH_FULFILLED]: (
    state: BoardState,
    action: { cards: Card[] }
  ) => {
    state.isLoading = false;
    state.byId = {};
    state.columns.todo = [];
    state.columns['in-progress'] = [];
    state.columns.done = [];
    for (const card of action.cards) {
      state.byId[card.id] = card;
      state.columns[card.column].push(card.id);
    }
  },

  [types.FETCH_REJECTED]: (
    state: BoardState,
    action: { error: string }
  ) => {
    state.isLoading = false;
    state.error = action.error;
  },

  // --- create (optimistic, with temp id) -----------------------------------

  [types.CREATE_PENDING]: (
    state: BoardState,
    action: { tempId: string; card: Card }
  ) => {
    state.byId[action.tempId] = action.card;
    state.columns[action.card.column].unshift(action.tempId);
    state.pendingIds[action.tempId] = true;
  },

  [types.CREATE_FULFILLED]: (
    state: BoardState,
    action: { tempId: string; card: Card }
  ) => {
    delete state.byId[action.tempId];
    delete state.pendingIds[action.tempId];

    const idx = state.columns[action.card.column].indexOf(action.tempId);
    if (idx !== -1) state.columns[action.card.column][idx] = action.card.id;

    state.byId[action.card.id] = action.card;
  },

  [types.CREATE_REJECTED]: (
    state: BoardState,
    action: { tempId: string; column: ColumnId; error: string }
  ) => {
    delete state.byId[action.tempId];
    delete state.pendingIds[action.tempId];
    removeFromColumn(state, action.column, action.tempId);
    state.error = action.error;
  },

  // --- rename --------------------------------------------------------------

  [types.RENAME_PENDING]: (
    state: BoardState,
    action: { cardId: string; title: string }
  ) => {
    const card = state.byId[action.cardId];
    if (card) {
      card.title = action.title;
      state.pendingIds[action.cardId] = true;
    }
  },

  [types.RENAME_FULFILLED]: (
    state: BoardState,
    action: { cardId: string }
  ) => {
    delete state.pendingIds[action.cardId];
  },

  [types.RENAME_REJECTED]: (
    state: BoardState,
    action: { cardId: string; previous: Card; error: string }
  ) => {
    state.byId[action.cardId] = action.previous;
    delete state.pendingIds[action.cardId];
    state.error = action.error;
  },

  // --- delete (optimistic) -------------------------------------------------

  [types.DELETE_PENDING]: (
    state: BoardState,
    action: { cardId: string; column: ColumnId }
  ) => {
    delete state.byId[action.cardId];
    removeFromColumn(state, action.column, action.cardId);
    state.pendingIds[action.cardId] = true;
  },

  [types.DELETE_FULFILLED]: (
    state: BoardState,
    action: { cardId: string }
  ) => {
    delete state.pendingIds[action.cardId];
  },

  [types.DELETE_REJECTED]: (
    state: BoardState,
    action: {
      cardId: string;
      previous: Card;
      column: ColumnId;
      index: number;
      error: string;
    }
  ) => {
    state.byId[action.cardId] = action.previous;
    insertIntoColumn(state, action.column, action.cardId, action.index);
    delete state.pendingIds[action.cardId];
    state.error = action.error;
  },

  // --- move (optimistic) ---------------------------------------------------

  [types.MOVE_PENDING]: (
    state: BoardState,
    action: { cardId: string; toColumn: ColumnId; toIndex: number }
  ) => {
    const card = state.byId[action.cardId];
    if (!card) return;
    removeFromColumn(state, card.column, action.cardId);
    card.column = action.toColumn;
    insertIntoColumn(state, action.toColumn, action.cardId, action.toIndex);
    state.pendingIds[action.cardId] = true;
  },

  [types.MOVE_FULFILLED]: (
    state: BoardState,
    action: { cardId: string }
  ) => {
    delete state.pendingIds[action.cardId];
  },

  [types.MOVE_REJECTED]: (
    state: BoardState,
    action: {
      cardId: string;
      previous: Card;
      fromColumn: ColumnId;
      fromIndex: number;
      error: string;
    }
  ) => {
    const card = state.byId[action.cardId];
    if (!card) return;
    removeFromColumn(state, card.column, action.cardId);
    card.column = action.fromColumn;
    insertIntoColumn(state, action.fromColumn, action.cardId, action.fromIndex);
    state.byId[action.cardId] = action.previous;
    delete state.pendingIds[action.cardId];
    state.error = action.error;
  },

  // --- error UI ------------------------------------------------------------

  [types.CLEAR_ERROR]: (state: BoardState) => {
    state.error = null;
  },
};
