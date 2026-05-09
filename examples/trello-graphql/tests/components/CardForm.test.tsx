import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { createStore } from 'redux-box';

import boardModule from '../../src/store/board';
import uiModule, { dispatchers as uiDispatchers } from '../../src/store/ui';
import CardForm from '../../src/components/CardForm';
import { gqlRequest } from '../../src/graphql/client';

jest.mock('../../src/graphql/client', () => ({
  gqlRequest: jest.fn(),
  GraphQLError: class GraphQLError extends Error {},
}));

const mockedGql = gqlRequest as jest.MockedFunction<typeof gqlRequest>;

const stateOf = (store: { getState: () => unknown }) =>
  store.getState() as {
    ui: { newCardColumn: string | null };
    board: { columns: Record<string, string[]> };
  };

function renderForm() {
  const store = createStore({ board: boardModule, ui: uiModule });
  store.dispatch(uiDispatchers.openNewCard('in-progress'));
  return {
    store,
    ...render(
      <Provider store={store}>
        <CardForm />
      </Provider>
    ),
  };
}

const flushSagas = () =>
  act(() => new Promise(resolve => setTimeout(resolve, 0)));

describe('<CardForm />', () => {
  test('renders nothing when no column is targeted', () => {
    const store = createStore({ board: boardModule, ui: uiModule });
    const { container } = render(
      <Provider store={store}>
        <CardForm />
      </Provider>
    );
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the column name in the heading', () => {
    renderForm();
    expect(
      screen.getByRole('heading', { name: /new card in.*in progress/i })
    ).toBeInTheDocument();
  });

  test('Add button is disabled until the title is non-empty', async () => {
    renderForm();

    const submit = screen.getByRole('button', { name: /add card/i });
    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/title/i), 'Hello');
    expect(submit).toBeEnabled();
  });

  test('Cancel closes the form without dispatching a create', async () => {
    const { store } = renderForm();

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(stateOf(store).ui.newCardColumn).toBeNull();
    expect(mockedGql).not.toHaveBeenCalled();
  });

  test('submitting fires createCard and closes on FULFILLED', async () => {
    mockedGql.mockResolvedValueOnce({
      createTodo: { id: '900', title: 'Pay rent', completed: false },
    });

    const { store } = renderForm();
    await userEvent.type(screen.getByLabelText(/title/i), 'Pay rent');
    await userEvent.click(screen.getByRole('button', { name: /add card/i }));
    await flushSagas();

    expect(mockedGql).toHaveBeenCalledTimes(1);
    expect(stateOf(store).ui.newCardColumn).toBeNull();
    // Card landed in the in-progress column.
    expect(
      stateOf(store).board.columns['in-progress']?.length ?? 0
    ).toBeGreaterThan(0);
  });
});
