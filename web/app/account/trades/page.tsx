"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { TradeHistoryRow } from "@/components/TradeHistoryRow";
import { useAuth } from "@/components/AuthProvider";
import { fetchMyTrades } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, Trade } from "@/lib/types";

export default function MyTradesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchCharacters().then(setCharacters).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchMyTrades()
      .then(setTrades)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load trades"))
      .finally(() => setLoading(false));
  }, [user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-medium text-neutral-900">previous trades</h1>
          <Link href="/account" className="text-xs text-neutral-400 hover:text-neutral-900">
            back to account
          </Link>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!error && loading && <p className="text-sm text-neutral-400">Loading…</p>}
        {!error && !loading && trades.length === 0 && (
          <p className="text-sm text-neutral-400">No trades yet.</p>
        )}

        <div className="max-w-2xl">
          {trades.map((trade) => (
            <TradeHistoryRow key={trade.id} trade={trade} />
          ))}
        </div>
      </main>
    </div>
  );
}
