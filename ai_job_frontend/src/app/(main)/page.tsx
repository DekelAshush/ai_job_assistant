import Link from "next/link";
import Image from "next/image";
import bg1 from "../../../public/bg1.png";

export default function Page() {
  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 w-full h-full -z-10">
        <Image 
          src={bg1} 
          fill 
          quality={80}  
          alt="Jobs and Opportunities"
          className="object-cover"
          sizes="100vw"
          placeholder="blur"
          priority
        />
      </div>
     
      <div className="relative z-10 text-center min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-8xl text-primary-50 mb-10 tracking-tight font-normal">
          Welcome to Job Application Assistant
        </h1>
        <Link
          href="/auth/login"
          className="bg-blue-400 px-8 py-6 text-primary-800 text-lg font-semibold hover:bg-blue-500 transition-all"
        >
          Leveraging advanced AI to align your profile with the perfect opportunity.
        </Link>
      </div>
    </main>
  );
}