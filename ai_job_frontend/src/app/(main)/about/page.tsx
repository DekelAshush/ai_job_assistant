import Image from "next/image";
import Link from "next/link";
import about1 from "../../../../public/about-1.png";
import about2 from "../../../../public/about-2.png";

export default function Page() {
  return (
    /* Same width as header; layout padding aligns with dashboard header */
    <div className="min-h-screen bg-slate-900 text-slate-100 w-full">
      <div className="w-full">
        <div className="space-y-10">
          {/* Section 1: Intelligent Matching */}
          <div className="rounded-3xl border border-slate-800 bg-slate-800/70 shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center p-8">
              <div className="lg:col-span-3 space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  Intelligent Matching. Effortless Discovery.
                </h1>
                <div className="space-y-4 text-slate-300 text-base md:text-lg">
                  <p>
                    The AI Job Application Assistant was born out of a necessity to simplify the
                    modern job market for tech professionals. By leveraging specialized AI models,
                    we transform how candidates interact with job descriptions.
                  </p>
                  <p>
                    Whether you are an engineer looking for your next challenge or a recruiter
                    seeking the perfect fit, our platform provides the clarity and precision
                    needed to succeed in 2026&apos;s competitive landscape.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-2">
                <Image
                  src={about1}
                  alt="AI job matching"
                  quality={80}
                  className="rounded-2xl border border-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Job Assistant */}
          <div className="rounded-3xl border border-slate-800 bg-slate-800/70 shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center p-8">
              <div className="lg:col-span-2 order-2 lg:order-1">
                <Image
                  src={about2}
                  alt="AI job assistant"
                  quality={80}
                  className="rounded-2xl border border-slate-700"
                />
              </div>
              <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  AI Job Assistant: A Modern Job Application Assistant
                </h1>
                <div className="space-y-4 text-slate-300 text-base md:text-lg">
                  <p>
                    Built through hands-on experience as part of the PM Accelerator AI Engineering Internship, Job Assistant is an
                    AI-powered platform designed to simplify and elevate the job application process for modern professionals.
                  </p>
                  <p>
                    Rooted in real product development, this platform was shaped by practical experience in building production-grade
                    AI tools — from resume-to-job matching and intelligent scoring, to personalized application answers and workflow tracking.
                    Every feature reflects a deep understanding of both candidate pain points and product-driven AI solutions.
                  </p>
                  <p>
                    By combining advanced language models, thoughtful product design, and real-world experimentation,
                    Job Assistant acts as a personal AI copilot throughout the job search journey. Here, users aren&apos;t
                    just submitting applications but they&apos;re making smarter, more confident career moves with technology
                    built from firsthand industry experience.
                  </p>
                </div>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-500 transition-colors"
                >
                  Explore our application Assistant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}