import React from 'react';
import { Provider } from 'react-redux';
import { render, fireEvent, cleanup } from 'react-testing-library';
import 'jest-dom/extend-expect';
import App1 from '../App1';
import testStore from '../store/index';

afterEach(cleanup);

function renderWithRedux(ui, { store = testStore } = {}) {
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    // adding `store` to the returned utilities to allow us
    // to reference it in our tests (just try to avoid using
    // this to test implementation details).
    store,
  };
}

test('can render with redux with defaults', () => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  expect(getByTestId('username').textContent).toBe('a b');
  expect(getByTestId('country').textContent).toBe('USA');
});

test('mutations work correctly', () => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  getByTestId('change-firstname').click();
  expect(getByTestId('username').textContent).toBe('anish b');
});

test('sagas work correctly', done => {
  const { getByTestId } = renderWithRedux(<App1 testProp="hi" />);
  getByTestId('fetchProfile').click();
  setTimeout(() => {
    const store = testStore;
    const userModule = store.getState().user;
    expect(userModule.firstname).toBe('anish');
    expect(userModule.lastname).toBe('kumar');
    expect(getByTestId('username').textContent).toBe('anish kumar');
    expect(getByTestId('country').textContent).toBe('India');
    done();
  }, 1000);
});
