import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import postsModule, { type Post } from '../../src/store/posts';
import uiModule, { dispatchers as uiDispatchers } from '../../src/store/ui';
import PostForm from '../../src/components/PostForm';
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

const stateOf = (store: { getState: () => unknown }) =>
  store.getState() as { ui: { isEditorOpen: boolean } };

function renderForm(preload?: { posts?: Post[]; editingId?: number | null }) {
  const store = createStore(
    { posts: postsModule, ui: uiModule },
    {
      preloadedState: preload?.posts
        ? {
            posts: {
              byId: Object.fromEntries(
                preload.posts.map(p => [p.id, p])
              ),
              allIds: preload.posts.map(p => p.id),
              isLoading: false,
              isSaving: false,
              error: null,
            },
            ui: {
              search: '',
              editingPostId: preload.editingId ?? null,
              isEditorOpen: true,
              pendingDeleteId: null,
              toast: null,
            },
          }
        : undefined,
    }
  );

  if (!preload) {
    store.dispatch(uiDispatchers.openEditor(null));
  }

  return {
    store,
    ...render(
      <Provider store={store}>
        <PostForm />
      </Provider>
    ),
  };
}

const flushSagas = () =>
  act(() => new Promise(resolve => setTimeout(resolve, 0)));

describe('<PostForm /> create mode', () => {
  test('renders empty inputs and a disabled submit', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: /new post/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create post/i })
    ).toBeDisabled();
  });

  test('typing enables submit and submitting fires createPost', async () => {
    mockedApi.create.mockResolvedValue(
      post({ id: 100, title: 'Hello', body: 'There' })
    );

    const { store } = renderForm();

    await userEvent.type(screen.getByLabelText(/title/i), 'Hello');
    await userEvent.type(screen.getByLabelText(/body/i), 'There');

    const submit = screen.getByRole('button', { name: /create post/i });
    expect(submit).toBeEnabled();

    await userEvent.click(submit);
    await flushSagas();

    expect(mockedApi.create).toHaveBeenCalledWith({
      title: 'Hello',
      body: 'There',
      userId: 1,
    });
    // The ui saga should close the editor on CREATE_FULFILLED.
    expect(stateOf(store).ui.isEditorOpen).toBe(false);
  });

  test('Cancel closes the editor without dispatching a create', async () => {
    const { store } = renderForm();

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(stateOf(store).ui.isEditorOpen).toBe(false);
    expect(mockedApi.create).not.toHaveBeenCalled();
  });
});

describe('<PostForm /> edit mode', () => {
  test('primes inputs from the existing post and submits an update', async () => {
    mockedApi.update.mockResolvedValue(
      post({ id: 5, title: 'Edited', body: 'Updated' })
    );

    const existing = post({ id: 5, title: 'Original', body: 'Body' });
    const { store } = renderForm({
      posts: [existing],
      editingId: 5,
    });

    expect(
      screen.getByRole('heading', { name: /edit post/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toHaveValue('Original');
    expect(screen.getByLabelText(/body/i)).toHaveValue('Body');

    await userEvent.clear(screen.getByLabelText(/title/i));
    await userEvent.type(screen.getByLabelText(/title/i), 'Edited');

    await userEvent.click(
      screen.getByRole('button', { name: /save changes/i })
    );
    await flushSagas();

    expect(mockedApi.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: 5, title: 'Edited' })
    );
    expect(stateOf(store).ui.isEditorOpen).toBe(false);
  });
});
