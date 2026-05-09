import {
  clearError,
  getInitialXhrState,
  setData,
  setError,
  startLoading,
  toErrorLike,
} from '../../src/lib/xhr';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

describe('getInitialXhrState', () => {
  test('builds the resting shape with the supplied initial data', () => {
    expect(getInitialXhrState<number[]>([])).toEqual({
      data: [],
      error: null,
      loading: false,
    });
  });
});

describe('lifecycle helpers', () => {
  test('startLoading flips loading and clears any prior error', () => {
    const slot = getInitialXhrState<number[]>([]);
    slot.error = { name: 'Error', message: 'old' };

    startLoading(slot);

    expect(slot.loading).toBe(true);
    expect(slot.error).toBeNull();
  });

  test('setData clears loading + error and writes the new data', () => {
    const slot = getInitialXhrState<number[]>([]);
    startLoading(slot);

    setData(slot, [1, 2, 3]);

    expect(slot).toEqual({ data: [1, 2, 3], error: null, loading: false });
  });

  test('setError clears loading and stores the error', () => {
    const slot = getInitialXhrState<number[]>([]);
    startLoading(slot);

    setError(slot, { name: 'ApiError', message: 'boom', code: 500 });

    expect(slot.loading).toBe(false);
    expect(slot.error).toEqual({
      name: 'ApiError',
      message: 'boom',
      code: 500,
    });
  });

  test('clearError only touches the error field', () => {
    const slot = getInitialXhrState<number[]>([1]);
    slot.error = { name: 'Error', message: 'oh' };

    clearError(slot);

    expect(slot).toEqual({ data: [1], error: null, loading: false });
  });
});

describe('toErrorLike', () => {
  test('lifts name + message from a plain Error', () => {
    expect(toErrorLike(new Error('boom'))).toEqual({
      name: 'Error',
      message: 'boom',
    });
  });

  test('preserves the subclass name and lifts numeric `status` as `code`', () => {
    expect(toErrorLike(new ApiError('not found', 404))).toEqual({
      name: 'ApiError',
      message: 'not found',
      code: 404,
    });
  });

  test('handles error-shaped plain objects (third-party SDKs)', () => {
    expect(
      toErrorLike({ name: 'GraphQLError', message: 'no field x' })
    ).toEqual({ name: 'GraphQLError', message: 'no field x' });
  });

  test('lifts string `code` from object payloads', () => {
    expect(
      toErrorLike({ message: 'rate limited', code: 'RATE_LIMITED' })
    ).toEqual({ name: 'Error', message: 'rate limited', code: 'RATE_LIMITED' });
  });

  test('treats a bare string as the message', () => {
    expect(toErrorLike('weird')).toEqual({ name: 'Error', message: 'weird' });
  });

  test('falls back to a sentinel for non-error throws', () => {
    expect(toErrorLike(undefined)).toEqual({
      name: 'UnknownError',
      message: 'Unknown error',
    });
    expect(toErrorLike(42)).toEqual({
      name: 'UnknownError',
      message: 'Unknown error',
    });
    expect(toErrorLike(null)).toEqual({
      name: 'UnknownError',
      message: 'Unknown error',
    });
  });
});
