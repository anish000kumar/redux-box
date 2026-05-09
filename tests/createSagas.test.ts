import createSagas from '../src/createSagas';
import { takeLatest } from 'redux-saga/effects';

const api = {
  fetchUsers: function() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({ data: [] });
      }, 200);
    });
  },
};

describe('createSagas', () => {
  it('should create sagas array', () => {
    let result = createSagas({
      fetchUsers: function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('object');
  });

  it('should create sagas array for watchFor every', () => {
    let result = createSagas({
      'fetchUsers__@latest': function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('object');
  });

  it('should create sagas array for watchFor every', () => {
    let result = createSagas({
      'fetchUsers__@every': function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('object');
  });
});
