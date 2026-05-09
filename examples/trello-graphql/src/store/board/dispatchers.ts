import { types, type ColumnId } from './types';

interface CreateInput {
  title: string;
  column: ColumnId;
}

interface MoveInput {
  cardId: string;
  toColumn: ColumnId;
  /** Position within the target column's id-array. Defaults to the end. */
  toIndex?: number;
}

/**
 * Pure intent dispatchers. Components import these via
 * `connectStore({ mapDispatchers })` and never touch action types.
 */
export const dispatchers = {
  fetchBoard: (limit = 12) =>
    ({ type: types.FETCH, limit }) as const,

  createCard: (input: CreateInput) =>
    ({ type: types.CREATE, ...input }) as const,

  renameCard: (cardId: string, title: string) =>
    ({ type: types.RENAME, cardId, title }) as const,

  deleteCard: (cardId: string) =>
    ({ type: types.DELETE, cardId }) as const,

  moveCard: (input: MoveInput) =>
    ({ type: types.MOVE, ...input }) as const,

  clearError: () => ({ type: types.CLEAR_ERROR }) as const,
};
