"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase } from "lucide-react";
import { PopIn } from "@/components/motion/Pop";
import { Button, Input } from "@/components/ui";
import { useApp } from "@/lib/store";

export default function SignupPage() {
  const { signup } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;
    signup(email, name);
    router.push("/onboarding");
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

        <form onSubmit={handleSubmit} className="border-[3px] border-black bg-white p-6 brutal-shadow-lg">
          <label className="mb-4 block">
            <span className="brutal-label mb-2 block">Name</span>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </label>
          <label className="mb-6 block">
            <span className="brutal-label mb-2 block">Email</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required />
          </label>
          <Button type="submit" className="w-full">
            Create account
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
