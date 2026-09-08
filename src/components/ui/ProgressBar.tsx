import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "accent";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = "md",
  variant = "primary",
  className = "",
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-3.5",
  };

  const fillVariants = {
    primary: "bg-primary",
    success: "bg-success",
    accent: "bg-accent",
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`} {...props}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-muted">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-semibold text-text">{percentage}%</span>}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-border-subtle rounded-full overflow-hidden ${sizeStyles[size]}`}
      >
        <div
          className={`${fillVariants[variant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}