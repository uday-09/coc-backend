const mongoose = require("mongoose");

const CommentsModel = mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Comments = mongoose.model("Comments", CommentsModel);

module.exports = Comments;
