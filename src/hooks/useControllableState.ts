import { useCallback, useEffect, useRef, useState } from "react";

interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue: T;
  onChange?: (nextValue: T) => void;
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const mergedValue = isControlled ? value : internalValue;
  const valueRef = useRef(mergedValue);

  useEffect(() => {
    valueRef.current = mergedValue;
  }, [mergedValue]);

  const setValue = useCallback(
    (updater: React.SetStateAction<T>) => {
      const nextValue =
        typeof updater === "function"
          ? (updater as (prev: T) => T)(valueRef.current)
          : updater;

      valueRef.current = nextValue;
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  return [mergedValue, setValue] as const;
}
