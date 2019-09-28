const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");

// @route  GET api/auth
// @desc   Test route
// @access Public
// Why access = public ??,
//   1st: because users profile need to be authenticated
//  2nd: You need a token to access a route, it needs to be
// authenticated and we will need to do it with jwt

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Something is wrong with the server");
  }
});

// @route  POST api/auth
// @desc   Authenticate user & get token
// @access Public
router.post(
  "/",
  // Checking for all the validation
  // Notice there is not need for name as this is log in / not registration anymore.
  [check("email", "Please include a valid email").isEmail(), check("password", "Password is required").exists()],
  async (req, res) => {
    const error = validationResult(req);
    // If the inputted result is not empty, but has errors then
    // This part is handling the response
    // If users do not send the information correctly then it is a bad request
    // We need to include a message that says so.
    // console.log(req.body);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: [{ msg: "Invalid Credentials" }] });
      }

      // We are comparing password from the database to what users
      // have inputted.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: [{ msg: "Invalid Credentials" }] });
      }
      // JSON WEBTOKENS
      const payload = {
        user: {
          id: user.id
        }
      };
      jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
