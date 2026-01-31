import Link from "next/link";
import Image from "next/image";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 z-10">
      <Image
        src="/Logo.png"
        alt ="Logo"
        width={64}
        height={64}
        className="rounded-full object-contain"
        style={{ maxHeight: "64px", objectFit: "contain" }}
      />
      <span className="text-2xl font-bold tracking-tight">Job Assistant</span>
    </Link>
  );
}

export default Logo;
