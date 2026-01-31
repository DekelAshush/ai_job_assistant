import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 z-10 px-3 py-2 rounded-full bg-white/10 backdrop-blur-sm ring-1 ring-white/30 shadow-lg"
    >
      <Image
        src="/logo.png"
        alt="Job Assistant logo"
        width={64}
        height={64}
        className="rounded-full object-contain bg-white shadow-sm ring-1 ring-white/60"
        style={{ maxHeight: "64px", objectFit: "contain" }}
        priority
      />
      <span className="text-2xl font-bold tracking-tight text-white drop-shadow">
        Job Assistant
      </span>
    </Link>
  );
}

export default Logo;
