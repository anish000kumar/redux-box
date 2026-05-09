import type { ColumnId } from '../board/types';
import { types } from './types';
import type { UiState } from './state';

type Mutations = Record<string, (state: any, action: any) => void>;

export const mutations: Mutations = {
  [types.OPEN_NEW_CARD]: (
    state: UiState,
    action: { column: ColumnId }
  ) => {
    state.newCardColumn = action.column;
  },
  [types.CLOSE_NEW_CARD]: (state: UiState) => {
    state.newCardColumn = null;
  },

  [types.START_RENAME]: (
    state: UiState,
    action: { cardId: string }
  ) => {
    state.renamingCardId = action.cardId;
  },
  [types.CANCEL_RENAME]: (state: UiState) => {
    state.renamingCardId = null;
  },

  [types.REQUEST_CONFIRM_DELETE]: (
    state: UiState,
    action: { cardId: string }
  ) => {
    state.pendingDeleteId = action.cardId;
  },
  [types.CANCEL_CONFIRM_DELETE]: (state: UiState) => {
    state.pendingDeleteId = null;
  },

  [types.BEGIN_DRAG]: (
    state: UiState,
    action: { cardId: string }
  ) => {
    state.draggingCardId = action.cardId;
  },
  [types.END_DRAG]: (state: UiState) => {
    state.draggingCardId = null;
  },

  [types.SHOW_TOAST]: (
    state: UiState,
    action: { kind: 'success' | 'error'; message: string }
  ) => {
    state.toast = { kind: action.kind, message: action.message };
  },
  [types.DISMISS_TOAST]: (state: UiState) => {
    state.toast = null;
  },
};
