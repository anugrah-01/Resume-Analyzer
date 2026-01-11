import { skillsList } from "./skillsList.js";

export const extractSkills = (resumeText) => {   //to extract skills from uploaded resume
  const foundSkills = new Set();

  const text = resumeText.toLowerCase();

  for (const skill of skillsList) {
    if (text.includes(skill)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
};
