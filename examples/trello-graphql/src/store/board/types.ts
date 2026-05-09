/**
 * Action types for the board module.
 *
 * Same intent / lifecycle split as the CRUD example:
 *
 * - **Intent** actions describe what the user just did (drop a card,
 *   create a card, ...). The reducer ignores them — sagas listen.
 * - **Lifecycle** actions are emitted by sagas with fully-formed payloads
 *   and are the only ones the reducer mutates state for.
 */
export const types = {
  // intent
  FETCH: 'board/FETCH',
  CREATE: 'board/CREATE',
  RENAME: 'board/RENAME',
  DELETE: 'board/DELETE',
  /** User drops a card onto a column (drag-and-drop or move buttons). */
  MOVE: 'board/MOVE',

  // lifecycle: list
  FETCH_PENDING: 'board/FETCH_PENDING',
  FETCH_FULFILLED: 'board/FETCH_FULFILLED',
  FETCH_REJECTED: 'board/FETCH_REJECTED',

  // lifecycle: create
  CREATE_PENDING: 'board/CREATE_PENDING',
  CREATE_FULFILLED: 'board/CREATE_FULFILLED',
  CREATE_REJECTED: 'board/CREATE_REJECTED',

  // lifecycle: rename
  RENAME_PENDING: 'board/RENAME_PENDING',
  RENAME_FULFILLED: 'board/RENAME_FULFILLED',
  RENAME_REJECTED: 'board/RENAME_REJECTED',

  // lifecycle: delete
  DELETE_PENDING: 'board/DELETE_PENDING',
  DELETE_FULFILLED: 'board/DELETE_FULFILLED',
  DELETE_REJECTED: 'board/DELETE_REJECTED',

  // lifecycle: move
  MOVE_PENDING: 'board/MOVE_PENDING',
  MOVE_FULFILLED: 'board/MOVE_FULFILLED',
  MOVE_REJECTED: 'board/MOVE_REJECTED',

  CLEAR_ERROR: 'board/CLEAR_ERROR',
} as const;

export type BoardActionType = (typeof types)[keyof typeof types];

export type ColumnId = 'todo' | 'in-progress' | 'done';

export const COLUMN_IDS: readonly ColumnId[] = [
  'todo',
  'in-progress',
  'done',
] as const;

export const COLUMN_LABELS: Record<ColumnId, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};
