import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user
  });
});

export default router;

/*A user registers once, logs in to receive a JWT, and sends that JWT in the Authorization header to access protected APIs.
The server verifies the token using middleware before allowing access*/