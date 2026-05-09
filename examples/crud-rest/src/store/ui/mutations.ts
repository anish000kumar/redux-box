import { types } from './types';
import type { UiState } from './state';

type Mutations = Record<string, (state: any, action: any) => void>;

export const mutations: Mutations = {
  [types.SET_SEARCH]: (state: UiState, action: { search: string }) => {
    state.search = action.search;
  },

  [types.OPEN_EDITOR]: (
    state: UiState,
    action: { postId: number | null }
  ) => {
    state.isEditorOpen = true;
    state.editingPostId = action.postId;
  },
  [types.CLOSE_EDITOR]: (state: UiState) => {
    state.isEditorOpen = false;
    state.editingPostId = null;
  },

  [types.REQUEST_CONFIRM_DELETE]: (
    state: UiState,
    action: { postId: number }
  ) => {
    state.pendingDeleteId = action.postId;
  },
  [types.CANCEL_CONFIRM_DELETE]: (state: UiState) => {
    state.pendingDeleteId = null;
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
