import uiModule from './index';
import type { UiState } from './state';

export const getNewCardColumn = uiModule.select(
  (s: UiState) => s.newCardColumn
);
export const getRenamingCardId = uiModule.select(
  (s: UiState) => s.renamingCardId
);
export const getPendingDeleteId = uiModule.select(
  (s: UiState) => s.pendingDeleteId
);
export const getDraggingCardId = uiModule.select(
  (s: UiState) => s.draggingCardId
);
export const getToast = uiModule.select((s: UiState) => s.toast);
