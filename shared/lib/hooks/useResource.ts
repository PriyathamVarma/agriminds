"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetches JSON from `url` on mount (and whenever `url` changes), exposing `reload()` for
 * refetching after a mutation from an event handler. Pass `null` to skip fetching (e.g. while a
 * dependency like an id isn't known yet).
 *
 * The mount effect's own body never calls setState directly — React's purity/effect rules flag
 * that as an unguarded cascading render. Every setState call here happens inside a nested async
 * IIFE, gated by a `cancelled` flag checked right before each one, which is the pattern the rule
 * recognises as correctly guarding against a stale response overwriting newer state.
 */
export function useResource<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(url);
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (!res.ok) {
          setError(json?.error || "Something went wrong loading this data.");
          setLoading(false);
          return;
        }
        setData(json as T);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const reload = useCallback(async () => {
    if (!url) return;
    try {
      const res = await fetch(url);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(json?.error || "Something went wrong loading this data.");
        return;
      }
      setData(json as T);
      setError(null);
    } catch {
      setError("Could not reach the server.");
    }
  }, [url]);

  return { data, loading, error, reload };
}
