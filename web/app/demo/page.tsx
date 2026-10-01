"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { demoLogin } from "@/lib/authApi";

export default function DemoLoginPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    demoLogin()
      .then((user) => {
        updateUser(user);
        router.replace("/");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't start the demo"));
  }, [router, updateUser]);

  return (
    <main className="flex flex-1 items-center justify-center px-8 py-24">
      <p className="text-sm text-neutral-400">{error ?? "Loading demo…"}</p>
    </main>
  );
}
