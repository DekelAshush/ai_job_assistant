"use client";

import { JobListing } from "@/types/jobs";
import JobCard from "./JobCard";

type Props = {
  jobs: JobListing[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function JobCardList({ jobs, selectedId, onSelect }: Props) {
  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} active={job.id === selectedId} onSelect={onSelect} />
      ))}
    </div>
  );
}
