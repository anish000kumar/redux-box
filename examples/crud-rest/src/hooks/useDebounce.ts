import { useEffect, useState } from 'react';

/**
 * Returns a copy of `value` that only updates after `delayMs` of stillness.
 * Used by the search box so we don't filter the entire list on every
 * keystroke.
 */
export function useDebounce<T>(value: T, delayMs = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
