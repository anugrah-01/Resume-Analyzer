import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth/authRoutes.js";
import protectedRoutes from "./routes/protectedRoutes.js";
import resumeRoutes from "./routes/resume/resumeRoutes.js";

const app = express();     //Creates backend application instance
app.use(cors());
app.use(express.json());   //Allows backend to read JSON from requests(required for APIs)

app.use((req, res, next) => {    //added request-level logging to measure API latency and help debug production issues.
      const start = Date.now();
      res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
          `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`
        );
      });
      next();
});

app.use("/auth", authRoutes);
app.use("/protected", protectedRoutes);
app.use("/resume", resumeRoutes);

app.use((req, res) => {
      res.status(404).json({error: "Route not Found"});
});

app.use((err, req, res, next) => {    //error handling middleware
      console.error("Error:", err.message);
      res.status(err.status || 500).json({
            error: err.message || "Internal Server Error",
      });
});



export default app;

//centralized error handling to avoid duplicated try-catch logic and to standardize API error responses
/*added global request logging, a fallback 404 handler, and a centralized error-handling
 middleware in the Express app. This ensured consistent API responses, improved debuggability,
and made the service production-ready without impacting business logic.*/


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