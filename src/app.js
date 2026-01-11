import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import resumeRoutes from "./routes/resume/resumeRoutes.js";

const app = express();     //Creates backend application instance
app.use(cors());
app.use(express.json());   //Allows backend to read JSON from requests(required for APIs)

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/resume", resumeRoutes);



export default app;


/*Client (Postman)
      |
      v
POST /auth/register
      |
      v
Express App
      |
      v
Auth Router
      |
      v
register() controller
      |
      v
DB + bcrypt + JWT*/