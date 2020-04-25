const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

// Why access = public ??,
//   1st: because users profile need to be authenticated
//2nd: You need a token to access a route, it needs to be authenticated

// LOGICS AND CODE IN THIS SECTION
// Creating users and validation
// Each users have an avatar
// Encrypt the password.

// @route  POST api/users
// @desc   REGISTER USER
// @access Public
router.post(
  "/",
  [
    // Name, Email, Passwords validations with check
    check("name", "Please enter your name"),
    check("email", "Please enter email").isEmail(),
    check("password", "Enter password with 6 or more character").isLength({ min: 6 })
  ],
  async (req, res) => {
    // Checking validation result from above
    // Reminder: req data is param in validation function
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    // Destructure data sent in req.body
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: [{ msg: "User already exists" }] });
        // array in json because we want to match errors.array above
      }

      //Getting avatar for user
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm"
      });

      // Create new instance of User
      user = new User({
        name,
        email,
        password,
        avatar
      });

      // Encrypt password then save to database
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      // res.send("User registered");

      // Initialize payload = data of the id user
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
