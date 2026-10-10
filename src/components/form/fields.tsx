"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import type { FormState } from "@/lib/forms";

const inputClass =
  "w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 aria-invalid:border-red-600";

type BaseFieldProps = {
  name: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  required?: boolean;
};

function FieldShell({
  id,
  label,
  error,
  hint,
  required,
  children,
}: Omit<BaseFieldProps, "name"> & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
        {required && (
          <span aria-hidden="true" className="text-red-700">
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-stone-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: ReactNode) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

export function TextField({
  name,
  label,
  error,
  hint,
  required,
  type = "text",
  autoComplete,
  defaultValue,
  inputMode,
  list,
}: BaseFieldProps & {
  type?: "text" | "email" | "password" | "tel" | "number" | "date";
  autoComplete?: string;
  defaultValue?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
  /** id of a <datalist> with suggestions. */
  list?: string;
}) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        inputMode={inputMode}
        list={list}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  error,
  hint,
  required,
  defaultValue,
  rows = 4,
}: BaseFieldProps & { defaultValue?: string; rows?: number }) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClass}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-5 rounded border-stone-400 accent-amber-700"
      />
      <label htmlFor={id} className="text-sm font-medium text-stone-800">
        {label}
      </label>
    </div>
  );
}

export function SelectField({
  name,
  label,
  error,
  hint,
  required,
  defaultValue,
  placeholder,
  options,
}: BaseFieldProps & {
  defaultValue?: string;
  /** Empty first option, e.g. "Choose…". */
  placeholder?: string;
  options: { value: string; label: string }[];
}) {
  const id = `field-${name}`;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} required={required}>
      <select
        id={id}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={inputClass}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function SubmitButton({
  children,
  pendingLabel,
}: {
  children: ReactNode;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Form-level success or error message, announced to screen readers. */
export function FormAlert({ state }: { state: FormState }) {
  if (!state.message) return null;
  const isError = state.status === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={
        isError
          ? "rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900"
          : "rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900"
      }
    >
      {state.message}
    </div>
  );
}
