const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const authUser = require("../middleware/authUser");
const User = require("../models/user");

// >>>>>>>>>>>>>>>>>>>>>>> Create new post <<<<<<<<<<<<<<<<<<<<<<<

router.post(
  "/crime/post",
  authUser, // First authenticate the uploafing user;
  async (req, res) => {
    const uploaderUserId = req.user._id;
    console.log(uploaderUserId);
    const { title, description, location, tags } = req.body;

    const post = new Post({
      title,
      description,
      location,
      tags,
      postedBy: uploaderUserId,
    });

    try {
      await post.save();
      res.send({ success: true, message: "Post created succesfully" });
    } catch (err) {
      res.status(400).send({
        sucess: false,
        message: err.message,
      });
    }
  },
  (error, req, res, next) => {
    res.send({ success: false, message: error.message });
  }
);

router.get("/my/posts", authUser, async (req, res) => {
  const user = req.user;
  try {
    await user.populate("posts");
    res.send({ posts: user.posts });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

module.exports = router;
