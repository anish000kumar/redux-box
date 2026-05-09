import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import boardModule from '../../src/store/board';
import uiModule from '../../src/store/ui';
import App from '../../src/App';
import { gqlRequest } from '../../src/graphql/client';
import { DRAG_MIME } from '../../src/components/Card';

jest.mock('../../src/graphql/client', () => ({
  gqlRequest: jest.fn(),
  GraphQLError: class GraphQLError extends Error {},
}));

const mockedGql = gqlRequest as jest.MockedFunction<typeof gqlRequest>;

function renderBoard() {
  const store = createStore({ board: boardModule, ui: uiModule });
  // We render the full App so the modals (CardForm, ConfirmDialog) and
  // the toast surface are present — they're siblings of <Board /> in
  // the real app and the cross-component flows we're testing here
  // depend on them being mounted.
  const utils = render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  return { store, ...utils };
}

const flushSagas = () =>
  act(() => new Promise(resolve => setTimeout(resolve, 0)));

const todo = (
  id: string,
  title: string,
  completed = false
) => ({
  id,
  title,
  completed,
  user: null,
});

describe('<Board />', () => {
  test('fetches the board on mount and renders three columns', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [todo('1', 'A'), todo('2', 'B', true)] },
    });

    renderBoard();
    await flushSagas();

    expect(mockedGql).toHaveBeenCalledTimes(1);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    const todoCol = screen.getByTestId('column-todo');
    const doneCol = screen.getByTestId('column-done');
    expect(within(todoCol).getByText('A')).toBeInTheDocument();
    expect(within(doneCol).getByText('B')).toBeInTheDocument();
  });

  test('shows a load message until the fetch resolves', async () => {
    let resolve!: (v: any) => void;
    mockedGql.mockImplementation(
      () => new Promise(r => (resolve = r))
    );

    renderBoard();
    expect(screen.getByText(/loading board/i)).toBeInTheDocument();

    await act(async () => {
      resolve({ todos: { data: [] } });
      await Promise.resolve();
    });
  });

  test('shows an error and lets the user dismiss it', async () => {
    mockedGql.mockRejectedValueOnce(new Error('network down'));

    renderBoard();
    await flushSagas();

    // The board surfaces the error inline in role="alert"; the Toast
    // component (rendered alongside) also shows the same message in
    // role="status". We assert on the alert specifically.
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('network down');
    await userEvent.click(within(alert).getByRole('button', { name: /dismiss/i }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('"Add a card" opens the form, submitting creates a card', async () => {
    mockedGql.mockResolvedValueOnce({ todos: { data: [] } });
    renderBoard();
    await flushSagas();

    const todoCol = screen.getByTestId('column-todo');
    await userEvent.click(
      within(todoCol).getByRole('button', { name: /add a card/i })
    );

    expect(
      screen.getByRole('heading', { name: /new card in/i })
    ).toBeInTheDocument();

    mockedGql.mockResolvedValueOnce({
      createTodo: { id: '300', title: 'Buy milk', completed: false },
    });

    await userEvent.type(screen.getByLabelText(/title/i), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: /add card/i }));
    await flushSagas();

    expect(within(todoCol).getByText('Buy milk')).toBeInTheDocument();
    // Modal should auto-close on FULFILLED.
    expect(
      screen.queryByRole('heading', { name: /new card in/i })
    ).not.toBeInTheDocument();
  });

  test('renaming a card updates the title and closes the inline editor', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [todo('1', 'old title')] },
    });
    renderBoard();
    await flushSagas();

    await userEvent.click(
      screen.getByRole('button', { name: /edit old title/i })
    );

    const input = screen.getByLabelText(/rename old title/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'shiny new title');

    mockedGql.mockResolvedValueOnce({
      updateTodo: { id: '1', title: 'shiny new title', completed: false },
    });

    await userEvent.click(screen.getByRole('button', { name: /save/i }));
    await flushSagas();

    expect(screen.getByText('shiny new title')).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/rename old title/i)
    ).not.toBeInTheDocument();
  });

  test('deleting a card opens confirm, confirming dispatches delete', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [todo('1', 'Doomed')] },
    });
    renderBoard();
    await flushSagas();

    await userEvent.click(
      screen.getByRole('button', { name: /delete doomed/i })
    );

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByRole('heading', { name: /delete card\?/i })
    ).toBeInTheDocument();
    // The dialog renders the title in curly quotes (“Doomed”).
    expect(within(dialog).getByText(/Doomed/)).toBeInTheDocument();

    mockedGql.mockResolvedValueOnce({ deleteTodo: true });
    await userEvent.click(
      within(dialog).getByRole('button', { name: /^delete$/i })
    );
    await flushSagas();

    expect(screen.queryByText('Doomed')).not.toBeInTheDocument();
  });

  test('drag and drop moves a card between columns', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [todo('1', 'Drag me')] },
    });
    renderBoard();
    await flushSagas();

    const card = screen.getByTestId('card-1');
    const doneCol = screen.getByTestId('column-done');

    // Synthesise the drag/drop sequence. We pass a real DataTransfer-like
    // object so the column's `drop` handler can read the card id back.
    const data: Record<string, string> = {};
    const dataTransfer = {
      types: [DRAG_MIME],
      effectAllowed: '',
      dropEffect: '',
      setData(type: string, value: string) {
        data[type] = value;
      },
      getData(type: string) {
        return data[type] ?? '';
      },
    };

    mockedGql.mockResolvedValueOnce({
      updateTodo: { id: '1', title: 'Drag me', completed: true },
    });

    await act(async () => {
      // RTL's `fireEvent` lets us pass `dataTransfer` straight into the
      // synthetic event, which the column's drop handler reads back.
      fireEvent.dragStart(card, { dataTransfer });
      fireEvent.dragOver(doneCol, { dataTransfer });
      fireEvent.drop(doneCol, { dataTransfer });
      await Promise.resolve();
    });

    await flushSagas();

    const doneCol2 = screen.getByTestId('column-done');
    expect(within(doneCol2).getByText('Drag me')).toBeInTheDocument();
  });
});
