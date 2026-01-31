import { NavbarUser } from "@/_components/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col text-slate-100">
      <header className="sticky top-0 z-40 backdrop-blur border-b border-slate-800 bg-slate-900/85 shadow-lg shadow-slate-900/40">
        <div className="w-full px-10 md:px-20 lg:px-28 xl:px-36 py-6">
          <NavbarUser />
        </div>
      </header>
      <main className="flex-1 w-full bg-transparent">
        {children}
      </main>
    </div>
  );
}