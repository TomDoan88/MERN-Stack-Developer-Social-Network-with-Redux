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
        user: req.user.id
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

// @route  GET api/ Posts
// @desc   GET all Post
// @access PRIVATE, you need to be logged in to see POST

// Private will need auth
// No need for validation as there are no inputs
// router.get

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route  GET api/ PostID
// @desc   GET single POSTID
// @access PRIVATE

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(500).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    // We want to let users know whether this is server error
    // or post just does not exist.
    //
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route  DELETE api/post/:id
// @desc   Delete a post
// @access PRIVATE

router.delete("/:id", auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    // If post does not exist
    if (!posts) {
      return res.status(404).json({ msg: " Post not found " });
    }
    // We want to make sure the user deleting the post is user that owns the post
    // NOTE:  posts.user gives us postId associated with a user
    // toString() to make sure both post.user match the req.user.id in strong format
    if (posts.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await posts.remove();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(400).json({ msg: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
});

// @route  PUT  api/post/like/:id
// @desc   Like a post
// @access PRIVATE

router.put("/like/:id", auth, async (req, res) => {
  try {
    // Find the ID of the post request
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked
    // Compare current iteration to user currently logged in
    // Need to match the user data to req.user.id hence toString
    // length > 0 means it has already been liked.

    // In the Post Database schema we chose likes key with the array so
    // we can iterate through it.

    // NOTE: MISTAKE TO WATCH OUT FOR

    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: "You already liked this post" });
    }

    // pop the user into the array
    post.likes.unshift({ user: req.user.id });
    await post.save();

    // Useful for REDUX later
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sever Error");
  }
});

module.exports = router;
