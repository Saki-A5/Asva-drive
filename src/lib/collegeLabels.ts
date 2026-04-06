import { COLLEGE_META } from "@/lib/college";

const idToName = new Map<string, string>(
  Object.entries(COLLEGE_META).map(([id, meta]) => [id, meta.label]),
);

export function collegeIdToName(collegeId: string): string {
  return idToName.get(collegeId) ?? collegeId;
}

export function listCollegesForSelect(): { id: string; name: string }[] {
  return Object.keys(COLLEGE_META).map((id) => ({
    id,
    name: collegeIdToName(id),
  }));
}
