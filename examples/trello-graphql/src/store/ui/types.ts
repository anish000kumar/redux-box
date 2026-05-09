export const types = {
  OPEN_NEW_CARD: 'ui/OPEN_NEW_CARD',
  CLOSE_NEW_CARD: 'ui/CLOSE_NEW_CARD',

  START_RENAME: 'ui/START_RENAME',
  CANCEL_RENAME: 'ui/CANCEL_RENAME',

  REQUEST_CONFIRM_DELETE: 'ui/REQUEST_CONFIRM_DELETE',
  CANCEL_CONFIRM_DELETE: 'ui/CANCEL_CONFIRM_DELETE',

  /**
   * Pure UI bookkeeping: which card the user is currently dragging.
   * The actual move is dispatched against the board module on drop.
   */
  BEGIN_DRAG: 'ui/BEGIN_DRAG',
  END_DRAG: 'ui/END_DRAG',

  SHOW_TOAST: 'ui/SHOW_TOAST',
  DISMISS_TOAST: 'ui/DISMISS_TOAST',
} as const;
