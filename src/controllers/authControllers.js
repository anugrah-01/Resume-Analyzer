import jwt from "jsonwebtoken";   //Imports JWT library-Used to generate authentication tokens 
import bcrypt from "bcrypt";      //Used to hash passwords
import pool from "../config/db.js";

export const register = async (req, res) => {    //async because DB and bcrypt operations are asynchronous
    try {
        const{email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({ message: "Email and password required" });
        }

        const userExists = await pool.query(
            "Select * from users where email = $1", [email]     //$1 = parameterized query-Prevents SQL injection
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Save user
        await pool.query(
          "INSERT INTO users (email, password) VALUES ($1, $2)",
          [email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });  

    } catch (error) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }  
};

export const login = async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Find user
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1", [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = result.rows[0];

      // 2. Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // 3. Generate JWT - Identifies user in future requests
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ token });

    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
};


/*LOGIN FLOW
──────────
Client → email/password → Server → JWT → Client

REQUEST FLOW
────────────
Client → JWT → Server → ALLOW / DENY*/
