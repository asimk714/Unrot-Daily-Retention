import React from "react";

export interface LessonTakeawayProps {
  title: string;
  children: React.ReactNode;
  icon?: string;
  tag?: string;
  className?: string;
}

export function LessonTakeaway({
  title,
  children,
  icon = "💡",
  tag = "Practical Example",
  className = "",
}: LessonTakeawayProps) {
  return (
    <div
      className={`rounded-2xl border border-accent/20 bg-accent-light/50 p-5 sm:p-6 space-y-2.5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-base select-none" aria-hidden="true">
            {icon}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">
            {tag}
          </span>
        </div>
      </div>

      <h4 className="text-sm sm:text-base font-bold text-text tracking-tight">
        {title}
      </h4>

      <div className="text-xs sm:text-sm text-text/85 leading-relaxed">
        {children}
      </div>
    </div>
  );
}