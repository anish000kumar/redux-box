import get from '../../src/utils/get';

describe('composeEnhancers', () => {
  const test = {
    name: {
      first: {
        value: 'anish',
      },
    },
    val: [2, 3],
    something: '2',
  };

  it('should return defaultValues or undefined', () => {
    expect(get(test, 'no.ok')).toBe(undefined);
    expect(get(test, 'name.last', 'ak')).toBe('ak');
  });

  it('should return valida values', () => {
    expect(get(test, 'name.first.value')).toBe('anish');
    expect(get(test, 'something')).toBe('2');
  });

  it('returns the default when the root or an intermediate value is nullish or primitive', () => {
    const fallback = 'fallback';

    expect(get(null, 'name.first', fallback)).toBe(fallback);
    expect(get({ name: null }, 'name.first', fallback)).toBe(fallback);
    expect(get({ name: false }, 'name.first', fallback)).toBe(fallback);
  });

  it('preserves explicit falsey values at the end of a path', () => {
    expect(get({ enabled: false }, 'enabled', true)).toBe(false);
    expect(get({ value: null }, 'value', 'fallback')).toBeNull();
  });
});
