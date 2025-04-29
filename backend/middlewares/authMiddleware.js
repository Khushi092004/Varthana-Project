const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const authMiddleware = async (req, res, next) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });

    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await User.findOne({ customerId: decoded.customerId ,jwt_token: token });
    if (!user) return res.status(403).json({ error: "Invalid token or user not found" });

    req.user = { customerId: user.customerId };
    next();
  }catch(error){
    console.error("AuthMiddleware Error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  
  
};

module.exports = authMiddleware;
