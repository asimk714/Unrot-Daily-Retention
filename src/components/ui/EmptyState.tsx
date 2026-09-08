import React from "react";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-border p-8 sm:p-12 text-center bg-surface/50 flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {icon && (
        <div className="h-12 w-12 rounded-2xl bg-border-subtle flex items-center justify-center text-muted text-xl shadow-xs">
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-sm">
        <h4 className="text-base font-bold text-text tracking-tight">{title}</h4>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}