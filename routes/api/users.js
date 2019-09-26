const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

// @route  POST  api/users
// @desc   Register route
// @access Public
// Why access = public ??,
//   1st: because users profile need to be authenticated
//2nd: You need a token to access a route, it needs to be authenticated

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
  (req, res) => {
    const error = validationResult(req);
    // If the inputted result is not empty, but has errors then
    // This part is handling the response
    // If users do not send the information correctly then it is a bad request
    // We need to include a message that says so.
    // console.log(req.body);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() });
    }
    res.send("User Route");
  }
);
module.exports = router;
