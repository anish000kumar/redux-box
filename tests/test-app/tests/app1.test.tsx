import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App1 from '../App1';
import testStore from '../store/index';

function renderWithRedux(
  ui: React.ReactElement,
  { store = testStore }: { store?: typeof testStore } = {}
) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

test('can render with redux with defaults', () => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  expect(getByTestId('username').textContent).toBe('a b');
  expect(getByTestId('country').textContent).toBe('USA');
  expect(getByTestId('dynamic-country').textContent).toBe('USA');
});

test('mutations work correctly', () => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  fireEvent.click(getByTestId('change-firstname'));
  expect(getByTestId('username').textContent).toBe('anish b');
});

test('sagas work correctly', async () => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  fireEvent.click(getByTestId('fetchProfile'));
  await waitFor(() => {
    expect(getByTestId('username').textContent).toBe('anish kumar');
  });
  const userState = (testStore.getState() as any).user;
  expect(userState.firstname).toBe('anish');
  expect(userState.lastname).toBe('kumar');
  expect(getByTestId('country').textContent).toBe('India');
  expect(getByTestId('dynamic-country').textContent).toBe('India');
});
