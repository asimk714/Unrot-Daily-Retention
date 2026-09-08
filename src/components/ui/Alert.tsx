import React from "react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "danger" | "success" | "warning" | "info";
  title?: string;
}

export function Alert({
  variant = "danger",
  title,
  children,
  className = "",
  ...props
}: AlertProps) {
  const variantStyles = {
    danger:
      "bg-danger-light border-danger/30 text-danger dark:text-danger",
    success:
      "bg-success-light border-success/30 text-success dark:text-success",
    warning:
      "bg-warning-light border-warning/30 text-warning dark:text-warning",
    info:
      "bg-primary/10 border-primary/20 text-primary dark:text-primary",
  };

  const icons = {
    danger: "⚠",
    success: "✓",
    warning: "⚡",
    info: "ℹ",
  };

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      aria-live="polite"
      className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-start gap-3 shadow-xs ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span className="shrink-0 text-base select-none leading-none pt-0.5" aria-hidden="true">
        {icons[variant]}
      </span>
      <div className="flex-1 space-y-0.5">
        {title && <div className="font-bold tracking-tight">{title}</div>}
        <div className="opacity-95 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}