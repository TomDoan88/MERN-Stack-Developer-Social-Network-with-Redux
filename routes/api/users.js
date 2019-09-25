const express = require("express");
const router = express.Router();

// @route  POST  api/users
// @desc   Register route
// @access Public
// Why access = public ??,
//   1st: because users profile need to be authenticated
//2nd: You need a token to access a route, it needs to be authenticated

router.post("/", (req, res) => {
  console.log(req.body);
  res.send("User Route");
});
module.exports = router;
