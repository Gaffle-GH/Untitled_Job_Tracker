"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { PopIn } from "@/components/motion/Pop";
import { AuthErrorBox, loginCredentialsError, loginErrorFromMessage } from "@/components/auth/AuthErrorBox";
import { Button, Input } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const { login, onboardingComplete } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError(null);

    if (password.length < 6) {
      setError(loginCredentialsError());
      return;
    }

    setBusy(true);
    try {
      await login(email, password);
      router.push(onboardingComplete ? "/" : "/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sign in failed";
      setError(loginErrorFromMessage(message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <PopIn className="w-full max-w-md">
        <div className="mb-8 border-[3px] border-black bg-accent-cyan p-6 text-center brutal-shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-black">
            <Briefcase className="h-7 w-7 text-accent-lime" />
          </div>
          <h1 className="brutal-heading text-2xl">Welcome back</h1>
          <p className="mt-2 text-sm font-medium">Sign in to {APP_NAME}</p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          noValidate
          className="border-[3px] border-black bg-white p-6 brutal-shadow-lg"
        >
          <label className="mb-4 block">
            <span className="brutal-label mb-2 block">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="you@email.com"
              required
            />
          </label>
          <label className="mb-6 block">
            <span className="brutal-label mb-2 block">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="••••••••"
              required
            />
          </label>
          {error ? <AuthErrorBox title={error.title} message={error.message} /> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-bold">
          No account?{" "}
          <Link href="/signup" className="underline underline-offset-4 hover:bg-accent-yellow">
            Sign up
          </Link>
        </p>
      </PopIn>
    </div>
  );
}
