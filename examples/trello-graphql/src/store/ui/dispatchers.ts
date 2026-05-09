import type { ColumnId } from '../board/types';
import { types } from './types';

export const dispatchers = {
  openNewCard: (column: ColumnId) =>
    ({ type: types.OPEN_NEW_CARD, column }) as const,
  closeNewCard: () => ({ type: types.CLOSE_NEW_CARD }) as const,

  startRename: (cardId: string) =>
    ({ type: types.START_RENAME, cardId }) as const,
  cancelRename: () => ({ type: types.CANCEL_RENAME }) as const,

  requestConfirmDelete: (cardId: string) =>
    ({ type: types.REQUEST_CONFIRM_DELETE, cardId }) as const,
  cancelConfirmDelete: () =>
    ({ type: types.CANCEL_CONFIRM_DELETE }) as const,

  beginDrag: (cardId: string) =>
    ({ type: types.BEGIN_DRAG, cardId }) as const,
  endDrag: () => ({ type: types.END_DRAG }) as const,

  showToast: (kind: 'success' | 'error', message: string) =>
    ({ type: types.SHOW_TOAST, kind, message }) as const,
  dismissToast: () => ({ type: types.DISMISS_TOAST }) as const,
};
