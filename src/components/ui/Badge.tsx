import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "neutral";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className = "",
  variant = "primary",
  size = "md",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1 font-semibold",
    md: "px-2.5 py-1 text-xs gap-1.5 font-medium",
  };

  const variantStyles = {
    primary:
      "bg-primary/10 text-primary border border-primary/20",
    secondary:
      "bg-accent-light text-accent border border-accent/20",
    success:
      "bg-success-light text-success border border-success/20",
    warning:
      "bg-warning-light text-warning border border-warning/20",
    neutral:
      "bg-border-subtle text-muted border border-border",
  };

  const dotColor = {
    primary: "bg-primary",
    secondary: "bg-accent",
    success: "bg-success animate-pulse",
    warning: "bg-warning",
    neutral: "bg-muted",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full tracking-wide uppercase select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor[variant]}`} />}
      {children}
    </span>
  );
}