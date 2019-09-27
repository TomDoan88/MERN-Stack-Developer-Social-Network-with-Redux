const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

// @route  POST  api/users
// @desc   Register route
// @access Public
// Why access = public ??,
//   1st: because users profile need to be authenticated
//2nd: You need a token to access a route, it needs to be authenticated

// LOGICS AND CODE IN THIS SECTION
// Creating users and validation
// Each users have an avatar
// Encrypt the password.

router.post(
  "/",
  // Checking for all the validation
  [
    check("name", "Name is required")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Please include a password").isLength({ min: 6 })
  ],
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
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        res.status(400).json({ error: [{ msg: "User already exists" }] });
      }

      // GETTING AVATARS FOR USERS
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      res.send("User Registered");
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);
module.exports = router;
