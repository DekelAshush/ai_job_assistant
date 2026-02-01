import { NavbarGuest } from "@/_components/navigation/NavbarGuest";
import { NavbarUser } from "@/_components/navigation/NavbarUser";
import Logo from "@/_components/main/Logo";
import { createClient } from "@/_lib/supabaseServer";

async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const supaUser = data.user;

  return (
    <header className="border-b border-primary-900 px-8 py-5 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <Logo />
        <nav className="flex justify-end items-center">
          {supaUser ? <NavbarUser /> : <NavbarGuest />}
        </nav>
      </div>
    </header>
  );
}

export default Header;
