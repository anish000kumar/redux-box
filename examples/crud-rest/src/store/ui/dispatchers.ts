import { types } from './types';

export const dispatchers = {
  setSearch: (search: string) =>
    ({ type: types.SET_SEARCH, search }) as const,

  openEditor: (postId: number | null = null) =>
    ({ type: types.OPEN_EDITOR, postId }) as const,
  closeEditor: () => ({ type: types.CLOSE_EDITOR }) as const,

  requestConfirmDelete: (postId: number) =>
    ({ type: types.REQUEST_CONFIRM_DELETE, postId }) as const,
  cancelConfirmDelete: () =>
    ({ type: types.CANCEL_CONFIRM_DELETE }) as const,

  showToast: (kind: 'success' | 'error', message: string) =>
    ({ type: types.SHOW_TOAST, kind, message }) as const,
  dismissToast: () => ({ type: types.DISMISS_TOAST }) as const,
};
