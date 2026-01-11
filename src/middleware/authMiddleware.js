import jwt from "jsonwebtoken";
const authMiddleware = (req, res, next) => {
    try {
        // 1. Read Authorization header
        const authHeader = req.headers.authorization;
    
        // 2. Check if header exists
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        } 
    
        // 3. Extract token (Bearer <token>)
        const token = authHeader.split(" ")[1];
        if(!token){
            return res.status(401).json({ message: "Token missing" });
        }
    
        // 4. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        // 5. Attach user info to request
        req.user = decoded;
    
        // 6. Move to next middleware / controller, moves request forward
        next();
    
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;


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
