"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { PopIn } from "@/components/motion/Pop";
import { AuthErrorBox, signupErrorFromMessage } from "@/components/auth/AuthErrorBox";
import { Button, Input } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function SignupPage() {
  const { signup, onboardingComplete } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    setBusy(true);
    setError(null);
    try {
      await signup(email, name, password);
      router.push(onboardingComplete ? "/" : "/onboarding");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(signupErrorFromMessage(message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <PopIn className="w-full max-w-md">
        <div className="mb-8 border-[3px] border-black bg-accent-lime p-6 text-center brutal-shadow-lg">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-[3px] border-black bg-black">
            <Briefcase className="h-7 w-7 text-accent-yellow" />
          </div>
          <h1 className="brutal-heading text-2xl">Create account</h1>
          <p className="mt-2 text-sm font-medium">Start tracking your job search</p>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="border-[3px] border-black bg-white p-6 brutal-shadow-lg"
        >
          <label className="mb-4 block">
            <span className="brutal-label mb-2 block">Name</span>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              required
            />
          </label>
          <label className="mb-4 block">
            <span className="brutal-label mb-2 block">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
            />
          </label>
          <label className="mb-6 block">
            <span className="brutal-label mb-2 block">Password</span>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              minLength={6}
              required
            />
          </label>
          {error ? <AuthErrorBox title={error.title} message={error.message} /> : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm font-bold">
          Have an account?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:bg-accent-yellow">
            Sign in
          </Link>
        </p>
      </PopIn>
    </div>
  );
}
