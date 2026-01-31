import { JobListing } from "@/types/jobs";
import MatchesWrapper from "./MatchesWrapper";

type Props = {
  initialMatches: JobListing[];
};

export default function Matches({ initialMatches }: Props) {
  return <MatchesWrapper initialMatches={initialMatches} />;
}
