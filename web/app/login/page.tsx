"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      router.push("/browse");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 sm:py-24">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Logo />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-neutral-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-neutral-700">
            password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-neutral-300 px-3 py-2 text-neutral-900"
            />
          </label>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting ? "logging in…" : "log in"}
          </button>
        </form>

        <p className="text-sm text-neutral-500">
          don&apos;t have an account?{" "}
          <Link href="/signup" className="text-neutral-900 hover:underline">
            sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
