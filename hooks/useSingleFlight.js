"use client";

import { useCallback, useRef } from "react";

/**
 * Ensures a side-effecting action has at most one in-flight invocation.
 * Repeated clicks receive the original promise instead of creating a second
 * record or payment. A later attempt is allowed after the first settles.
 */
export default function useSingleFlight(action) {
  const inFlight = useRef(null);

  return useCallback((...args) => {
    if (inFlight.current !== null) return inFlight.current;

    const promise = Promise.resolve().then(() => action(...args));
    inFlight.current = promise;
    promise.then(
      () => {
        if (inFlight.current === promise) inFlight.current = null;
      },
      () => {
        if (inFlight.current === promise) inFlight.current = null;
      }
    );
    return promise;
  }, [action]);
}
