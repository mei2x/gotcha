"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import BrowsePage from "@/app/browse/page";

const TRANSITION_MS = 450;

// The landing page doesn't scroll (nothing overflows), so we listen for
// wheel/touch gestures directly and treat a downward scroll intent as
// "go to browse". Rather than jumping straight to the route, we mount the
// real browse page as an overlay sliding up from below while the landing
// content slides up and out in sync, then swap to the real route once the
// animation finishes (the content already matches, so the swap is
// invisible).
export function ScrollToBrowse({ children }: { children: ReactNode }) {
  const router = useRouter();
  const triggeredRef = useRef(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const goToBrowse = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setLeaving(true);
      window.setTimeout(() => router.replace("/browse"), TRANSITION_MS);
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 15) goToBrowse();
    };

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - currentY > 40) goToBrowse();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [router]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="h-screen w-full"
        style={
          leaving
            ? { animation: `slide-out-up ${TRANSITION_MS}ms ease-in forwards` }
            : undefined
        }
      >
        {children}
      </div>
      {leaving && (
        <div
          className="fixed inset-0 z-10 overflow-auto bg-white"
          style={{ animation: `slide-in-up ${TRANSITION_MS}ms ease-in forwards` }}
        >
          <BrowsePage />
        </div>
      )}
    </div>
  );
}
