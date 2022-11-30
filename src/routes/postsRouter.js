const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const authUser = require("../middleware/authUser");
const User = require("../models/user");
const uploadImages = require("../utils/uploadImages");

// >>>>>>>>>>>>>>>>>>>>>>> Create new post <<<<<<<<<<<<<<<<<<<<<<<

router.post(
  "/crime/post",
  authUser,
  async (req, res) => {
    const uploaderUserId = req.user._id;
    console.log(uploaderUserId);
    const { title, description, location, tags, imageUri } = req.body;
    console.log(imageUri);
    const post = new Post({
      title,
      description,
      location,
      tags,
      postedBy: uploaderUserId,
      imageUri,
    });

    try {
      console.log("Came long way here");
      await post.save();
      return res.send({ success: true, message: "Post created succesfully" });
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

// >>>>>>>>>>>>>>>>>>>>>> Get my posts <<<<<<<<<<<<<<<<<<<<<<<<<<<

router.get("/my/posts", authUser, async (req, res) => {
  const user = req.user;
  try {
    await user.populate("posts");
    const posts = user.posts;
    if (posts.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "You have no posts to show" });
    }
    res.send({ posts: user.posts });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>>>>> Get Feed posts <<<<<<<<<<<<<<<<<<<<<<

router.get("/feed/posts", authUser, async (req, res) => {
  const currentUser = req.user;
  const userId = currentUser._id;
  const feedPosts = [];

  try {
    const feed = await Post.find({ postedBy: { $ne: userId } });

    await Promise.all(
      feed.map(async (post) => {
        const postedBy = await User.findOne({ _id: post.postedBy });
        feedPosts.push({ ...post.toObject(), username: postedBy.username });
      })
    );

    res.send({ feedPosts });
  } catch (error) {
    res.status(400).send({ success: false, message: error.message });
  }
});

// >>>>>>>>>>>>>>>>>>>> Delete My Posts <<<<<<<<<<<<<<<<<<<<<<<

router.delete("/delete/mypost/:id", authUser, async (req, res) => {
  const user = req.user;
  const _id = req.params?.id;
  if (!_id) {
    return res
      .status(400)
      .send({ success: false, message: "Please provide post id" });
  }
  try {
    const post = await Post.findById(_id);
    if (!post) {
      return res
        .status(404)
        .send({ success: false, message: "No post found with id" });
    }
    const userId = req.user._id.toString();
    const ownerId = post.postedBy.toString();
    if (userId !== ownerId) {
      return res.status(401).send({
        success: false,
        message: "You are not authorized to delete this post.",
      });
    }
    const deletedPost = User.findByIdAndDelete(req.params.id);
    res.send({ deletedPost });
  } catch (err) {
    return res.status(400).send({ message: err.message, success: false });
  }
});

// >>>>>>>>>>>>>>>>> TRAIL POSTING <<<<<<<<<<<<<<<<<<<<

router.post(
  "/post/crime/picture",
  async (req, res) => {
    console.lo;
    const uploadSingle = uploadImages("cop-on-cloud").single("image");
    console.log("Hey there", req.body, req.file);
    console.log();
    uploadSingle(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({
          success: false,
          message:
            err.message +
            "\nSomethig went wrong while connceting to AWS Services",
        });
      }

      // await User.create({ photoUrls: req.file.location });
      console.log(req.file);

      res.status(200).json({ imageUri: req.file.location });
    });
  },
  (error, req, res, next) => {
    console.log(error);
    res.status(400).send({ success: false, message: error.message });
  }
);

module.exports = router;
