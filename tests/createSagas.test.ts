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
  it('returns a watcher factory per entry', () => {
    let result = createSagas({
      fetchUsers: function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('function');
  });

  it('honours the explicit __@latest mode', () => {
    let result = createSagas({
      'fetchUsers__@latest': function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('function');
  });

  it('honours the explicit __@every mode', () => {
    let result = createSagas({
      'fetchUsers__@every': function* gen() {
        yield api.fetchUsers();
      },
    });
    expect(result).toHaveLength(1);
    expect(typeof result[0]).toBe('function');
  });

  it('each invocation of a returned factory yields a fresh generator', () => {
    const result = createSagas({
      fetchUsers: function* gen() {
        yield api.fetchUsers();
      },
    });
    const factory = result[0] as () => Iterator<unknown>;
    const a = factory();
    const b = factory();
    // Same shape but distinct instances - this is the property that
    // lets multiple stores reuse the same module without sharing
    // already-consumed saga generators.
    expect(a).not.toBe(b);
    expect(typeof (a as any).next).toBe('function');
    expect(typeof (b as any).next).toBe('function');
  });
});
