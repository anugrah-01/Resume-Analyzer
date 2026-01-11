import express from "express";     //Express gives us: Router, HTTP methods (get, post, etc.)
import { register, login } from "../../controllers/authControllers.js";

const router = express.Router();

router.post("/register", register);     ///mapping URL to functions
router.post("/login", login);        

export default router;


//When a request comes to /auth/register, call the register function.
//When a request comes to /auth/login, call the login function.

//use Express Router to define route-to-controller mappings. 
//The router keeps endpoint definitions separate from business logic, which improves maintainability and scalability
