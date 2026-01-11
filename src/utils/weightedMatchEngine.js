import { skillWeights } from "./skillWeights.js";

export const weightedMatchSkills = (resumeSkills, jdSkills) => {
  let totalWeight = 0;
  let matchedWeight = 0;

  const resumeSet = new Set(resumeSkills);
  const matchedSkills = [];
  const missingSkills = [];

  for (const skill of jdSkills) {
    const weight = skillWeights[skill] || 1;   //if weight not found then default wt=1
    totalWeight += weight;

    if (resumeSet.has(skill)) {
      matchedWeight += weight;
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const matchPercentage = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills
  };
};
