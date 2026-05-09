import type { ColumnId } from '../board/types';

export interface UiState {
  newCardColumn: ColumnId | null; // open the new-card form for this column
  renamingCardId: string | null;
  pendingDeleteId: string | null;
  draggingCardId: string | null;
  toast: { kind: 'success' | 'error'; message: string } | null;
}

export const initialState: UiState = {
  newCardColumn: null,
  renamingCardId: null,
  pendingDeleteId: null,
  draggingCardId: null,
  toast: null,
};
