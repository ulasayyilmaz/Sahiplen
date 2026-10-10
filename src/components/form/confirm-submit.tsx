"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Submit button that asks for confirmation first (for destructive actions). */
export function ConfirmSubmit({
  children,
  confirmText,
  className,
}: {
  children: ReactNode;
  confirmText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

/** Plain submit button that disables itself while its form is submitting. */
export function PendingSubmit({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {children}
    </button>
  );
}
