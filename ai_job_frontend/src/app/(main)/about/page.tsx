import Image from "next/image";
import about1 from "../../../../public/about-1.png";
import about2 from "../../../../public/about-2.png";

export default function Page() {
    return (
      <div className="grid grid-cols-5 gap-x-24 gap-y-32 text-lg items-center">
        <div className="col-span-3">
          <h1 className="text-4xl mb-10 text-accent-400 font-medium">
            Intelligent Matching. Effortless Discovery.
          </h1>
  
          <div className="space-y-8">
            <p>
                The AI Job Application Assistant was born out of a necessity to simplify the 
                modern job market for tech professionals. By leveraging specialized AI models, 
                we transform how candidates interact with job descriptions.
            </p>
            <p>
                Whether you are an engineer looking for your next challenge or a recruiter 
                seeking the perfect fit, our platform provides the clarity and precision 
                needed to succeed in 2026's competitive landscape.
            </p>
           
          </div>
        </div>
  
        <div className="col-span-2">
          <Image
            src={about1}
            alt="ai job picture gpt"
            quality={80}
          />
        </div>
  
        <div className="col-span-2">
          <Image src={about2} quality={80} alt="ai job picture gimini" />
        </div>
  
        <div className="col-span-3">
          <h1 className="text-4xl mb-10 text-accent-400 font-medium">
            AI Job Assistant: A Modern Job Application Assistant
          </h1>
  
          <div className="space-y-8">
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
                Job Assistant acts as a personal AI copilot throughout the job search journey. Here, users aren’t 
                just submitting applications but they’re making smarter, more confident career moves with technology 
                built from firsthand industry experience.
            </p>
            <div>
              <a
                href="/auth"
                className="inline-block mt-4 bg-accent-500 px-8 py-5 text-primary-800 text-lg font-semibold hover:bg-accent-600 transition-all"
              >
                Explore our application Assistant
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }