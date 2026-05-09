import { createStore } from 'redux-box';

import boardModule, { type Card } from '../../../src/store/board';
import {
  getCardById,
  getCardCount,
  getCardsInColumn,
  getError,
  getIsCardPending,
  getIsLoading,
} from '../../../src/store/board/selectors';
import { emptyColumns } from '../../../src/store/board/state';

beforeAll(() => {
  // Register the module against a real store so `module.select` /
  // `module.lazySelect` resolve to the right slice key.
  createStore({ board: boardModule });
});

const card = (overrides: Partial<Card> = {}): Card => ({
  id: '1',
  title: 'A',
  column: 'todo',
  assignee: null,
  ...overrides,
});

const stateWith = (...cards: Card[]) => {
  const cols = emptyColumns();
  const byId: Record<string, Card> = {};
  for (const c of cards) {
    byId[c.id] = c;
    cols[c.column].push(c.id);
  }
  return {
    board: {
      byId,
      columns: cols,
      isLoading: false,
      pendingIds: {},
      error: null,
    },
  };
};

describe('eager selectors', () => {
  test('getCardCount sums cards across all columns', () => {
    const state = stateWith(
      card({ id: '1', column: 'todo' }),
      card({ id: '2', column: 'in-progress' }),
      card({ id: '3', column: 'done' })
    );
    expect(getCardCount(state)).toBe(3);
  });

  test('getIsLoading / getError surface their flags', () => {
    const state = {
      board: {
        ...stateWith().board,
        isLoading: true,
        error: 'oh',
      },
    };
    expect(getIsLoading(state)).toBe(true);
    expect(getError(state)).toBe('oh');
  });
});

describe('lazy selectors', () => {
  test('getCardsInColumn returns cards in their column order', () => {
    const a = card({ id: '1', column: 'todo' });
    const b = card({ id: '2', column: 'todo' });
    const c = card({ id: '3', column: 'done' });
    const state = stateWith(a, b, c);

    expect(getCardsInColumn(state, 'todo')).toEqual([a, b]);
    expect(getCardsInColumn(state, 'done')).toEqual([c]);
    expect(getCardsInColumn(state, 'in-progress')).toEqual([]);
  });

  test('getCardsInColumn is slice-keyed memoised', () => {
    const a = card({ id: '1', column: 'todo' });
    const state = stateWith(a);

    const first = getCardsInColumn(state, 'todo');
    const second = getCardsInColumn(state, 'todo');
    expect(second).toBe(first);
  });

  test('getCardById and getIsCardPending are independent reads', () => {
    const target = card({ id: '7', title: 'lookup me' });
    const baseState = stateWith(target);
    const pendingState = {
      board: { ...baseState.board, pendingIds: { '7': true as const } },
    };

    expect(getCardById(baseState, '7')).toEqual(target);
    expect(getCardById(baseState, 'nope')).toBeUndefined();
    expect(getIsCardPending(baseState, '7')).toBe(false);
    expect(getIsCardPending(pendingState, '7')).toBe(true);
  });
});
