import uiModule from './index';
import type { UiState } from './state';

export const getSearch = uiModule.select((s: UiState) => s.search);
export const getEditingPostId = uiModule.select(
  (s: UiState) => s.editingPostId
);
export const getIsEditorOpen = uiModule.select(
  (s: UiState) => s.isEditorOpen
);
export const getPendingDeleteId = uiModule.select(
  (s: UiState) => s.pendingDeleteId
);
export const getToast = uiModule.select((s: UiState) => s.toast);
