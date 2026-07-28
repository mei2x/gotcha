"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "./Logo";
import { CutMark } from "./CutMark";
import { useAuth } from "./AuthProvider";
import { resolveAvatarUrl, fetchIncomingTradeRequests } from "@/lib/authApi";
import type { Character } from "@/lib/types";

export function Header({ characters }: { characters: Character[] }) {
  const { user, loading } = useAuth();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setRequestCount(0);
      return;
    }
    fetchIncomingTradeRequests()
      .then((requests) => setRequestCount(requests.length))
      .catch(() => {});
  }, [user]);

  return (
    <header className="flex items-center justify-between px-10 py-8">
      <div className="flex items-center">
        <Logo />
        {/* <Image
          src={"/images/gotcha_claw.png"}
          alt="Header Claws"
          unoptimized
          width={50}
          height={70}
          className="h-50 w-70"
        /> */}
      </div>
      {/* <div className="flex items-center">
        {characters.map((character) =>
          character.iconUrl ? (
            <Image
              key={character.id}
              src={character.iconUrl}
              alt={character.name}
              title={character.name}
              width={40}
              height={40}
              className="h-25 w-25 shrink-0 object-contain"
            />
          ) : null
        )}
      </div> */}
      <div className="flex items-center ml-45">
        <Link href="/browse">
          <Image
            src="/images/header_chars.png"
            alt="Header characters"
            unoptimized
            width={400}
            height={124}
            className="h-31 w-100"
          />
        </Link>

      </div>
      <nav className="flex items-center gap-8 text-sm text-neutral-700">
        {!loading && user ? (
          <>
            <Link href="/account" className="flex items-center gap-2 text-[#7D8028] hover:text-[#7D8028]">
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
            <Link href="/likes" className="hover:text-neutral-900">
              likes
            </Link>
            <Link href="/post" className="hover:text-neutral-900">
              post
            </Link>
            <Link href="/requests" className="hover:text-neutral-900">
              requests{requestCount > 0 ? ` (${requestCount})` : ""}
            </Link>
          </>
        ) : (
          <Link href="/login" className="hover:text-neutral-900">
            login/sign up
          </Link>
        )}
      </nav>
    </header>
  );
}
