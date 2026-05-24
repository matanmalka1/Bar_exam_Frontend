import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/cn";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  startSlot?: ReactNode;
  endSlot?: ReactNode;
  endSlotPlacement?: "start" | "end";
};

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      hint,
      error,
      startSlot,
      endSlot,
      endSlotPlacement = "start",
      className,
      ...rest
    },
    ref,
  ) => {
    const hintId = hint || error ? `${id}-hint` : undefined;
    const hasError = !!error;
    const endSlotAtEnd = endSlotPlacement === "end";

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-semibold text-primary">
          {label}
        </label>

        <div className="relative flex items-center">
          {startSlot && (
            <span className="pointer-events-none absolute end-4 text-secondary">
              {startSlot}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            aria-describedby={hintId}
            aria-invalid={hasError || undefined}
            className={cn(
              "focus-ring min-h-12 w-full rounded-2xl border bg-white px-4 py-3 text-base text-primary outline-none transition",
              "focus-visible:border-strong",
              hasError ? "border-2 border-strong" : "border-default",
              startSlot && "pe-12",
              endSlot && (endSlotAtEnd ? "pe-12" : "ps-12"),
              "disabled:opacity-45",
              className,
            )}
            {...rest}
          />
          {endSlot && (
            <span
              className={cn(
                "pointer-events-auto absolute flex items-center",
                endSlotAtEnd ? "end-4" : "start-4",
              )}
            >
              {endSlot}
            </span>
          )}
        </div>

        {(error || hint) && (
          <p
            id={hintId}
            className={cn(
              "text-xs",
              hasError ? "font-semibold text-primary" : "text-secondary",
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = "TextField";

export default TextField;
