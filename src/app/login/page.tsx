"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { APP_NAME } from "@/lib/brand";
import { PopIn } from "@/components/motion/Pop";
import { Button, Input } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function LoginPage() {
  const { login, onboardingComplete } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    login(email, name);
    router.push(onboardingComplete ? "/" : "/onboarding");
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
          onSubmit={handleSubmit}
          className="border-[3px] border-black bg-white p-6 brutal-shadow-lg"
        >
          <label className="mb-4 block">
            <span className="brutal-label mb-2 block">Name</span>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </label>
          <label className="mb-6 block">
            <span className="brutal-label mb-2 block">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          </label>
          <Button type="submit" className="w-full">
            Sign in
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
