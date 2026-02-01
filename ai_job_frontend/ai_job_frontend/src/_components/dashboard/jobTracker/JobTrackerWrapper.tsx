"use client";

import dynamic from "next/dynamic";

// Load JobTracker on the client only
const JobTracker = dynamic(() => import("./JobTracker"), { ssr: false });

export default function JobTrackerWrapper() {
  return <JobTracker />;
}
