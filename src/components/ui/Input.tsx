import React, { forwardRef, useState } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string | null;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type = "text",
      label,
      helperText,
      error,
      id,
      showPasswordToggle = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isPassword = type === "password" && showPasswordToggle;
    const actualType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-text tracking-tight uppercase"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled}
            className={`w-full h-11 px-4 rounded-xl border bg-surface text-text placeholder:text-muted/60 text-sm transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 disabled:cursor-not-allowed ${
              error
                ? "border-danger focus-visible:ring-danger"
                : "border-border hover:border-border/80"
            } ${isPassword ? "pr-11" : ""} ${className}`}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted hover:text-text px-1 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>

        {error ? (
          <p role="alert" className="text-xs text-danger font-medium flex items-center gap-1">
            <span aria-hidden="true">⚠</span>
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";