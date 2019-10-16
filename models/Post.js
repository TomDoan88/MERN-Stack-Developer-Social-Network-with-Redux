const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// We want post to be connected to a user
// MUST reference to a user, pass in user Object
// Result = user connect to Posts
const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  text: {
    type: String,
    required: true
  },
  name: {
    type: String
  },

  avatar: {
    type: String
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      }
    }
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "user"
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        // This date is for the user post submite date
        type: Date,
        default: Date.now
      }
    }
  ],
  // This date is for the post itself
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = new mongoose.model("post", PostSchema);
