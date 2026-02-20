import { useState, useEffect, useCallback } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}

export function useDebouncedInput(
  initialValue: string,
  delayMs: number,
): [string, (v: string) => void, string] {
  const [inputValue, setInputValue] = useState(initialValue);
  const debouncedValue = useDebouncedValue(inputValue, delayMs);

  const setValue = useCallback((v: string) => {
    setInputValue(v);
  }, []);

  return [inputValue, setValue, debouncedValue];
}
