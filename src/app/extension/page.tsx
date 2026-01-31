import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Application Assistant | Extension",
};

export default function ExtensionDemoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-100 p-4">
      <div className="max-w-lg text-center space-y-3">
        <h1 className="text-2xl font-bold">Browser Extension</h1>
        <p className="text-sm text-slate-300">
          The extension UI is not available in this build. Please check back soon.
        </p>
      </div>
    </main>
  );
}
