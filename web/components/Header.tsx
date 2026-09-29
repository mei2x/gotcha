"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import { useAuth } from "./AuthProvider";
import { resolveAvatarUrl, fetchIncomingTradeRequests } from "@/lib/authApi";
import type { Character } from "@/lib/types";

export function Header({ characters: _characters }: { characters: Character[] }) {
  const { user, loading } = useAuth();
  const [requestCount, setRequestCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setRequestCount(0);
      return;
    }
    fetchIncomingTradeRequests()
      .then((requests) => setRequestCount(requests.length))
      .catch(() => {});
  }, [user]);

  const navLinks =
    !loading && user ? (
      <>
        <Link
          href="/account"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-[#7D8028] hover:text-[#7D8028]"
        >
          {user.avatarUrl && (
            <Image
              src={resolveAvatarUrl(user.avatarUrl)!}
              alt=""
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 rounded-full object-cover"
            />
          )}
          {user.username}
        </Link>
        <Link href="/likes" onClick={() => setMenuOpen(false)} className="hover:text-neutral-900">
          likes
        </Link>
        <Link href="/post" onClick={() => setMenuOpen(false)} className="hover:text-neutral-900">
          post
        </Link>
        <Link href="/requests" onClick={() => setMenuOpen(false)} className="hover:text-neutral-900">
          requests{requestCount > 0 ? ` (${requestCount})` : ""}
        </Link>
      </>
    ) : (
      <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-neutral-900">
        login/sign up
      </Link>
    );

  return (
    <header className="relative flex items-center gap-4 px-4 py-4 sm:px-8 lg:px-10 lg:py-8">
      <div className="flex flex-1 items-center">
        <Logo />
      </div>

      <Link href="/browse" className="flex shrink-0 items-center">
        <Image
          src="/images/header_chars.png"
          alt="Header characters"
          unoptimized
          width={400}
          height={124}
          className="h-auto w-24 sm:w-32 md:w-48 lg:w-96"
        />
      </Link>

      <div className="flex flex-1 items-center justify-end gap-4">
        <nav className="hidden items-center gap-6 text-sm text-neutral-700 md:flex lg:gap-8">
          {navLinks}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="flex flex-col gap-1.5 md:hidden"
        >
          <span className="h-0.5 w-6 bg-neutral-900" />
          <span className="h-0.5 w-6 bg-neutral-900" />
          <span className="h-0.5 w-6 bg-neutral-900" />
        </button>
      </div>

      {menuOpen && (
        <nav className="absolute left-0 right-0 top-full z-10 flex flex-col gap-4 border-t border-neutral-200 bg-white px-4 py-4 text-sm text-neutral-700 md:hidden">
          {navLinks}
        </nav>
      )}
    </header>
  );
}
