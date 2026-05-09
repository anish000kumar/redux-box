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
});
