import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error("Authorization header missing");
      err.status = 401;
      throw err;
    }

    // Ensure Bearer format
    if (!authHeader.startsWith("Bearer ")) {
      const err = new Error("Invalid authorization format");
      err.status = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      const err = new Error("Token missing");
      err.status = 401;
      throw err;
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach only required fields (security best practice)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    error.status = error.status || 401;
    next(error); // forward to central error handler
  }
};

export default authMiddleware;

/*Authentication is handled using JWT middleware. The token is validated from the Authorization header,
 decoded user information is attached to the request, and errors are forwarded
to a centralized error handler to keep responses consistent*/



/*Client ──▶ Middleware ──▶ Controller ──▶ DB
            (JWT check)
Only authenticated users pass*/

/*What this middleware must do

For every protected request:
Read Authorization header
Extract token
Verify token
Get user info from token
Attach user info to request
Call next()
If ANY step fails → reject request.*/
