import { useState, useEffect, useCallback } from 'react';

type Validator<T> = (value: unknown) => value is T;

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  isValid?: Validator<T>
): [T, (value: T | ((val: T) => T)) => void] {
  // Read initial state from localStorage or fallback
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        const parsed: unknown = JSON.parse(item);
        if (!isValid || isValid(parsed)) {
          return parsed as T;
        }
        console.warn(
          `Ignoring localStorage key "${key}": stored value does not match the expected shape.`
        );
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  // Persist after the state commit. Writing inside the updater was a
  // render-phase side effect and StrictMode invokes updaters twice.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      setStoredValue((prev) =>
        typeof value === 'function' ? (value as (val: T) => T)(prev) : value
      );
    },
    []
  );

  // Listen to window storage events in case of multi-tab or external changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        if (!isValid || isValid(parsed)) {
          setStoredValue(parsed as T);
        }
      } catch {
        // ignore parse errors
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, isValid]);

  return [storedValue, setValue];
}
