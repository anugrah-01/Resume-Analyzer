import jwt from "jsonwebtoken";   //Imports JWT library-Used to generate authentication tokens 
import bcrypt from "bcrypt";      //Used to hash passwords
import pool from "../config/db.js";

export const register = async (req, res, next) => {    //async because DB and bcrypt operations are asynchronous
    try {
        const{email, password} = req.body;

        if(!email || !password){
          const err = new Error("Email and password are required");
          err.status = 400;
          throw err;
        }

        const userExists = await pool.query(
            "Select * from users where email = $1", [email]     //$1 = parameterized query-Prevents SQL injection
        );

        if (userExists.rows.length > 0) {
          const err = new Error("User already exists");
          err.status = 409;
          throw err;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save user
        await pool.query(
          "INSERT INTO users (email, password) VALUES ($1, $2)",
          [email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });  

    } catch (error) {
        next(error);
    }  
};

export const login = async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const err = new Error("Email and password are required");
        err.status = 400;
        throw err;
      }

      // 1. Find user
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1", [email]
      );

      if (result.rows.length === 0) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;
      }

      const user = result.rows[0];

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        const err = new Error("Invalid credentials");
        err.status = 401;
        throw err;  
      }

      // 3. Generate JWT - Identifies user in future requests
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });

    } catch (err) {
      next(error);
    }
};


/*LOGIN FLOW
──────────
Client → email/password → Server → JWT → Client

REQUEST FLOW
────────────
Client → JWT → Server → ALLOW / DENY*/
