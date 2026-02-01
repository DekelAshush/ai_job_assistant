import Header from "@/_components/main/Header";
import "@/_styles/globals.css";
import { Josefin_Sans } from "next/font/google";

const josefin = Josefin_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: "%s | Job Assistant",
    default: "Welcome | Job Assistant",
  },
  description: `
    The AI-powered Job Assistant is a modern SaaS platform designed to streamline
    the job search and application process for technology professionals.
    Built with Next.js 16 and a Python-based backend, the application leverages
    advanced AI to bridge the gap between candidate profiles and complex job descriptions.
  `.trim(),
};

export default function Layout({ children}: { children: React.ReactNode }) {
  return (
  <html lang="en">
    <body
      className={`text-primary-100 ${josefin.className} flex flex-col min-h-screen antialiased relative`}
      style={{
        backgroundImage: "url('/bg1.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-1 px-8 py-12">
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
   </body>
  </html>
  );
}