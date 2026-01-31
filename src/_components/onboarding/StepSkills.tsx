 "use client";

import { useMemo, useState } from "react";

interface StepSkillsProps {
  dataWant?: string[];
  dataAvoid?: string[];
  onNext: (want: string[], avoid: string[]) => void;
  onBack?: () => void;
}

// Consolidated skills list (pulled from the reference screenshots; deduped)
const SKILLS = [
  "3D Modeling",
  "A/B Testing",
  "Adobe After Effects",
  "Adobe Creative Suite",
  "Adobe Illustrator",
  "Adobe InDesign",
  "Adobe Lightroom",
  "AI & Machine Learning",
  "Android",
  "Angular",
  "Ansible",
  "API Design",
  "Appium",
  "Art Direction",
  "AWS",
  "Azure",
  "Axure RP",
  "Babel",
  "Backbone.js",
  "Balsamiq",
  "Bash",
  "Biochemistry",
  "Biometrics",
  "Bioinformatics",
  "Biostatistics",
  "Blender",
  "Blockchain",
  "Bootstrap",
  "Brand Strategy",
  "Business Analysis",
  "Business Intelligence",
  "Business Strategy",
  "C",
  "C#",
  "C++",
  "CAD",
  "Canva",
  "Chart.js",
  "Chef",
  "CloudFormation",
  "CockroachDB",
  "Cold Calling",
  "Computer Vision",
  "Confluence",
  "Content Strategy",
  "Couchbase",
  "CouchDB",
  "Couchbase",
  "CouchDB",
  "CorelDRAW",
  "Crypto",
  "Customer Success",
  "Cybersecurity",
  "D3.js",
  "Dart",
  "Data Analysis",
  "Data Engineering",
  "Data Governance",
  "Data Lake",
  "Data Science",
  "Data Visualization",
  "Database Administration",
  "Databricks",
  "Datadog",
  "Databases",
  "DevOps",
  "Digital Marketing",
  "Django",
  "Docker",
  "DynamoDB",
  "Elasticsearch",
  "Electron.js",
  "Elixir",
  "Embedded Systems",
  "Ember.js",
  "Express.js",
  "Figma",
  "Firebase",
  "Flask",
  "Flutter",
  "Fortran",
  "GCP",
  "Git",
  "Github Actions",
  "Go",
  "Google Ads",
  "Google Analytics",
  "Graph Databases",
  "GraphQL",
  "Groovy",
  "gRPC",
  "Hadoop",
  "Haskell",
  "Helm",
  "Heroku",
  "Hibernate",
  "HTML",
  "iOS/Swift",
  "Illustration",
  "Industrial Design",
  "Infrastructure as Code (IaC)",
  "Interaction Design",
  "Inventory Management",
  "Java",
  "JavaScript",
  "Jenkins",
  "Jest",
  "Jira",
  "jQuery",
  "Kafka",
  "Kali Linux",
  "Keras",
  "Kinesis",
  "Kotlin",
  "Kubernetes",
  "Laravel",
  "Lead Generation",
  "Legal Research",
  "Linux/Unix",
  "LLM",
  "LogScale",
  "Looker",
  "Lua",
  "Machine Learning",
  "Manufacturing",
  "Market Research",
  "Marketing",
  "Mathematica",
  "Matplotlib",
  "Maven",
  "Mechatronics",
  "Microservices",
  "Microsoft Azure",
  "Microsoft SQL Server",
  "Middleware",
  "MongoDB",
  "Mongoose",
  "MySQL",
  "Netlify",
  ".NET",
  "Network Monitoring",
  "Neural Networks",
  "Next.js",
  "Node.js",
  "Nginx",
  "NoSQL",
  "NumPy",
  "Nutanix",
  "OAuth",
  "Objective-C",
  "Observability",
  "OCaml",
  "OpenAPI",
  "OpenCV",
  "OpenGL",
  "OpenShift",
  "OpenTelemetry",
  "Operating Systems",
  "Oracle",
  "Packer",
  "Pandas",
  "PCI",
  "Perl",
  "Pharmacology",
  "PHP",
  "Pinecone",
  "Playwright",
  "Plotly",
  "Political Science",
  "PostgreSQL",
  "Postman",
  "Power BI",
  "Prisma",
  "Product Design",
  "Product Management",
  "Prometheus",
  "Propulsion",
  "Prototyping",
  "Pro Tools",
  "Public Policy",
  "Public Speaking",
  "Puppet",
  "Puppeteer",
  "PyTorch",
  "QA",
  "Quantitative Research",
  "QuickBooks",
  "R",
  "RabbitMQ",
  "RAG",
  "React.js",
  "React Native",
  "Redis",
  "Redshift",
  "Redux.js",
  "Regression",
  "Reinforcement Learning",
  "REST APIs",
  "Risk Management",
  "Ruby",
  "Ruby on Rails",
  "Rust",
  "Salesforce",
  "SAS",
  "Scala",
  "Scikit-learn",
  "SCRUM",
  "Seaborn",
  "Security",
  "Segment",
  "Selenium",
  "Serverless",
  "Service Mesh",
  "ServiceNow",
  "Sketch",
  "Snowflake",
  "Social Media",
  "Socket.io",
  "Solidity",
  "SQL",
  "Storybook",
  "Stripe",
  "Supabase",
  "Survey Design",
  "Tableau",
  "Tailwind CSS",
  "Talend",
  "Terraform",
  "TensorFlow",
  "Threat Modeling",
  "Tomcat",
  "TypeScript",
  "UI/UX Design",
  "Unity",
  "Unreal Engine",
  "Usability Testing",
  "UX Research",
  "Vercel",
  "Video Editing",
  "Vim",
  "Visio",
  "VMWare",
  "Vue.js",
  "Web Development",
  "Webflow",
  "Webpack",
  "Wireframing",
  "Wireshark",
  "Wordpress",
  "Workday HRIS",
  "Xamarin",
  "XGBoost",
  "Yarn",
  "Zapier",
  "ZBrush",
  "Zeplin",
  "Zod",
  "Zustand",
];

// Deduplicate to avoid key collisions
const SKILLS_LIST = Array.from(new Set(SKILLS));

export default function StepSkills({
  dataWant = [],
  dataAvoid = [],
  onNext,
  onBack,
}: StepSkillsProps) {
  const [want, setWant] = useState<string[]>(dataWant);
  const [avoid, setAvoid] = useState<string[]>(dataAvoid);
  const [searchWant, setSearchWant] = useState("");
  const [searchAvoid, setSearchAvoid] = useState("");
  const [wantOpen, setWantOpen] = useState(false);
  const [avoidOpen, setAvoidOpen] = useState(false);

  const filteredWant = useMemo(() => {
    const term = searchWant.toLowerCase();
    return SKILLS_LIST.filter(
      (skill) => !want.includes(skill) && !avoid.includes(skill) && skill.toLowerCase().includes(term)
    );
  }, [searchWant, want, avoid]);

  const filteredAvoid = useMemo(() => {
    const term = searchAvoid.toLowerCase();
    return SKILLS_LIST.filter(
      (skill) => !avoid.includes(skill) && !want.includes(skill) && skill.toLowerCase().includes(term)
    );
  }, [searchAvoid, want, avoid]);

  const addWant = (skill: string) => {
    setWant((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
    setAvoid((prev) => prev.filter((s) => s !== skill));
    setSearchWant("");
    setWantOpen(false);
  };

  const addAvoid = (skill: string) => {
    setAvoid((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
    setWant((prev) => prev.filter((s) => s !== skill));
    setSearchAvoid("");
    setAvoidOpen(false);
  };

  const removeWant = (skill: string) => setWant((prev) => prev.filter((s) => s !== skill));
  const removeAvoid = (skill: string) => setAvoid((prev) => prev.filter((s) => s !== skill));

  const handleContinue = () => {
    if (want.length > 0) onNext(want, avoid);
  };

  return (
    <div className="max-w-4xl mx-auto text-gray-100 space-y-8">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          What skills do you have or enjoy working with?
        </h1>
        <p className="text-sm text-gray-300">Select all that apply</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-gray-300">Search all skills...</label>
        <div className="relative">
          <input
            value={searchWant}
            onChange={(e) => setSearchWant(e.target.value)}
            placeholder="Search and add skills you like"
            className="w-full rounded-lg border border-gray-700 bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            onFocus={() => setWantOpen(true)}
            onClick={() => setWantOpen(true)}
            onBlur={() => setTimeout(() => setWantOpen(false), 100)}
          />
          {wantOpen && (
            <div
              className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-700 bg-slate-800 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredWant.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">No matches found.</div>
              )}
              {filteredWant.map((skill) => (
                <button
                  key={`want-${skill}`}
                  onClick={() => addWant(skill)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-100 hover:bg-slate-700"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Selected skills</p>
          <div className="flex flex-wrap gap-2">
            {want.length === 0 && (
              <span className="text-sm text-gray-400">None selected yet.</span>
            )}
            {want.map((skill) => (
              <span
                key={`chip-want-${skill}`}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-3 py-1 text-xs"
              >
                {skill}
                <button
                  onClick={() => removeWant(skill)}
                  className="text-white/80 hover:text-white"
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-700 bg-slate-800/80 p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-rose-300">
          <span role="img" aria-label="alert">
            🚫
          </span>
          <span>Are there any skills you don&apos;t want to work with?</span>
        </div>

        <div className="relative">
          <input
            value={searchAvoid}
            onChange={(e) => setSearchAvoid(e.target.value)}
            placeholder="Search skills to filter out"
            className="w-full rounded-lg border border-rose-500/60 bg-slate-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-400"
            onFocus={() => setAvoidOpen(true)}
            onClick={() => setAvoidOpen(true)}
            onBlur={() => setTimeout(() => setAvoidOpen(false), 100)}
          />
          {avoidOpen && (
            <div
              className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-700 bg-slate-800 shadow-lg"
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredAvoid.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">No matches found.</div>
              )}
              {filteredAvoid.map((skill) => (
                <button
                  key={`avoid-${skill}`}
                  onClick={() => addAvoid(skill)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-100 hover:bg-slate-700"
                >
                  {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {avoid.length === 0 && (
            <span className="text-sm text-gray-400">No skills to avoid selected.</span>
          )}
          {avoid.map((skill) => (
            <span
              key={`chip-avoid-${skill}`}
              className="inline-flex items-center gap-2 rounded-full bg-rose-600 text-white px-3 py-1 text-xs"
            >
              {skill}
              <button
                onClick={() => removeAvoid(skill)}
                className="text-white/80 hover:text-white"
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {onBack && (
          <button
            onClick={onBack}
            className="text-sm text-gray-300 hover:text-white transition-colors"
          >
            ← Back
          </button>
        )}
        <button
          onClick={handleContinue}
          disabled={want.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            want.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save and Continue
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
