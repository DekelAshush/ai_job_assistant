"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/_components/main/Logo";
import ProgressHeader from "@/_components/onboarding/ProgressHeader";
import StepPreferences from "@/_components/onboarding/StepPreferences";
import StepRoles from "@/_components/onboarding/StepRoles";
import StepLocation from "@/_components/onboarding/StepLocation";
import StepWorkType from "@/_components/onboarding/StepWorkType";
import StepCompanySize from "@/_components/onboarding/StepCompanySize";
import StepIndustries from "@/_components/onboarding/StepIndustries";
import StepSkills from "@/_components/onboarding/StepSkills";
import StepExpectedSalary from "@/_components/onboarding/StepExpectedSalary";
import StepJobStatus from "@/_components/onboarding/StepJobStatus";
import { supabaseClient } from "@/_lib/supabaseClient";

export default function PreferencesPage() {
  const router = useRouter();
  const totalSteps = 9;
  const [step, setStep] = useState(1);
  const mainRef = useRef<HTMLDivElement | null>(null);

  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);
  const [selectedIndustriesWant, setSelectedIndustriesWant] = useState<string[]>([]);
  const [selectedIndustriesAvoid, setSelectedIndustriesAvoid] = useState<string[]>([]);
  const [selectedSkillsWant, setSelectedSkillsWant] = useState<string[]>([]);
  const [selectedSkillsAvoid, setSelectedSkillsAvoid] = useState<string[]>([]);
  const [expectedSalary, setExpectedSalary] = useState<number>(125000);
  const [jobStatus, setJobStatus] = useState<string>("");

  // Always scroll to top on step change
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handlePrefsNext = (values: string[]) => {
    setSelectedValues(values);
    setStep(2);
  };

  const handleRolesNext = (values: string[]) => {
    setSelectedRoles(values);
    setStep(3);
  };

  const handleLocationsNext = (values: string[]) => {
    setSelectedLocations(values);
    setStep(4);
  };

  const handleWorkTypeNext = (values: string[]) => {
    setSelectedWorkTypes(values);
    setStep(5);
  };

  const handleCompanySizeNext = (values: string[]) => {
    setSelectedCompanySizes(values);
    setStep(6);
  };

  const handleIndustriesNext = (want: string[], avoid: string[]) => {
    setSelectedIndustriesWant(want);
    setSelectedIndustriesAvoid(avoid);
    setStep(7);
  };

  const handleSkillsNext = (want: string[], avoid: string[]) => {
    setSelectedSkillsWant(want);
    setSelectedSkillsAvoid(avoid);
    setStep(8);
  };

  const handleSalaryNext = (value: number) => {
    setExpectedSalary(value);
    setStep(9);
  };

  const handleJobStatusNext = async (value: string) => {
    setJobStatus(value);

    // Call onboarding API; it resolves user_id from Supabase/NextAuth session on the server
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role_values: selectedValues,
        roles: selectedRoles,
        locations: selectedLocations,
        work_modes: selectedWorkTypes,
        company_sizes: selectedCompanySizes,
        industries_prefer: selectedIndustriesWant,
        industries_avoid: selectedIndustriesAvoid,
        skills_prefer: selectedSkillsWant,
        skills_avoid: selectedSkillsAvoid,
        expected_salary: expectedSalary,
        job_status: value,
      }),
    });

    router.push("/dashboard");
  };

  const handleSignOutClick = async () => {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut warning:", e);
    }
    router.push("/auth/login");
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="flex flex-wrap items-center gap-4 justify-between px-6 py-4">
        <Logo />
        <div className="flex-1 min-w-[220px] max-w-3xl">
          <ProgressHeader currentStep={step} totalSteps={totalSteps} onBack={handleBack} />
        </div>
        <button
          onClick={handleSignOutClick}
          className="text-sm font-medium text-gray-200 hover:text-white border border-gray-700 px-3 py-2 rounded-lg bg-slate-800 hover:border-gray-500 transition-colors"
        >
          Sign out
        </button>
      </div>

      <main
        ref={mainRef}
        className="max-w-6xl mx-auto px-6 pb-16 h-[calc(100vh-72px)] overflow-y-auto"
      >
        <div className="mt-4">
          {step === 1 && (
            <StepPreferences
              data={selectedValues}
              onNext={handlePrefsNext}
              onBack={handleBack}
            />
          )}
          {step === 2 && (
            <StepRoles data={selectedRoles} onNext={handleRolesNext} onBack={handleBack} />
          )}
          {step === 3 && (
            <StepLocation
              data={selectedLocations}
              onNext={handleLocationsNext}
              onBack={handleBack}
            />
          )}
          {step === 4 && (
            <StepWorkType
              data={selectedWorkTypes}
              onNext={handleWorkTypeNext}
              onBack={handleBack}
            />
          )}
          {step === 5 && (
            <StepCompanySize
              data={selectedCompanySizes}
              onNext={handleCompanySizeNext}
              onBack={handleBack}
            />
          )}
          {step === 6 && (
            <StepIndustries
              dataWant={selectedIndustriesWant}
              dataAvoid={selectedIndustriesAvoid}
              onNext={handleIndustriesNext}
              onBack={handleBack}
            />
          )}
          {step === 7 && (
            <StepSkills
              dataWant={selectedSkillsWant}
              dataAvoid={selectedSkillsAvoid}
              onNext={handleSkillsNext}
              onBack={handleBack}
            />
          )}
          {step === 8 && (
            <StepExpectedSalary
              data={expectedSalary}
              onNext={handleSalaryNext}
              onBack={handleBack}
            />
          )}
          {step === 9 && (
            <StepJobStatus data={jobStatus} onNext={handleJobStatusNext} onBack={handleBack} />
          )}
        </div>
      </main>
    </div>
  );
}