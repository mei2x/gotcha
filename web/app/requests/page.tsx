"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { TradeItemTile } from "@/components/TradeItemTile";
import { CutMark } from "@/components/CutMark";
import { useAuth } from "@/components/AuthProvider";
import { fetchIncomingTradeRequests, respondToTradeRequest } from "@/lib/authApi";
import { fetchCharacters } from "@/lib/api";
import type { Character, TradeRequest } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function RequestsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [characters, setCharacters] = useState<Character[]>([]);
  const [requests, setRequests] = useState<TradeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

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
    fetchIncomingTradeRequests()
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load requests"))
      .finally(() => setLoading(false));
  }, [user]);

  async function respond(id: string, action: "confirm" | "decline") {
    setRespondingId(id);
    try {
      await respondToTradeRequest(id, action);
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't respond to request");
    } finally {
      setRespondingId(null);
    }
  }

  if (authLoading || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Header characters={characters} />
      <main className="flex-1 px-4 py-6 sm:px-10 sm:py-8">
        <h1 className="mb-6 text-sm font-medium text-neutral-900">trade requests</h1>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {!error && !loading && requests.length === 0 && (
          <p className="text-sm text-neutral-400">No pending trade requests.</p>
        )}

        <div className="flex flex-col gap-6">
          {requests.map((request) => (
            <div key={request.id} className="rounded-2xl border border-neutral-200 p-4 sm:p-6">
              <p className="mb-4 text-sm text-neutral-500">
                <span className="font-medium text-neutral-900">{request.fromUser.username}</span>{" "}
                wants to trade with you
              </p>

              <div className="flex flex-col items-center gap-4 sm:flex-row">
                <div className="w-full sm:flex-1">
                  <TradeItemTile item={request.fromListing} topLabel={<p className="text-xs text-neutral-500">{request.fromUser.username}</p>} />
                </div>
                <div className="flex flex-col items-center gap-1 text-xs text-neutral-400">
                  <CutMark className="h-6 w-6 text-neutral-300" />
                  <span>trade</span>
                </div>
                <div className="w-full sm:flex-1">
                  <TradeItemTile item={request.toListing} topLabel={<p className="text-xs text-neutral-500">you</p>} />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-neutral-200 p-4 text-sm text-neutral-600">
                <p className="font-medium text-neutral-900">Pick-up in {request.pickupLocation}</p>
                {request.proposedDate && <p className="mt-1">{formatDate(request.proposedDate)}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.proposedTimes.map((time) => (
                    <span
                      key={time}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs text-neutral-600"
                    >
                      {time}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => respond(request.id, "decline")}
                  disabled={respondingId === request.id}
                  className="flex-1 rounded-full border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900 disabled:opacity-50"
                >
                  decline
                </button>
                <button
                  onClick={() => respond(request.id, "confirm")}
                  disabled={respondingId === request.id}
                  className="flex-1 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  {respondingId === request.id ? "confirming…" : "confirm"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
