"use client";

import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { TradeItemTile } from "./TradeItemTile";
import { CutMark } from "./CutMark";
import { MockMap } from "./MockMap";
import { MiniCalendar } from "./MiniCalendar";
import { fetchMyListings, createTradeRequest } from "@/lib/authApi";
import type { Listing } from "@/lib/types";
import Image from "next/image";

type Step = "pick" | "confirm" | "schedule" | "sent";

// Placeholder until sellers can set their own pick-up location/date/times on a post.
function getMockPickupInfo() {
  const date = new Date();
  date.setDate(date.getDate() + 6);
  return {
    location: "Lafayette St",
    date,
    dateIso: date.toISOString().slice(0, 10),
    times: ["12:30pm", "5:00pm", "11:00pm"],
  };
}

export function TradeFlowModal({
  toListing,
  onClose,
}: {
  toListing: Listing;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("pick");
  const [myListings, setMyListings] = useState<Listing[] | null>(null);
  const [selected, setSelected] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pickupInfo] = useState(getMockPickupInfo);
  const [times, setTimes] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyListings()
      .then(setMyListings)
      .catch(() => setError("Couldn't load your posts"));
  }, []);

  function toggleTime(slot: string) {
    setTimes((prev) => (prev.includes(slot) ? prev.filter((t) => t !== slot) : [...prev, slot]));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    if (times.length === 0) {
      setError("Pick at least one time that works for you");
      return;
    }
    setSubmitting(true);
    try {
      await createTradeRequest({
        fromListingId: selected.id,
        toListingId: toListing.id,
        pickupLocation: pickupInfo.location,
        proposedDate: pickupInfo.dateIso,
        proposedTimes: times,
      });
      setStep("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send trade request");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "pick") {
    return (
      <Modal title="Which one would you like to trade?" onClose={onClose}>
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        {!myListings && <p className="text-sm text-neutral-400">Loading your posts…</p>}
        {myListings && myListings.length === 0 && (
          <p className="text-sm text-neutral-400">
            You don&apos;t have any posts yet — post something first to trade with it.
          </p>
        )}
        {myListings && myListings.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {myListings.map((listing) => (
              <TradeItemTile
                key={listing.id}
                item={listing}
                selected={selected?.id === listing.id}
                onClick={() => setSelected(listing)}
              />
            ))}
          </div>
        )}
        <button
          type="button"
          disabled={!selected}
          onClick={() => setStep("confirm")}
          className="mt-5 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-40"
        >
          continue
        </button>
      </Modal>
    );
  }

  if (step === "confirm" && selected) {
    return (
      <Modal title="Are you sure you would like to trade?" onClose={onClose}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <TradeItemTile item={selected} />
          </div>
          <div className="flex flex-col items-center gap-1 text-xs text-neutral-400">
            <Image
              src={"/images/claw_2.png"}
              alt="Claws"
              unoptimized
              width={4}
              height={4}
              className="h-15 w-15"
            />
            <span>trade</span>
          </div>
          <div className="flex-1">
            <TradeItemTile
              item={toListing}
              topLabel={
                <p className="text-xs text-neutral-500">
                  {toListing.seller.username}
                </p>
              }
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => setStep("pick")}
            className="flex-1 rounded-full border border-neutral-300 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-900"
          >
            back
          </button>
          <button
            type="button"
            onClick={() => {
              if (toListing.tradingMethod !== "in_person") {
                setError("Shipping trades aren't supported yet");
                return;
              }
              setStep("schedule");
            }}
            className="flex-1 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
          >
            confirm
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Modal>
    );
  }

  if (step === "schedule" && selected) {
    return (
      <Modal title="Trade details" onClose={onClose} size="lg">
        <form onSubmit={handleSend} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-900">
                Pick-up in {pickupInfo.location}
              </p>
              <MockMap className="aspect-square w-full rounded-xl border border-neutral-200" />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-neutral-900">
                What date/time works for you?
              </p>
              <MiniCalendar date={pickupInfo.date} />

              <p className="mb-1 mt-4 text-xs text-neutral-400">Time</p>
              <div className="flex flex-col gap-1">
                {pickupInfo.times.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleTime(slot)}
                    className={`rounded-full border px-3 py-1 text-left text-xs transition-colors ${
                      times.includes(slot)
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-300 text-neutral-600 hover:border-neutral-900"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-neutral-400">
            We will send this to {toListing.seller.username} to confirm. If the trade is approved,
            you will receive a notification.
          </p>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            {submitting ? "sending…" : "confirm"}
          </button>
        </form>
      </Modal>
    );
  }

  if (step === "sent") {
    return (
      <Modal title="Trade request sent" onClose={onClose}>
        <p className="text-sm text-neutral-600">
          We&apos;ve sent your trade request to {toListing.seller.username}. You&apos;ll get a
          notification once they respond.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-full bg-neutral-900 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          done
        </button>
      </Modal>
    );
  }

  return null;
}
