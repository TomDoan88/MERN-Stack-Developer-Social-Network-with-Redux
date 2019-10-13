const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");

const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route  POST api/ Posts
// @desc   Create a post
// @access PRIVATE because you need to be logged in to post

router.post(
  "/",
  [
    auth,
    [
      check("text", "Comment and text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ error: error.array() }); // json return error object
    }

    try {
      // User logged in, we have the JWT which gives us UserID
      // that attach to request.userID = no need for req.parrams.id
      // const user = User.findById(req.user.id).select("-password");
      // Creating a new post
      const user = await User.findById(req.user.id).select("-password");
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: request.user.id
      });
      // Save data
      // response with json data
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sever Errorr");
    }
  }
);
module.exports = router;
