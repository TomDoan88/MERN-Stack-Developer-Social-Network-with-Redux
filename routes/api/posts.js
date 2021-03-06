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
    // toString() to make sure both post.user match the req.user.id in string format
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

    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(400).json({ msg: "You already liked this post" });
    }

    // pop the user into the array
    post.likes.unshift({ user: req.user.id });
    await post.save();

    // Useful for REDUX later, keep an eye on this
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sever Error");
  }
});

// @route  DELETE api/post/unlike/:id
// @desc   Unlike a post
// @access PRIVATE

router.put("/unlike/:id", auth, async (req, res) => {
  try {
    // Find the ID of the post request
    const post = await Post.findById(req.params.id);

    // length === 0 = we have not liked yet
    // Therefore can unlike untill we hit counter 0
    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({ msg: " No like on this post yet" });
    }

    // Getting the correct like to remove
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    await post.save();
    // Useful for REDUX later, keep an eye on this
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Sever Error");
  }
});

// @route  POST  api/post/comment
// @desc   Comment on a post
// @access Private

router.post(
  "/comment/:id",
  [
    auth,
    [
      check("text", "text is required")
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

      // Why req.params.id ? params will be hit by the id via URL hence the params
      const post = await Post.findById(req.params.id);

      // newComment !=== new Post() instantiate because
      // We are not generating new Post...
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      // Adding new comments Objectinto the comments array
      post.comments.unshift(newComment);

      // Save data
      // response with json data
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Sever Errorr");
    }
  }
);

// @route  DELETE api/posts/comments/:id/:comment_id
// @desc   Delete comment
// @access Private

// IMPORTANT: We need to find post ID and which comment to delete
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    // Check comment belong to what user ?

    // Check which post is being targeted with what comment
    // Run a forEach loop through it ???

    const post = await Post.findById(req.params.id);

    // Get the comment from the post with array find method.
    // That comment should be === to :comment_id request
    // Make sure comment exist. if not return status 404 comment does not exist
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);
    if (!comment) {
      res.status(404).json({ msg: "Comment does not exist" });
    }

    // Check user the same as request user id
    // If not return status 401
    if (comment.user.toString() !== req.user.id) {
      res.status(401).json({ msg: " User not authorized" });
    }

    // remove the index with the splice method
    // Make sure the user matches the request.user.id by converting it to string
    const removeCommentIndex = post.comments.map(comment => comment.user.toString());

    post.comments.splice(removeCommentIndex, 1);

    await post.save();

    // Save comments
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
