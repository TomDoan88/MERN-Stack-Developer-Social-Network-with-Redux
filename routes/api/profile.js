const express = require("express");
const router = express.Router();

// @route  GET api/ Profile
// @desc   Test route
// @access Public
// Why access = public ??,
//   1st: because users profile need to be authenticated
//  2nd: You need a token to access a route, it needs to be
// authenticated

router.get("/", (req, res) => res.send("Profile Route"));
module.exports = router;
