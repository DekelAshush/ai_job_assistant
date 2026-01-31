import Header from "@/_components/main/Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header /> 
      <div className="flex-1 px-8 py-12 w-full">
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </>
  );
}