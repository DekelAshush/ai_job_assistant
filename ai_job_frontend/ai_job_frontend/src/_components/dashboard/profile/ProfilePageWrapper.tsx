"use client";

import dynamic from "next/dynamic";
import type { PersonalInfo, JobPreferences } from "@/types/profile";

const ProfilePageClient = dynamic(() => import("./ProfilePageClient"), { ssr: false });

type Props = {
  userId: string | null;
  initialInfo: PersonalInfo;
  initialJobPrefs: JobPreferences;
};

export default function ProfilePageWrapper(props: Props) {
  return <ProfilePageClient {...props} />;
}
