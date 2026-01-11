import { createRequire } from "module";
import { extractSkills } from "../utils/skillExtractor.js";
import { extractJDSkills } from "../utils/jdSkillExtractor.js";
import { matchSkills } from "../utils/matchEngine.js";
import pool from "../config/db.js";   //to connect with postgreSQL
import { weightedMatchSkills } from "../utils/weightedMatchEngine.js";
import { roleBasedMatch } from "../utils/roleBasedMatchEngine.js";


const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const uploadResume = async (req, res) => {   //to extract skills from uploaded resume
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const userId = req.user.userId;   //req.user came from JWT middleware, JWT → userId → DB link

    // Extract text from PDF buffer
    const data = await pdfParse(req.file.buffer);   //req.file.buffer → raw PDF data, pdf() returns extracted text
    const skills = extractSkills(data.text);

    await pool.query(   /*query is a function provided by the pg library...its job is 
                        to Send SQL to PostgreSQL, wait for result, return it to Node.js*/
        "INSERT INTO resumes (user_id, skills) VALUES ($1, $2)",    //this means insert first value from array as userId and second value as skills in the table
        [userId, skills]
      );

    /*We have used pool.query from the pg library to execute parameterized SQL queries asynchronously. 
    Placeholders like $1 and $2 prevent SQL injection and allow safe value binding.*/
      

    // Send extracted text
    res.json({
      message: "Resume uploaded successfully",   //send response
      skills,
      totalSkillsFound: skills.length
    });

    /*After parsing the resume PDF,
    I implemented a lightweight NLP-style skill extraction system using keyword matching, making the system explainable and fast*/

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to process PDF" });
  }
};


export const matchResumeWithJD = async (req, res) => {   //to match resume skills with uploaded jd skills
    try {
      const userId = req.user.userId;
      const { jobDescription, role } = req.body;
  
      if (!jobDescription || !role) {
        return res.status(400).json({
          message: "Job description and role are required"
        });
      }

      const result = await pool.query(
        "SELECT skills FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          message: "No resume found. Please upload resume first."
        });
      }
      
      const resumeSkills = result.rows[0].skills;
      const jdSkills = extractJDSkills(jobDescription);
      const matchResult = roleBasedMatch(resumeSkills, jdSkills, role);

      await pool.query(
        `INSERT INTO match_history 
         (user_id, role, match_percentage, matched_skills, missing_skills)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          role,
          matchResult.matchPercentage,
          matchResult.matchedSkills,
          matchResult.missingSkills
        ]
      );      

      res.json({
        role,
        resumeSkills,
        jdSkills,
        ...matchResult
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Matching failed" });
    }
};      


export const getMatchHistory = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const result = await pool.query(
        `SELECT role, match_percentage, matched_skills, missing_skills, created_at
         FROM match_history
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [userId]
      );
  
      res.json({
        count: result.rows.length,
        history: result.rows
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch match history"
      });
    }
  };
  
  
  


/*Resume Upload API
POST /resume/upload

Backend:
extracts skills
stores them (DB)

Response:

{
  "message": "Resume uploaded",
  "skills": ["node.js", "sql", "git"]
}

Job Match API (UPDATED)
POST /resume/match


Client sends:

{
  "jobDescription": "Looking for Node.js, React, SQL"
}


Backend:
Reads userId from JWT
Fetches resume skills from DB
Extracts JD skills
Matches them
Returns result*/

  
