"use client";

import { useMemo, useState } from "react";

interface RoleCategory {
  title: string;
  roles: string[];
}

interface StepRolesProps {
  data?: string[];
  onNext: (values: string[]) => void;
  onBack?: () => void;
}

const ROLE_CATEGORIES: RoleCategory[] = [
  {
    title: "Technical & Engineering",
    roles: [
      "Aerospace Engineering",
      "AI & Machine Learning",
      "Architecture & Civil Engineering",
      "Data & Analytics",
      "Developer Relations",
      "DevOps & Infrastructure",
      "Electrical Engineering",
      "Engineering Management",
      "Hardware Engineering",
      "IT & Security",
      "Mechanical Engineering",
      "Process Engineering",
      "QA & Testing",
      "Quantitative Finance",
      "Quantum Computing",
      "Sales & Solution Engineering",
      "Software Engineering",
    ],
  },
  {
    title: "Finance & Operations & Strategy",
    roles: [
      "Accounting",
      "Business & Strategy",
      "Consulting",
      "Finance & Banking",
      "Growth & Marketing",
      "Operations & Logistics",
      "Product",
      "Real Estate",
    ],
  },
  {
    title: "Creative & Design",
    roles: [
      "Art, Graphics & Animation",
      "Audio & Sound Design",
      "Content & Writing",
      "Creative Production",
      "Journalism",
      "Social Media",
      "UI/UX & Design",
    ],
  },
  {
    title: "Education & Training",
    roles: ["Education", "Training"],
  },
  {
    title: "Facilities & Maintenance",
    roles: [
      "Building Systems & HVAC",
      "Building Trades",
      "Cleaning & Custodial Services",
      "Facilities Operations",
      "General Maintenance & Repair",
      "Grounds & Landscaping",
      "Security & Protective Services",
    ],
  },
  {
    title: "Legal & Support & Administration",
    roles: [
      "Administrative & Executive Assistance",
      "Clerical & Data Entry",
      "Customer Experience & Support",
      "Legal & Compliance",
      "People & HR",
    ],
  },
  {
    title: "Life Sciences",
    roles: [
      "Biology & Biotech",
      "Lab & Research",
      "Medical, Clinical & Veterinary",
    ],
  },
  {
    title: "Sales & Retail",
    roles: ["Retail", "Sales & Account Management"],
  },
];

export default function StepRoles({
  data = [],
  onNext,
  onBack,
}: StepRolesProps) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(data);
  const [search, setSearch] = useState("");
  const maxSelections = 5;

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ROLE_CATEGORIES;
    const term = search.toLowerCase();
    return ROLE_CATEGORIES.map((cat) => ({
      ...cat,
      roles: cat.roles.filter((role) => role.toLowerCase().includes(term)),
    })).filter((cat) => cat.roles.length > 0);
  }, [search]);

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else if (selectedRoles.length < maxSelections) {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleContinue = () => {
    if (selectedRoles.length > 0) {
      onNext(selectedRoles);
    }
  };

  return (
    <div className="max-w-5xl mx-auto text-gray-100">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
        What kinds of roles are you interested in?
      </h1>
      <p className="text-sm text-gray-300 mb-8">Select up to {maxSelections}</p>

      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title"
          className="w-full rounded-lg border border-gray-700 bg-slate-800 px-4 py-3 text-sm text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.title} className="space-y-3">
            <h3 className="text-base font-semibold text-white">
              {category.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.roles.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const isDisabled =
                  !isSelected && selectedRoles.length >= maxSelections;

                return (
                  <button
                    key={role}
                    onClick={() => toggleRole(role)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-full border text-sm transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-gray-700 bg-slate-800 text-gray-200 hover:border-gray-500"
                    } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {role}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedRoles.length > 0 && (
        <p className="mt-6 text-sm text-gray-300">
          {selectedRoles.length} of {maxSelections} selected
        </p>
      )}

      <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
          disabled={selectedRoles.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedRoles.length > 0
              ? "bg-blue-600 text-white hover:bg-blue-500"
              : "bg-gray-700 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save and Continue
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
