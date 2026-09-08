import React from "react";
import Link from "next/link";

export interface PageHeaderProps {
  eyebrow?: React.ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {backHref && (
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text transition-colors"
          >
            <span>←</span>
            <span>{backLabel}</span>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-text">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}