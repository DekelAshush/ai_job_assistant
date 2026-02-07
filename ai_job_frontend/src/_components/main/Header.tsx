import { NavbarGuest } from "@/_components/navigation/NavbarGuest";
import { NavbarUser } from "@/_components/navigation/NavbarUser";
import Logo from "@/_components/main/Logo";
import { createClient } from "@/_lib/supabaseServer";

async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supaUser = data.user;

  return (
    <header className="sticky top-0 z-40 backdrop-blur border-b border-slate-800 bg-slate-900/85 shadow-lg shadow-slate-900/40 text-slate-100">
      <div className="w-full px-10 md:px-20 lg:px-28 xl:px-36 py-6 flex justify-between items-center">
        <div className="-ml-30">
          <Logo />
        </div>
        <nav className="flex justify-end items-center">
          {supaUser ? <NavbarUser /> : <NavbarGuest />}
        </nav>
      </div>
    </header>
  );
}

export default Header;
