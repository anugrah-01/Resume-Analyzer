import { createRequire } from "module";
import { extractSkills } from "../utils/skillExtractor.js";
import { extractJDSkills } from "../utils/jdSkillExtractor.js";
import { matchSkills } from "../utils/matchEngine.js";
import pool from "../config/db.js";   //to connect with postgreSQL
import { weightedMatchSkills } from "../utils/weightedMatchEngine.js";
import { roleBasedMatch } from "../utils/roleBasedMatchEngine.js";


const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const uploadResume = async (req, res, next) => {   //to extract skills from uploaded resume
  try {
    // Check if file exists
    if (!req.file) {
      const err = new Error("No file uploaded");
      err.status = 400;
      throw err;
    }

    const userId = req.user.userId;   //req.user came from JWT middleware, JWT → userId → DB link

    // Generate hash for idempotency
    const resumeHash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

    // Check if same resume already exists
    const existingResume = await pool.query(`SELECT id FROM resumes WHERE user_id = $1 AND resume_hash = $2`, [userId, resumeHash]);

    if (existingResume.rows.length > 0) {
      const err = new Error("Resume already uploaded");
      err.status = 409;
      throw err;
    }

    // Extract text from PDF buffer
    const data = await pdfParse(req.file.buffer);   //req.file.buffer → raw PDF data, pdf() returns extracted text
    const skills = extractSkills(data.text);

    await pool.query(   /*query is a function provided by the pg library...its job is 
                        to Send SQL to PostgreSQL, wait for result, return it to Node.js*/
        "INSERT INTO resumes (user_id, skills, resume_hash) VALUES ($1, $2, $3)",    //this means insert first value from array as userId and second value as skills in the table
        [userId, skills, resumeHash]
      );

    /*We have used pool.query from the pg library to execute parameterized SQL queries asynchronously. 
    Placeholders like $1 and $2 prevent SQL injection and allow safe value binding.*/
      

    // Send extracted text
    res.status(201).json({
      message: "Resume uploaded successfully",
      skills,
      totalSkillsFound: skills.length
    });

    /*After parsing the resume PDF,
    I implemented a lightweight NLP-style skill extraction system using keyword matching, making the system explainable and fast*/

  } catch (error) {
    next(error);
  }
};

/*For resume uploads, added idempotency by hashing the resume content to prevent duplicate storage*/


export const matchResumeWithJD = async (req, res) => {   //to match resume skills with uploaded jd skills
    try {
      const userId = req.user.userId;
      const { jobDescription, role } = req.body;
  
      if (!jobDescription || !role) {
        const err = new Error("Job description and role are required");
        err.status = 400;
        throw err;
      }

      const result = await pool.query(
        "SELECT skills FROM resumes WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );

      if (result.rows.length === 0) {
        const err = new Error("No resume found. Please upload a resume first.");
        err.status = 404;
        throw err;
      }
      
      const resumeSkills = result.rows[0].skills;

      const jdSkills = extractJDSkills(jobDescription);
      if (jdSkills.length === 0) {
        const err = new Error("No relevant skills found in job description");
        err.status = 400;
        throw err;
      }

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

      res.status(201).json({
        role,
        matchPercentage: matchResult.matchPercentage,
        matchedSkills: matchResult.matchedSkills,
        missingSkills: matchResult.missingSkills
      });
    } catch (error) {
        next(error);
    }
};      


export const getMatchHistory = async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Fetch paginated data
      const result = await pool.query(
        `SELECT role, match_percentage, matched_skills, missing_skills, created_at
        FROM match_history
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,     //limit-> how many rows to return, offset->how many rows to skip.
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM match_history WHERE user_id = $1`,
        [userId]
      );
  
      res.json({
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        data: result.rows
      });

    } catch (error) {
      next(error);
      }
  };

 /*For history data, we implemented pagination using page and limit query parameters,
  optimized queries with LIMIT and OFFSET, and returned total record counts so consuming services could paginate efficiently.*/ 
  
  
  


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

  
