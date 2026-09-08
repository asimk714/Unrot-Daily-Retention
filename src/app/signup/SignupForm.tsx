"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function SignupForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!email || !password) {
      setErrorMessage("Please enter an email and password.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    startTransition(async () => {
      const res = await signUpAction(null, formData);
      if (res && res.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert variant="danger" title="Registration issue">
          {errorMessage}
        </Alert>
      )}

      <Input
        label="Full Name"
        name="name"
        type="text"
        placeholder="e.g. Alex Rivera"
        autoComplete="name"
        disabled={isPending}
      />

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        required
        disabled={isPending}
      />

      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        helperText="Must be at least 8 characters"
        showPasswordToggle
        required
        disabled={isPending}
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        placeholder="Re-enter your password"
        autoComplete="new-password"
        showPasswordToggle
        required
        disabled={isPending}
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full mt-2"
      >
        Create your account &amp; begin
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}