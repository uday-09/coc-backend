const express = require("express");
const authUser = require("../middleware/authUser");
const Post = require("../models/post");
const router = express.Router();
const User = require("../models/user");

const POST_STATUS = {
  ACCEPTED: "accepted",
  REJECTED: "rejected",
  PENDING: "pending",
};

/*----------------Required routers------------------ */
// Need to send statistics
// Need to send Pending posts
// Need to send Rejected Posts
// Need to send All posts
// Change password and details
// Send mails

router.get("/admin/stats", authUser, async (req, res) => {
  try {
    console.log(req.user);

    /*------------Make sure to fix this------------- */

    // if (req.user?.userType === "user") {
    //   return res.status(404).send({
    //     message: "You are not authorised to use this",
    //     success: false,
    //   });
    // }

    const acceptedPostCount = await Post.find({
      postStatus: "accepted",
    }).count();
    const rejectedPostsCount = await Post.find({
      postStatus: "rejected",
    }).count();
    const pendingPostsCount = await Post.find({
      postStatus: "pending",
    }).count();
    const allPostsCount = await Post.find().count();
    res.send({
      message: "Succesfully fetched stats",
      stats: {
        allPostsCount,
        acceptedPostCount,
        rejectedPostsCount,
        pendingPostsCount,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message, success: false });
  }
});

router.patch("/admin/update-status/:postId", authUser, async (req, res) => {
  try {
    const postId = req.params.postId;

    let status = POST_STATUS.PENDING;

    if (req.body?.status) {
      if (req.body.status === POST_STATUS.ACCEPTED) {
        status = POST_STATUS.ACCEPTED;
      } else if (req.body.status === POST_STATUS.REJECTED) {
        status = POST_STATUS.REJECTED;
      }
    }

    // if (req.user?.userType === "user") {
    //   return res.status(404).send({
    //     message: "You are not authorised to use this",
    //     success: false,
    //   });
    // }

    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(400)
        .send({ message: "Requested post not found!", success: false });
    }

    //We need change post status
    post.postStatus = status;
    await post.save();
    return res
      .status(200)
      .send({ message: `Post status update to ${status}`, success: true });
  } catch (err) {
    return res.send({ message: err.message, success: false });
  }
});

//----------------get post based on status---------------
router.get("/admin/post/status", authUser, async (req, res) => {
  let { status } = req.query;
  try {
    let feed = null;
    // Handle case when no status sent
    if (!status) {
      feed = await Post.find();
    } else {
      feed = await Post.find({ postStatus: status });
    }
    const feedPosts = [];
    await Promise.all(
      feed.map(async (post) => {
        const postedBy = await User.findOne({ _id: post.postedBy });
        feedPosts.push({
          ...post.toObject(),
          postedUserInfo: {
            username: postedBy.username,
            email: postedBy.email,
            profilePic: postedBy.profilePic,
            location: postedBy.location,
          },
        });
      })
    );
    return res.status(200).send({
      posts: feedPosts,
      message: "fetched posts successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).send({ message: err.message, success: false });
  }
});

module.exports = router;
