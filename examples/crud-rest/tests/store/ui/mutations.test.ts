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
  test('SET_SEARCH stores the new value', () => {
    const next = apply(initialState, {
      type: types.SET_SEARCH,
      search: 'foo',
    });
    expect(next.search).toBe('foo');
  });

  test('OPEN_EDITOR opens for an existing id', () => {
    const next = apply(initialState, {
      type: types.OPEN_EDITOR,
      postId: 7,
    });
    expect(next).toMatchObject({ isEditorOpen: true, editingPostId: 7 });
  });

  test('OPEN_EDITOR with null is the create-mode signal', () => {
    const next = apply(initialState, {
      type: types.OPEN_EDITOR,
      postId: null,
    });
    expect(next).toMatchObject({ isEditorOpen: true, editingPostId: null });
  });

  test('CLOSE_EDITOR clears both fields', () => {
    const next = apply(
      { ...initialState, isEditorOpen: true, editingPostId: 7 },
      { type: types.CLOSE_EDITOR }
    );
    expect(next).toMatchObject({ isEditorOpen: false, editingPostId: null });
  });

  test('REQUEST_CONFIRM_DELETE / CANCEL_CONFIRM_DELETE round-trip', () => {
    const a = apply(initialState, {
      type: types.REQUEST_CONFIRM_DELETE,
      postId: 9,
    });
    expect(a.pendingDeleteId).toBe(9);

    const b = apply(a, { type: types.CANCEL_CONFIRM_DELETE });
    expect(b.pendingDeleteId).toBeNull();
  });

  test('SHOW_TOAST writes the kind + message', () => {
    const next = apply(initialState, {
      type: types.SHOW_TOAST,
      kind: 'error',
      message: 'oops',
    });
    expect(next.toast).toEqual({ kind: 'error', message: 'oops' });
  });

  test('DISMISS_TOAST clears the toast', () => {
    const next = apply(
      {
        ...initialState,
        toast: { kind: 'success', message: 'hi' },
      },
      { type: types.DISMISS_TOAST }
    );
    expect(next.toast).toBeNull();
  });
});
