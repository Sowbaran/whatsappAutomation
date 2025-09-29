const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header or cookie
    let token = null;
    const authHeader = req.headers["authorization"];
    if (authHeader) {
      token = authHeader.split(" ")[1]; // remove "Bearer"
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Attach user data to request
    req.user = decoded;

    // Continue to next middleware / controller
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authMiddleware;
