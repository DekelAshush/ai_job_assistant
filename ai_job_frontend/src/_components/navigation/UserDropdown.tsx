"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/_lib/supabaseClient";

interface UserDropdownProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    first_name?: string | null;
    last_name?: string | null;
  } | null;
}

export function UserDropdown({ user }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      // Clear Supabase auth (server middleware checks supabase auth cookies too)
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut warning:", e);
    }
    router.push("/auth/login");
  };

  // Get user initials for fallback (First + Last initial)
  const getInitials = () => {
    const directFirst =
      user?.firstName ??
      (user as any)?.first_name ??
      undefined;
    const directLast =
      user?.lastName ??
      (user as any)?.last_name ??
      undefined;

    if (directFirst || directLast) {
      const first = directFirst?.trim()?.[0] ?? "";
      const last = directLast?.trim()?.[0] ?? "";
      const initials = (first + last || first).toUpperCase();
      if (initials) return initials;
    }

    if (user?.name) {
      const parts = user.name.trim().split(/\s+/);
      const first = parts[0]?.[0] ?? "";
      const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
      const initials = (first + last || first).toUpperCase();
      if (initials) return initials;
    }

    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="relative" ref={dropdownRef} suppressHydrationWarning>
      {/* User Avatar Button - suppressHydrationWarning: extensions may add fdprocessedid */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
        aria-label="User menu"
        suppressHydrationWarning
      >
        {user?.image? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-lg"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials()}
          </div>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {user?.name ||
                [user?.firstName, (user as any)?.first_name, user?.lastName, (user as any)?.last_name]
                  .filter(Boolean)
                  .join(" ")
                  .trim() ||
                "User"}
            </p>
            {user?.email && <p className="text-xs text-gray-500">{user.email}</p>}
          </div>
          {/* Profile */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Profile
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
            suppressHydrationWarning
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
