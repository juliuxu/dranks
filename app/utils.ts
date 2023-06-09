import { useRef } from "react";

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
  const ref = useRef<(...args: Args) => unknown>();
  if (ref.current === undefined) {
    ref.current = () => debounceEffect(fn, ms);
  }
  return ref.current;
}

export function assertItemFound<T>(item: T | undefined): asserts item is T {
  if (item === undefined)
    throw new Response("Not Found", {
      status: 404,
    });
}
