import Link from "next/link";
import { createClient } from "@/_lib/supabaseServer";
import { UserDropdown } from "./UserDropdown";
/* Define the navigation items in an array for better maintainability */
const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/about", label: "About" },
  { href: "/matches", label: "Matches" },
  { href: "/jobs", label: "Jobs" },
  { href: "/job_tracker", label: "Job Tracker" },
  { href: "/documents", label: "Documents" },
  { href: "/profile", label: "Profile" },
];

export async function NavbarUser() {
  // Try Supabase auth (for Supabase OAuth logins)
  const supabase = await createClient();
  let supaUser = null;
  let meta: Record<string, any> = {};

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    supaUser = data.user;
    meta = supaUser?.user_metadata || {};
  } catch {
    supaUser = null;
    meta = {};
  }

  const mergedUser = supaUser
    ? {
        name: meta.full_name || meta.name || null,
        email: supaUser.email,
        image: meta.avatar_url || meta.picture || null,
        firstName: meta.first_name || null,
        lastName: meta.last_name || null,
      }
    : null;

  return (
    <nav className="z-10 text-lg flex items-center justify-between w-full">
      <div className="flex items-center gap-10">
        <ul className="flex gap-10 items-center">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-accent-400 transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center">
        <UserDropdown user={mergedUser} />
      </div>
    </nav>
  );
}