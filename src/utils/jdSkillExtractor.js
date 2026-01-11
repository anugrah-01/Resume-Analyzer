import { skillsList } from "./skillsList.js";

export const extractJDSkills = (jdText) => {   //to extract reqired skills from uploaded jd
  const foundSkills = new Set();
  const text = jdText.toLowerCase();

  for (const skill of skillsList) {
    if (text.includes(skill)) {
      foundSkills.add(skill);
    }
  }

  return Array.from(foundSkills);
};
