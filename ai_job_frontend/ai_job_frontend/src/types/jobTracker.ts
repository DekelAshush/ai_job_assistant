export type Status = "saved" | "applied" | "interviewing" | "offer" | "rejected";

export type Job = {
  id: string;
  title: string;
  company: string;
  status: Status;
};
