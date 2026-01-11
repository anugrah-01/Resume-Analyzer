export const matchSkills = (resumeSkills, jdSkills) => {
    const resumeSet = new Set(resumeSkills);
  
    const matchedSkills = [];
    const missingSkills = [];
  
    for (const skill of jdSkills) {
      if (resumeSet.has(skill)) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }
  
    const matchPercentage = jdSkills.length === 0 ? 0 : Math.round((matchedSkills.length / jdSkills.length) * 100);
  
    return {
      matchPercentage,
      matchedSkills,
      missingSkills
    };
  };
  