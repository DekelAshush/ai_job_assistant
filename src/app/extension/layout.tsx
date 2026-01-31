import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Application Assistant | Extension",
};

export default function ExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
