import dynamicSelector from '../src/dynamicSelector';

describe('dynamicSelector', () => {
  it('should mark a selector as dynamic', () => {
    const selector = dynamicSelector((state, props, id) => state.items[id]);

    expect(selector({ items: ['a', 'b'] }, {}, 1)).toBe('b');
    expect(selector.__reduxBoxDynamicSelector).toBe(true);
  });

  it('should reject non-function selectors', () => {
    expect(() => dynamicSelector({})).toThrow('dynamicSelector expects a function');
  });
});
