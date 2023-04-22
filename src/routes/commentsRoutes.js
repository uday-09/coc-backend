const Comments = require("../models/comments");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/user");
const authUser = require("../middleware/authUser");

//-----------------Posting comments-------------------

router.post("/add-comment/:postId", authUser, async (req, res) => {
  const postId = req.params.postId;
  const { comment } = req.body;

  if (!comment) {
    return res
      .status(400)
      .send({ message: "Comment is required", success: false });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .send({ success: false, message: "Post not found" });
    }
    const commentDoc = new Comments({
      comment,
      postedBy: req.user._id,
      postId,
    });
    const result = await commentDoc.save();
    res.send({
      ...result.toObject(),
      message: "Comment added successfully",
      success: true,
    });
  } catch (err) {
    return res.status(400).send({ success: false, message: err.message });
  }
});

router.get("/comments/post/:postId", authUser, async (req, res) => {
  const postId = req.params.postId;
  const { limit = 10, skip = 0 } = req.query;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .send({ success: false, message: "Post not found" });
    }
    const commentCount = await Comments.find({ postId }).count();

    const comments = await Comments.find({
      postId,
    })
      .limit(limit)
      .skip(skip);

    const resultArray = [];
    /*----fethching comments and username ------ */
    await Promise.all(
      comments.map(async (eachComment) => {
        const mappedComment = await User.findById(eachComment?.postedBy);
        resultArray.push({
          ...eachComment.toObject(),
          username: mappedComment?.username,
          profilePic: mappedComment?.profilePic,
        });
      })
    );

    return res.send({
      message: "Success fetched comments",
      success: true,
      comments: resultArray,
      totalCount: commentCount,
      commentsCount: resultArray.length,
    });
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

module.exports = router;
