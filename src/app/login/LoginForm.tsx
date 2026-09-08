"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { logInAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    startTransition(async () => {
      const res = await logInAction(null, formData);
      if (res && res.error) {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <Alert variant="danger" title="Unable to sign in">
          {errorMessage}
        </Alert>
      )}

      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="you@company.com"
        autoComplete="email"
        required
        disabled={isPending}
      />

      <div className="space-y-1">
        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          showPasswordToggle
          required
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isPending}
        className="w-full mt-2"
      >
        Sign in to your account
      </Button>

      <div className="text-center pt-2">
        <p className="text-xs text-muted">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/signup"
            className="text-primary font-semibold hover:underline transition-colors"
          >
            Create an account
          </Link>
        </p>
      </div>
    </form>
  );
}