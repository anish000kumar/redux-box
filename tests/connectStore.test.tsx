import React from 'react';
import { Provider } from 'react-redux';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { connectStore, createModule, createStore } from '../src';

/**
 * Tests for `connectStore`'s selector wiring:
 *
 * - `mapSelectors` (eager) - selectors are evaluated on every store update,
 *   their result is passed as a prop, and reselect-memoized selectors should
 *   not cause re-renders for unrelated dispatches.
 * - `mapLazySelectors` (lazy) - selectors are exposed as `(...args) => value`
 *   callables. The function reference must be stable across re-renders, and
 *   a component connected only via lazy selectors must not re-render on
 *   unrelated dispatches.
 */

interface CounterState {
  count: number;
  items: Record<string, number>;
}

function makeCounterModule() {
  return createModule({
    state: {
      count: 0,
      items: { a: 1, b: 2, c: 3 },
    } as CounterState,
    mutations: {
      INCREMENT: (state: CounterState) => {
        state.count += 1;
      },
      SET_ITEM: (
        state: CounterState,
        action: { key: string; value: number }
      ) => {
        state.items[action.key] = action.value;
      },
    },
  });
}

function makeUnrelatedModule() {
  return createModule({
    state: { ping: 0 },
    mutations: {
      PING: (state: { ping: number }) => {
        state.ping += 1;
      },
    },
  });
}

/**
 * A render-counting probe. Mutates `counter.value` once per render and pushes
 * the current props onto `propsLog`, so tests can assert both how many times
 * the component rendered and what it rendered with.
 */
function makeProbe<P>() {
  const counter = { value: 0 };
  const propsLog: P[] = [];
  const Probe: React.FC<P> = (props: P) => {
    counter.value += 1;
    propsLog.push(props);
    return <div data-testid="probe" />;
  };
  return { counter, propsLog, Probe };
}

describe('connectStore - eager mapSelectors', () => {
  test('passes selector result as a prop', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);

    const { Probe, propsLog } = makeProbe<{ count: number }>();
    const Connected = connectStore({ mapSelectors: { count: getCount } })(
      Probe as any
    );

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(propsLog[propsLog.length - 1].count).toBe(0);
  });

  test('does not re-render on unrelated dispatches when selector is reselect-memoized', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);
    const getItems = cm.select((s: CounterState) => s.items);

    const { Probe, counter } = makeProbe<{
      count: number;
      items: Record<string, number>;
    }>();
    const Connected = connectStore({
      mapSelectors: { count: getCount, items: getItems },
    })(Probe as any);

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    const renderCountAfterMount = counter.value;
    expect(renderCountAfterMount).toBe(1);

    // Dispatch actions that DO NOT touch the counter slice.
    act(() => {
      store.dispatch({ type: 'PING' });
      store.dispatch({ type: 'PING' });
      store.dispatch({ type: 'COMPLETELY_UNHANDLED' });
    });

    expect(counter.value).toBe(renderCountAfterMount);
  });

  test('re-renders when its selected slice changes, but not when unrelated state changes', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);

    const { Probe, counter, propsLog } = makeProbe<{ count: number }>();
    const Connected = connectStore({ mapSelectors: { count: getCount } })(
      Probe as any
    );

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(counter.value).toBe(1);
    expect(propsLog[0].count).toBe(0);

    act(() => {
      store.dispatch({ type: 'INCREMENT' });
    });
    expect(counter.value).toBe(2);
    expect(propsLog[1].count).toBe(1);

    // Dispatching to a different slice should not re-render this component.
    act(() => {
      store.dispatch({ type: 'PING' });
    });
    expect(counter.value).toBe(2);
  });

  test('does not re-render when count mutation results in the same value (immer no-op)', () => {
    // If a selector returns the same value across dispatches, react-redux's
    // shallow equality check should suppress the re-render.
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);
    const { Probe, counter } = makeProbe<{ count: number }>();
    const Connected = connectStore({ mapSelectors: { count: getCount } })(
      Probe as any
    );

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );
    expect(counter.value).toBe(1);

    act(() => {
      // Mutate `items` (counter slice changes reference) but `count` value
      // is still 0; reselect's output selector returns the same primitive.
      store.dispatch({ type: 'SET_ITEM', key: 'a', value: 99 });
    });
    expect(counter.value).toBe(1);
  });
});

describe('connectStore - lazy mapLazySelectors', () => {
  test('exposes selector as a callable that returns the latest value', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = (state: any) => state.counter.count;

    const { Probe, propsLog } = makeProbe<{ getCount: () => number }>();
    const Connected = connectStore({ mapLazySelectors: { getCount } })(
      Probe as any
    );

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(typeof propsLog[0].getCount).toBe('function');
    expect(propsLog[0].getCount()).toBe(0);

    act(() => {
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
    });

    // Even though the component did not re-render, calling the same callable
    // returns the latest value because it closes over a state ref.
    expect(propsLog[0].getCount()).toBe(2);
  });

  test('passes arguments through to the underlying selector', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getItem = (state: any, key: string) => state.counter.items[key];

    const { Probe, propsLog } = makeProbe<{
      getItem: (key: string) => number;
    }>();
    const Connected = connectStore({ mapLazySelectors: { getItem } })(
      Probe as any
    );

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(propsLog[0].getItem('a')).toBe(1);
    expect(propsLog[0].getItem('b')).toBe(2);

    act(() => {
      store.dispatch({ type: 'SET_ITEM', key: 'a', value: 42 });
    });

    expect(propsLog[0].getItem('a')).toBe(42);
    expect(propsLog[0].getItem('b')).toBe(2);
  });

  test('callable reference is stable across re-renders triggered by other props', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);
    const getItem = (state: any, key: string) => state.counter.items[key];

    const { Probe, counter, propsLog } = makeProbe<{
      count: number;
      getItem: (key: string) => number;
    }>();
    const Connected = connectStore({
      mapSelectors: { count: getCount },
      mapLazySelectors: { getItem },
    })(Probe as any);

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    const initialFn = propsLog[0].getItem;
    expect(counter.value).toBe(1);

    // Trigger re-renders via the eager `count` selector.
    act(() => {
      store.dispatch({ type: 'INCREMENT' });
    });
    expect(counter.value).toBe(2);
    expect(propsLog[1].getItem).toBe(initialFn);

    act(() => {
      store.dispatch({ type: 'INCREMENT' });
    });
    expect(counter.value).toBe(3);
    expect(propsLog[2].getItem).toBe(initialFn);

    // And the lazy callable still reads fresh state.
    expect(initialFn('a')).toBe(1);
  });

  test('alone, does not cause re-renders on dispatches', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = (state: any) => state.counter.count;
    const getItem = (state: any, key: string) => state.counter.items[key];

    const { Probe, counter } = makeProbe<{
      getCount: () => number;
      getItem: (key: string) => number;
    }>();
    const Connected = connectStore({
      mapLazySelectors: { getCount, getItem },
    })(Probe as any);

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(counter.value).toBe(1);

    act(() => {
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'INCREMENT' });
      store.dispatch({ type: 'SET_ITEM', key: 'a', value: 5 });
      store.dispatch({ type: 'PING' });
    });

    // None of those should have caused a re-render because no eager prop
    // changed.
    expect(counter.value).toBe(1);
  });

  test('combined eager + lazy: eager triggers re-render and lazy returns fresh data', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = cm.select((s: CounterState) => s.count);
    const getItem = (state: any, key: string) => state.counter.items[key];

    const { Probe, counter, propsLog } = makeProbe<{
      count: number;
      getItem: (key: string) => number;
    }>();
    const Connected = connectStore({
      mapSelectors: { count: getCount },
      mapLazySelectors: { getItem },
    })(Probe as any);

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );
    expect(counter.value).toBe(1);
    expect(propsLog[0].getItem('a')).toBe(1);

    // Dispatch SET_ITEM. The eager `count` selector returns the same value,
    // so by itself no re-render occurs. Verify lazy still reads fresh data.
    act(() => {
      store.dispatch({ type: 'SET_ITEM', key: 'a', value: 7 });
    });
    expect(counter.value).toBe(1);
    expect(propsLog[0].getItem('a')).toBe(7);

    // Now bump `count`; component re-renders; lazy fn is the same reference
    // and still reads fresh data, including the SET_ITEM update above.
    act(() => {
      store.dispatch({ type: 'INCREMENT' });
    });
    expect(counter.value).toBe(2);
    expect(propsLog[1].count).toBe(1);
    expect(propsLog[1].getItem).toBe(propsLog[0].getItem);
    expect(propsLog[1].getItem('a')).toBe(7);
  });

  test('two connected instances each get their own stable wrapper references', () => {
    const cm = makeCounterModule();
    const um = makeUnrelatedModule();
    const store = createStore({ counter: cm, unrelated: um });

    const getCount = (state: any) => state.counter.count;

    const { Probe: ProbeA, propsLog: logA } = makeProbe<{
      getCount: () => number;
    }>();
    const { Probe: ProbeB, propsLog: logB } = makeProbe<{
      getCount: () => number;
    }>();
    const ConnectedA = connectStore({ mapLazySelectors: { getCount } })(
      ProbeA as any
    );
    const ConnectedB = connectStore({ mapLazySelectors: { getCount } })(
      ProbeB as any
    );

    render(
      <Provider store={store}>
        <>
          <ConnectedA />
          <ConnectedB />
        </>
      </Provider>
    );

    // Each instance has its own stable wrapper, but both read the same store.
    expect(typeof logA[0].getCount).toBe('function');
    expect(typeof logB[0].getCount).toBe('function');
    expect(logA[0].getCount).not.toBe(logB[0].getCount);
    expect(logA[0].getCount()).toBe(0);
    expect(logB[0].getCount()).toBe(0);

    act(() => {
      store.dispatch({ type: 'INCREMENT' });
    });

    expect(logA[0].getCount()).toBe(1);
    expect(logB[0].getCount()).toBe(1);
  });
});

describe('connectStore - module.lazySelect integration', () => {
  test('selectors built via module.lazySelect plug straight into mapLazySelectors', () => {
    const cm = makeCounterModule();
    const store = createStore({ counter: cm });

    // Slice-aware lazy selector built from the module helper. The cb sees the
    // module's slice directly, not the root state, so it stays decoupled from
    // the slice key.
    const getItem = cm.lazySelect(
      (slice: CounterState, key: string) => slice.items[key]
    );
    const getItemPlus = cm.lazySelect(
      (slice: CounterState, key: string, addend: number) =>
        slice.items[key] + addend
    );

    const { Probe, propsLog, counter } = makeProbe<{
      getItem: (key: string) => number;
      getItemPlus: (key: string, addend: number) => number;
    }>();

    const Connected = connectStore({
      mapLazySelectors: { getItem, getItemPlus },
    })(Probe as any);

    render(
      <Provider store={store}>
        <Connected />
      </Provider>
    );

    expect(propsLog[0].getItem('a')).toBe(1);
    expect(propsLog[0].getItem('b')).toBe(2);
    expect(propsLog[0].getItemPlus('a', 10)).toBe(11);

    act(() => {
      store.dispatch({ type: 'SET_ITEM', key: 'a', value: 99 });
    });

    // Component never re-rendered (lazy-only), but the same callable now reads
    // the latest slice through module.getSelector().
    expect(counter.value).toBe(1);
    expect(propsLog[0].getItem('a')).toBe(99);
    expect(propsLog[0].getItemPlus('a', 10)).toBe(109);
  });
});
