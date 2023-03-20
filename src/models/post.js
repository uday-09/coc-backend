const mongoose = require("mongoose");

const postModel = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
    },
    imageUri: {
      type: String,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
    },
    postStatus: {
      //Posts have three different statuses: 1) Accepted 2)Rejected 3)Pending
      type: String,
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postModel);

module.exports = Post;
