import { createStore } from 'redux-box';

import boardModule, {
  dispatchers,
  type Card,
} from '../../../src/store/board';
import {
  getCardCount,
  getCardsInColumn,
  getError,
  getIsCardPending,
} from '../../../src/store/board/selectors';
import { gqlRequest } from '../../../src/graphql/client';

jest.mock('../../../src/graphql/client', () => ({
  gqlRequest: jest.fn(),
  GraphQLError: class GraphQLError extends Error {},
}));

const mockedGql = gqlRequest as jest.MockedFunction<typeof gqlRequest>;

const flushSagas = () => new Promise(resolve => setTimeout(resolve, 0));

function makeStore() {
  return createStore({ board: boardModule });
}

describe('board module — integration', () => {
  test('fetch flow groups cards by completed flag', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: {
        data: [
          { id: '1', title: 'a', completed: false, user: null },
          { id: '2', title: 'b', completed: true, user: null },
        ],
      },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(2));
    await flushSagas();

    const todoCards = getCardsInColumn(store.getState(), 'todo') as Card[];
    const doneCards = getCardsInColumn(store.getState(), 'done') as Card[];
    expect(todoCards.map(c => c.id)).toEqual(['1']);
    expect(doneCards.map(c => c.id)).toEqual(['2']);
    expect(getCardCount(store.getState())).toBe(2);
  });

  test('fetch failure surfaces the error message', async () => {
    mockedGql.mockRejectedValueOnce(new Error('down'));

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(2));
    await flushSagas();

    expect(getError(store.getState())).toBe('down');
  });

  test('create flow: optimistic insert at top, then id reconciliation', async () => {
    let resolveCreate: (value: any) => void = () => {};
    mockedGql.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveCreate = resolve;
        })
    );

    const store = makeStore();
    store.dispatch(
      dispatchers.createCard({ title: 'New', column: 'todo' })
    );

    await flushSagas();
    const optimistic = getCardsInColumn(store.getState(), 'todo') as Card[];
    expect(optimistic).toHaveLength(1);
    expect(optimistic[0]?.id).toMatch(/^temp-/);
    expect(getIsCardPending(store.getState(), optimistic[0]!.id)).toBe(true);

    resolveCreate({
      createTodo: { id: '500', title: 'New', completed: false },
    });
    await flushSagas();
    const settled = getCardsInColumn(store.getState(), 'todo') as Card[];
    expect(settled.map(c => c.id)).toEqual(['500']);
    expect(getIsCardPending(store.getState(), '500')).toBe(false);
  });

  test('create rollback removes the optimistic card', async () => {
    mockedGql.mockRejectedValueOnce(new Error('nope'));

    const store = makeStore();
    store.dispatch(
      dispatchers.createCard({ title: 'X', column: 'in-progress' })
    );
    await flushSagas();

    expect(
      getCardsInColumn(store.getState(), 'in-progress')
    ).toEqual([]);
    expect(getError(store.getState())).toBe('nope');
  });

  test('move flow within "completed = false" columns skips the network call', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [{ id: '1', title: 'a', completed: false, user: null }] },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(1));
    await flushSagas();

    mockedGql.mockClear();

    store.dispatch(
      dispatchers.moveCard({ cardId: '1', toColumn: 'in-progress' })
    );
    await flushSagas();

    expect(mockedGql).not.toHaveBeenCalled();
    const todoCards = getCardsInColumn(store.getState(), 'todo') as Card[];
    const ipCards = getCardsInColumn(
      store.getState(),
      'in-progress'
    ) as Card[];
    expect(todoCards).toHaveLength(0);
    expect(ipCards.map(c => c.id)).toEqual(['1']);
  });

  test('move to "done" calls UPDATE_TODO and reflects new column', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [{ id: '1', title: 'a', completed: false, user: null }] },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(1));
    await flushSagas();

    mockedGql.mockResolvedValueOnce({
      updateTodo: { id: '1', title: 'a', completed: true },
    });

    store.dispatch(
      dispatchers.moveCard({ cardId: '1', toColumn: 'done' })
    );
    await flushSagas();

    const doneCards = getCardsInColumn(store.getState(), 'done') as Card[];
    expect(doneCards.map(c => c.id)).toEqual(['1']);
    expect(mockedGql).toHaveBeenCalledTimes(2); // fetch + update
  });

  test('move rollback restores the original column on failure', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: { data: [{ id: '1', title: 'a', completed: false, user: null }] },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(1));
    await flushSagas();

    mockedGql.mockRejectedValueOnce(new Error('rejected'));

    store.dispatch(
      dispatchers.moveCard({ cardId: '1', toColumn: 'done' })
    );
    await flushSagas();

    const todoCards = getCardsInColumn(store.getState(), 'todo') as Card[];
    expect(todoCards.map(c => c.id)).toEqual(['1']);
    expect(getError(store.getState())).toBe('rejected');
  });

  test('rename flow: optimistic title update, then FULFILLED', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: {
        data: [
          { id: '1', title: 'old', completed: false, user: null },
        ],
      },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(1));
    await flushSagas();

    let resolveRename: (value: any) => void = () => {};
    mockedGql.mockImplementationOnce(
      () =>
        new Promise(resolve => {
          resolveRename = resolve;
        })
    );

    store.dispatch(dispatchers.renameCard('1', 'new'));
    await flushSagas();
    expect(
      (getCardsInColumn(store.getState(), 'todo') as Card[])[0]?.title
    ).toBe('new');
    expect(getIsCardPending(store.getState(), '1')).toBe(true);

    resolveRename({
      updateTodo: { id: '1', title: 'new', completed: false },
    });
    await flushSagas();
    expect(getIsCardPending(store.getState(), '1')).toBe(false);
  });

  test('delete flow: optimistic removal, FULFILLED on success', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: {
        data: [
          { id: '1', title: 'a', completed: false, user: null },
          { id: '2', title: 'b', completed: false, user: null },
        ],
      },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(2));
    await flushSagas();

    mockedGql.mockResolvedValueOnce({ deleteTodo: true });

    store.dispatch(dispatchers.deleteCard('1'));
    await flushSagas();

    const todoCards = getCardsInColumn(store.getState(), 'todo') as Card[];
    expect(todoCards.map(c => c.id)).toEqual(['2']);
  });

  test('delete rollback restores the card at its original index', async () => {
    mockedGql.mockResolvedValueOnce({
      todos: {
        data: [
          { id: '1', title: 'a', completed: false, user: null },
          { id: '2', title: 'b', completed: false, user: null },
          { id: '3', title: 'c', completed: false, user: null },
        ],
      },
    });

    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(3));
    await flushSagas();

    mockedGql.mockRejectedValueOnce(new Error('nope'));

    store.dispatch(dispatchers.deleteCard('2'));
    await flushSagas();

    const todoCards = getCardsInColumn(store.getState(), 'todo') as Card[];
    expect(todoCards.map(c => c.id)).toEqual(['1', '2', '3']);
    expect(getError(store.getState())).toBe('nope');
  });

  test('clearError dispatcher resets the error field', async () => {
    mockedGql.mockRejectedValueOnce(new Error('fail'));
    const store = makeStore();
    store.dispatch(dispatchers.fetchBoard(1));
    await flushSagas();
    expect(getError(store.getState())).toBe('fail');

    store.dispatch(dispatchers.clearError());
    expect(getError(store.getState())).toBeNull();
  });
});
