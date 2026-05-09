/**
 * Local UI state that doesn't belong on the server (search box, modals,
 * toast). Kept in its own module so the posts module can stay focused on
 * the entity store and the lifecycle of CRUD requests.
 */
export interface UiState {
  search: string;
  editingPostId: number | null; // null = create mode when editor is open
  isEditorOpen: boolean;
  pendingDeleteId: number | null;
  toast: { kind: 'success' | 'error'; message: string } | null;
}

export const initialState: UiState = {
  search: '',
  editingPostId: null,
  isEditorOpen: false,
  pendingDeleteId: null,
  toast: null,
};
