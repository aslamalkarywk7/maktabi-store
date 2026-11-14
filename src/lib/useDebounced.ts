import {useEffect, useState} from 'react';

/** Debounce any value (used for live search-as-you-type). */
export function useDebounced<T>(value: T, delay = 450): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
