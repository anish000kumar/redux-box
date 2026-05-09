import createModule, { generateId } from '../src/createModule';
import createStore from '../src/createStore';
import testModule from './testModule';

describe('createModule', () => {
  it('should create module with uuid', () => {
    const module = createModule(testModule);
    expect(module.id).toBeTruthy();
    expect(typeof module.getSelector()).toBe('function');
    expect(module.getSelector()()).toBe(null);
  });

  it('should return correct module name', () => {
    const module = createModule(testModule);
    createStore({ userModule: module });
    expect(module.id).toBeTruthy();
    expect(module.getName()).toBe('userModule');
  });

  it('should return correct module selector', () => {
    const module = createModule(testModule);
    createStore({ userModule: module });
    const selector = module.getSelector();
    expect(selector({ userModule: { hi: 1 } })).toEqual({ hi: 1 });
  });

  it('should return random and unique id', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId()).not.toBe(generateId());
  });

  describe('lazySelect', () => {
    it('builds a parameterized (state, ...args) selector over the module slice', () => {
      const module = createModule({
        state: { items: { a: 1, b: 2, c: 3 } as Record<string, number> },
      });
      createStore({ counter: module });

      const getItem = module.lazySelect(
        (slice: any, key: string) => slice.items[key]
      );

      expect(typeof getItem).toBe('function');
      expect(getItem({ counter: { items: { a: 1, b: 2, c: 3 } } }, 'a')).toBe(1);
      expect(getItem({ counter: { items: { a: 1, b: 2, c: 3 } } }, 'b')).toBe(2);
    });

    it('forwards multiple arguments to the callback', () => {
      const module = createModule({ state: { factor: 10 } });
      createStore({ math: module });

      const compute = module.lazySelect(
        (slice: any, base: number, multiplier: number) =>
          (slice.factor + base) * multiplier
      );

      expect(compute({ math: { factor: 10 } }, 5, 2)).toBe(30);
    });

    it('reads through getSelector so it stays decoupled from the slice key', () => {
      const module = createModule({ state: { value: 42 } });
      // Mount the module under an arbitrary key.
      createStore({ someArbitraryKey: module });

      const get = module.lazySelect((slice: any, fallback: number) =>
        slice ? slice.value : fallback
      );

      expect(get({ someArbitraryKey: { value: 42 } }, -1)).toBe(42);
    });

    it('returns null from the slice when called without state', () => {
      const module = createModule({ state: { value: 1 } });
      createStore({ thing: module });
      const get = module.lazySelect((slice: any) => (slice ? slice.value : 'no-state'));
      // getSelector returns null when state is undefined
      expect(get(undefined as any)).toBe('no-state');
    });

    it('memoizes results: same (state, args) tuple returns the same reference', () => {
      const module = createModule({
        state: {
          items: { a: { id: 'a', label: 'A' }, b: { id: 'b', label: 'B' } },
        },
      });
      createStore({ store: module });

      let calls = 0;
      const getItem = module.lazySelect((slice: any, key: string) => {
        calls += 1;
        // Return a fresh object each call so reference equality reflects
        // the memoizer rather than the underlying data.
        return { ...slice.items[key], readAt: calls };
      });

      const state = { store: { items: { a: { id: 'a', label: 'A' }, b: { id: 'b', label: 'B' } } } };

      const first = getItem(state, 'a');
      const second = getItem(state, 'a');
      expect(second).toBe(first);
      expect(calls).toBe(1);

      // Different arg recomputes, but the prior cache entry is retained.
      const third = getItem(state, 'b');
      expect(third).not.toBe(first);
      expect(calls).toBe(2);

      const fourth = getItem(state, 'a');
      expect(fourth).toBe(first);
      expect(calls).toBe(2);

      // Different slice ref recomputes (the cache key is the slice, not the
      // root state).
      const newState = { store: { items: state.store.items } };
      const fifth = getItem(newState, 'a');
      expect(fifth).not.toBe(first);
      expect(calls).toBe(3);
    });

    it('survives unrelated dispatches: same slice ref across state changes is a cache hit', () => {
      const m = createModule({
        state: { items: { a: 1, b: 2 } as Record<string, number> },
        mutations: {
          TOUCH_M: (s: any) => {
            s.items.a += 1;
          },
        },
      });
      const um = createModule({
        state: { ping: 0 },
        mutations: {
          PING: (s: any) => {
            s.ping += 1;
          },
        },
      });
      const store = createStore({ m, um });

      let calls = 0;
      const getItem = m.lazySelect((slice: any, key: string) => {
        calls += 1;
        return slice.items[key];
      });

      expect(getItem(store.getState(), 'a')).toBe(1);
      expect(calls).toBe(1);

      // PING changes the root state ref but leaves m's slice untouched.
      // With slice-keyed memoization, this must NOT recompute.
      store.dispatch({ type: 'PING' });
      expect(getItem(store.getState(), 'a')).toBe(1);
      expect(calls).toBe(1);

      store.dispatch({ type: 'PING' });
      store.dispatch({ type: 'PING' });
      expect(getItem(store.getState(), 'a')).toBe(1);
      expect(calls).toBe(1);

      // Mutation that touches the slice produces a new slice ref -> recompute.
      store.dispatch({ type: 'TOUCH_M' });
      expect(getItem(store.getState(), 'a')).toBe(2);
      expect(calls).toBe(2);
    });

    it('returns stable result references across unrelated dispatches', () => {
      const m = createModule({
        state: { items: { a: { id: 'a', label: 'A' } } as Record<string, any> },
        mutations: {},
      });
      const um = createModule({
        state: { ping: 0 },
        mutations: {
          PING: (s: any) => {
            s.ping += 1;
          },
        },
      });
      const store = createStore({ m, um });

      const getItem = m.lazySelect(
        (slice: any, key: string) => slice.items[key]
      );

      const first = getItem(store.getState(), 'a');
      store.dispatch({ type: 'PING' });
      const second = getItem(store.getState(), 'a');
      // Same slice + same args -> same reference, even though the root state
      // object changed. This is what makes the result safe to feed into
      // useMemo/useEffect dependency arrays.
      expect(second).toBe(first);
    });

    it('honours a custom memoize override', () => {
      const m = createModule({ state: { value: 1 } });
      createStore({ m });

      let memoizeCalls = 0;
      const passthroughMemoize = <F extends (...a: any[]) => any>(fn: F): F => {
        memoizeCalls += 1;
        return fn;
      };

      const get = m.lazySelect((slice: any) => slice.value, {
        memoize: passthroughMemoize,
      });

      expect(get({ m: { value: 7 } })).toBe(7);
      expect(memoizeCalls).toBe(1);
    });
  });
});
