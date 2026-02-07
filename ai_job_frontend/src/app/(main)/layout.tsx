import Header from "@/_components/main/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex-1 w-full px-10 md:px-20 lg:px-28 xl:px-36 py-12">
        <main className="w-full">
          {children}
        </main>
      </div>
    </>
  );
}