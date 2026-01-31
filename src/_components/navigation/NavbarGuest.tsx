"use client";
import Link from "next/link";

export const NavbarGuest = () => {
  return (
    <nav className="z-10 text-xl">
      <ul className="flex gap-16 items-center">
      <li>
          <Link href="/auth/login" className="hover:text-accent-400 transition-colors">
            Log in
          </Link>
      </li>
      <li>
          <Link href="/auth/register" className="hover:text-accent-400 transition-colors">
            Sign up
          </Link>
        </li> 
        <li>
          <Link href="/about" className="hover:text-accent-400 transition-colors">About</Link>
        </li>
      </ul>
    </nav>
  );
};