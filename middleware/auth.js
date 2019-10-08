const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check the token is not valid
  if (!token) {
    return res.status(401).json({ msg: "Token is invalid, authorization denied" });
  }

  // Verify Token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

// After all this is done. We need to implement
// all these into
// our protected route. We will implement this logic  in our
// auth.js route located inside routes/api folders.
// The reason for JWT ? -> users able to log in easily the next time they revisit our website.
