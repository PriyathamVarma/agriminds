import type { UseFormRegisterReturn } from "react-hook-form";
import { cx } from "@/shared/lib/utils";

export const authInputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm " +
  "text-foreground-heading placeholder:text-foreground-muted " +
  "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition " +
  "disabled:opacity-60";

export default function FormField({
  label,
  error,
  type = "text",
  placeholder,
  registration,
  disabled,
  className,
  autoComplete,
}: {
  label: string;
  error?: string;
  type?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  disabled?: boolean;
  className?: string;
  autoComplete?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={registration.name} className="mb-1.5 block text-sm font-medium text-foreground-heading">
        {label}
      </label>
      <input
        id={registration.name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${registration.name}-error` : undefined}
        className={cx(authInputCls, error && "border-status-danger focus:ring-status-danger/20 focus:border-status-danger")}
        {...registration}
      />
      {error ? (
        <p id={`${registration.name}-error`} className="mt-1.5 text-xs font-medium text-status-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
