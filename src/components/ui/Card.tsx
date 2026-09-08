import React, { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "highlight" | "interactive";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const baseStyles =
      "rounded-2xl bg-surface border transition-all duration-150";

    const variantStyles = {
      default: "border-border shadow-xs",
      elevated: "border-border shadow-md",
      highlight:
        "border-2 border-primary/40 bg-surface shadow-xs shadow-primary/5",
      interactive:
        "border-border shadow-xs hover:border-primary/40 hover:shadow-sm cursor-pointer",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pb-3 space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg sm:text-xl font-bold tracking-tight text-text ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs sm:text-sm text-muted leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-6 pt-0 flex items-center justify-between border-t border-border-subtle mt-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}