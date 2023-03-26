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
    const { title, description, location, tags, imageUri } = req.body;
    const post = new Post({
      title,
      description,
      location,
      tags,
      postedBy: uploaderUserId,
      imageUri,
    });
    try {
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

//>>>>>>>>>>>>>>>>>>>>>> Get single post <<<<<<<<<<<<<<<<<<<<

router.get("/coc/get/post/:id", authUser, async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .send({ sucess: false, message: "Requested post not found" });
    }
    res.status(200).send({
      ...post.toObject(),
      message: "Succefully fetched post",
      success: true,
    });
  } catch (err) {
    res.status(400).send({ err, message: "Failed to fetch", success: false });
  }
});

// >>>>>>>>>>>>>>>>>>>>> Get Feed posts <<<<<<<<<<<<<<<<<<<<<<

router.get("/feed/posts", authUser, async (req, res) => {
  const currentUser = req.user;
  const userId = currentUser._id;
  const feedPosts = [];

  try {
    // const feed = await Post.find({ postedBy: { $ne: userId } }).sort({
    //   date: "desc",
    // });

    const feed = await Post.find();
    await Promise.all(
      feed.map(async (post) => {
        const postedBy = await User.findOne({ _id: post.postedBy });
        feedPosts.push({ ...post.toObject(), username: postedBy.username });
      })
    );

    // feedPosts.sort(function (a, b) {
    //   return new Date(b.date) - new Date(a.date);
    // });

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
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    res.send({ deletedPost });
  } catch (err) {
    return res.status(400).send({ message: err.message, success: false });
  }
});

// >>>>>>>>>>>>>>>>> Image POSTING <<<<<<<<<<<<<<<<<<<<

router.post(
  "/post/crime/picture",
  async (req, res) => {
    const uploadSingle = uploadImages("cop-on-cloud").single("image");
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message:
            err.message +
            "\nSomethig went wrong while connceting to AWS Services",
        });
      }

      res.status(200).json({ imageUri: req.file.location });
    });
  },
  (error, req, res, next) => {
    res.status(400).send({ success: false, message: error.message });
  }
);

// >>>>>>>>>>>>>>>>>>>>> VIEWING OTHERS POSTS<<<<<<<<<<<<<<<<<<<<

router.get("/user/details/posts/:id", authUser, async (req, res) => {
  const userId = req.params.id;
  try {
    const posts = await Post.find({ postedBy: userId });
    const user = await User.findOne({ _id: userId });
    if (posts.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "User have no posts to show" });
    }
    return res.send({ user, posts });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>>>> LIKING POSTS<<<<<<<<<<<<<<<<<<<<<<<<

router.patch("/post/like/:id", authUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).send({ message: "No posts found" });
    }
    if (!post?.likes) {
      post.likes = [req.user._id];
      await post.save();
      res.send({ likes: post.likes });
    }
    const likes = post.likes;
    const checkIfAlreadyLiked = post.likes.filter((likedId) => {
      return likedId.toString() === req.user._id.toString();
    });

    if (checkIfAlreadyLiked.length > 0) {
      return res.status(400).send({ message: "Already liked", success: false });
    }
    likes.push(req.user._id);
    post.likes = likes;
    await post.save();
    return res.send({ likes, message: "succesfully liked", success: true });
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

router.patch("/post/unlike/:id", authUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(400).send({ message: "No posts found" });
    }
    if (!post?.likes) {
      post.likes = [req.user._id];
      await post.save();
      res.send({ likes: post.likes });
    }

    const checkIfNotLiked = post.likes.filter((likedId) => {
      return likedId.toString() === req.user._id.toString();
    });

    if (checkIfNotLiked.length === 0) {
      return res.status(400).send({ message: "Not yet liked", success: false });
    }
    const filtered = post.likes.filter((likedId) => {
      return likedId.toString() !== req.user._id.toString();
    });
    post.likes = filtered || [];
    const posts = await post.save();
    return res.send({
      likes: posts.likes,
      message: "succesfully unliked",
      success: true,
    });
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

// >>>>>>>>>>>>>>>>>>>> Editing post <<<<<<<<<<<<<<<<<<<

router.patch("/post/update/:id", authUser, async (req, res) => {
  const id = req.params.id;
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(400).send({ message: "No post found", success: false });
    }

    const uploaderUserId = req.user._id;
    const { title, description, location, tags, imageUri } = req.body;
    const newPost = new Post({
      title,
      description,
      location,
      tags,
      postedBy: uploaderUserId,
      imageUri,
    });
    await newPost.save();
    await Post.findByIdAndDelete(id);
    return res.send({ success: true, message: "Post updated succesfully" });
  } catch (err) {
    res.status(400).send({ message: err.message, success: false });
  }
});

//>>>>>>>>>>>>>>> GET all posts <<<<<<<<<<<<<<<<<<<<<<

module.exports = router;
