import { useMemo, useRef } from "react";

export function debounceEffect<Args extends Array<unknown>>(
  fn: (...args: Args) => unknown,
  ms: number
) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}
export function useDebounceEffect<Args extends Array<unknown>>(
  fn: (...args: Args) => unknown,
  ms: number
) {
  const de = useRef<(...args: Args) => unknown>();
  if (de.current === undefined) {
    de.current = () => debounceEffect(fn, ms);
  }
  return de.current;
}

export function assertItemFound<T>(item: T | undefined): asserts item is T {
  if (item === undefined)
    throw new Response("Not Found", {
      status: 404,
    });
}
