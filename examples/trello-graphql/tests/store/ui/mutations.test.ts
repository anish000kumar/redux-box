import { produce } from 'immer';

import { mutations } from '../../../src/store/ui/mutations';
import { initialState } from '../../../src/store/ui/state';
import { types } from '../../../src/store/ui/types';

function apply(state: typeof initialState, action: any) {
  const fn = mutations[action.type];
  if (!fn) return state;
  return produce(state, draft => {
    fn(draft, action);
  });
}

describe('ui mutations', () => {
  test('OPEN_NEW_CARD records the column', () => {
    const next = apply(initialState, {
      type: types.OPEN_NEW_CARD,
      column: 'in-progress',
    });
    expect(next.newCardColumn).toBe('in-progress');
  });

  test('CLOSE_NEW_CARD clears it', () => {
    const next = apply(
      { ...initialState, newCardColumn: 'todo' },
      { type: types.CLOSE_NEW_CARD }
    );
    expect(next.newCardColumn).toBeNull();
  });

  test('START_RENAME / CANCEL_RENAME round-trip', () => {
    const a = apply(initialState, {
      type: types.START_RENAME,
      cardId: '7',
    });
    expect(a.renamingCardId).toBe('7');

    const b = apply(a, { type: types.CANCEL_RENAME });
    expect(b.renamingCardId).toBeNull();
  });

  test('REQUEST_CONFIRM_DELETE / CANCEL_CONFIRM_DELETE round-trip', () => {
    const a = apply(initialState, {
      type: types.REQUEST_CONFIRM_DELETE,
      cardId: '9',
    });
    expect(a.pendingDeleteId).toBe('9');

    const b = apply(a, { type: types.CANCEL_CONFIRM_DELETE });
    expect(b.pendingDeleteId).toBeNull();
  });

  test('BEGIN_DRAG / END_DRAG track the dragged id', () => {
    const a = apply(initialState, { type: types.BEGIN_DRAG, cardId: '5' });
    expect(a.draggingCardId).toBe('5');

    const b = apply(a, { type: types.END_DRAG });
    expect(b.draggingCardId).toBeNull();
  });

  test('SHOW_TOAST / DISMISS_TOAST', () => {
    const a = apply(initialState, {
      type: types.SHOW_TOAST,
      kind: 'error',
      message: 'oh',
    });
    expect(a.toast).toEqual({ kind: 'error', message: 'oh' });

    const b = apply(a, { type: types.DISMISS_TOAST });
    expect(b.toast).toBeNull();
  });
});
