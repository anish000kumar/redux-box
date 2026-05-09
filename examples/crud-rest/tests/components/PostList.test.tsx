import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import postsModule, {
  dispatchers as postDispatchers,
  type Post,
} from '../../src/store/posts';
import type { PostsState } from '../../src/store/posts/state';
import uiModule from '../../src/store/ui';
import PostList from '../../src/components/PostList';
import { postsApi } from '../../src/api/posts';

jest.mock('../../src/api/posts', () => ({
  postsApi: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockedApi = postsApi as jest.Mocked<typeof postsApi>;

const post = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  userId: 1,
  title: 'Hello',
  body: 'World',
  ...overrides,
});

interface AppState {
  posts: PostsState;
  ui: {
    isEditorOpen: boolean;
    editingPostId: number | null;
    pendingDeleteId: number | null;
  };
}

const stateOf = (store: { getState: () => unknown }) =>
  store.getState() as AppState;

function renderWithStore() {
  const store = createStore({ posts: postsModule, ui: uiModule });
  const utils = render(
    <Provider store={store}>
      <PostList />
    </Provider>
  );
  return { store, ...utils };
}

const flushSagas = () =>
  act(() => new Promise(resolve => setTimeout(resolve, 0)));

describe('<PostList />', () => {
  test('triggers a fetch on mount and renders the list', async () => {
    mockedApi.list.mockResolvedValue([
      post({ id: 1, title: 'Alpha' }),
      post({ id: 2, title: 'Beta' }),
    ]);

    renderWithStore();
    await flushSagas();

    expect(mockedApi.list).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  test('shows the empty state when no posts are returned', async () => {
    mockedApi.list.mockResolvedValue([]);

    renderWithStore();
    await flushSagas();

    expect(
      screen.getByText(/no posts yet — create one!/i)
    ).toBeInTheDocument();
  });

  test('shows an error and lets the user dismiss it', async () => {
    mockedApi.list.mockRejectedValue(new Error('network down'));

    const { store } = renderWithStore();
    await flushSagas();

    expect(screen.getByRole('alert')).toHaveTextContent('network down');

    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    // Dismiss clears every XHR slot's error. We assert via the list slot
    // (the one the failing fetch landed in).
    expect(stateOf(store).posts.list.error).toBeNull();
  });

  test('clicking "New post" opens the editor in create mode', async () => {
    mockedApi.list.mockResolvedValue([]);

    const { store } = renderWithStore();
    await flushSagas();

    await userEvent.click(screen.getByRole('button', { name: /new post/i }));
    expect(stateOf(store).ui.isEditorOpen).toBe(true);
    expect(stateOf(store).ui.editingPostId).toBeNull();
  });

  test('clicking Edit / Delete dispatches the right ui intent', async () => {
    mockedApi.list.mockResolvedValue([post({ id: 5, title: 'Edit me' })]);

    const { store } = renderWithStore();
    await flushSagas();

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(stateOf(store).ui.editingPostId).toBe(5);

    // close the editor and verify the delete intent fires next
    store.dispatch({ type: 'ui/CLOSE_EDITOR' });

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(stateOf(store).ui.pendingDeleteId).toBe(5);
  });
});

describe('<PostList /> + dispatcher direct dispatches', () => {
  test('manually dispatched createPost renders the optimistic row', async () => {
    mockedApi.list.mockResolvedValue([]);
    let resolveCreate: (value: Post) => void = () => {};
    mockedApi.create.mockImplementation(
      () =>
        new Promise<Post>(resolve => {
          resolveCreate = resolve;
        })
    );

    const { store } = renderWithStore();
    await flushSagas();

    await act(async () => {
      store.dispatch(
        postDispatchers.createPost({
          title: 'Saved',
          body: 'b',
          userId: 1,
        })
      );
      await Promise.resolve();
    });

    expect(screen.getByText('Saved')).toBeInTheDocument();

    resolveCreate(post({ id: 100, title: 'Saved' }));
    await flushSagas();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});
