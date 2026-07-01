const SKILL_POOL = [
  "Communication",
  "Research",
  "Excel",
  "Leadership",
  "Public speaking",
  "Data analysis",
  "Marketing",
  "Design",
  "Teaching",
  "Project management",
  "Writing",
  "Customer service",
  "Clinical care",
  "Finance",
  "Python",
  "Spanish",
  "Teamwork",
  "Problem solving",
  "Time management",
  "Social media",
  "Photography",
  "Video editing",
  "Lab techniques",
  "Statistics",
  "Accounting",
  "Sales",
  "Negotiation",
  "Event planning",
  "Graphic design",
  "UX research",
  "Legal research",
  "Patient care",
  "Curriculum design",
  "Tutoring",
  "Fundraising",
  "Grant writing",
  "CAD",
  "GIS",
  "Survey design",
  "Policy analysis",
  "Supply chain",
  "Quality assurance",
  "First aid",
  "Conflict resolution",
  "Adobe Creative Suite",
  "PowerPoint",
  "SQL",
  "Java",
  "R",
  "MATLAB",
];

export const SKILL_SUGGESTION_COUNT = 8;

export function pickRandomSkillSuggestions(
  exclude: string[],
  count = SKILL_SUGGESTION_COUNT,
): string[] {
  const excluded = new Set(exclude.map((skill) => skill.toLowerCase()));
  const available = SKILL_POOL.filter((skill) => !excluded.has(skill.toLowerCase()));
  const shuffled = [...available];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, Math.min(count, shuffled.length));
}
