"use client";

import { useEffect, useMemo } from "react";

export default function FormErrorSummary({ errors = {} }) {
  const entries = useMemo(
    () => Object.entries(errors).filter(([, error]) => error?.message),
    [errors]
  );

  useEffect(() => {
    if (entries.length === 0) return;
    document.querySelector('[aria-invalid="true"]')?.focus();
  }, [entries.length]);

  if (entries.length === 0) return null;

  return (
    <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <p className="font-semibold">Please correct the highlighted fields.</p>
      <ul className="mt-1 list-disc ps-5">
        {entries.map(([field, error]) => <li key={field}>{String(error.message)}</li>)}
      </ul>
    </div>
  );
}
