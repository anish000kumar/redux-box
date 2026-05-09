import { COLUMN_IDS, type ColumnId } from './types';

/**
 * One Trello-style card. The remote API only knows about `completed`
 * (boolean), so the third "In Progress" lane lives only in the client —
 * see `cardToCompleted` in `sagas.ts` for the persistence rule.
 */
export interface Card {
  id: string;
  title: string;
  column: ColumnId;
  assignee: string | null;
}

/**
 * Normalised board state:
 *
 *   byId       cards keyed by id (O(1) lookup)
 *   columns    column id → ordered array of card ids (renders use this)
 *   pendingIds set of card ids whose mutation is still in flight, kept as
 *              a `Record<string, true>` so immer doesn't need
 *              `enableMapSet()` to support it
 *
 * Storing the order separately means we don't have to sort on every
 * render, and the reducer can apply moves with a single `splice`.
 */
export interface BoardState {
  byId: Record<string, Card>;
  columns: Record<ColumnId, string[]>;
  isLoading: boolean;
  pendingIds: Record<string, true>;
  error: string | null;
}

export function emptyColumns(): Record<ColumnId, string[]> {
  return COLUMN_IDS.reduce(
    (acc, id) => {
      acc[id] = [];
      return acc;
    },
    {} as Record<ColumnId, string[]>
  );
}

export const initialState: BoardState = {
  byId: {},
  columns: emptyColumns(),
  isLoading: false,
  pendingIds: {},
  error: null,
};
