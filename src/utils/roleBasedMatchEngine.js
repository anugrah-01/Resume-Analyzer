import { jobRoleTemplates } from "./jobRoleTemplates.js";

export const roleBasedMatch = (resumeSkills, jdSkills, role) => {
  const template = jobRoleTemplates[role];

  if (!template) {
    throw new Error("Invalid job role");
  }

  let totalWeight = 0;
  let matchedWeight = 0;

  const resumeSet = new Set(resumeSkills);
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of jdSkills) {
    const weight = template[skill] || 1;
    totalWeight += weight;

    if (resumeSet.has(skill)) {
      matchedWeight += weight;
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchPercentage =
    totalWeight === 0
      ? 0
      : Math.round((matchedWeight / totalWeight) * 100);

  return {
    role,
    matchPercentage,
    matchedSkills,
    missingSkills
  };
};
