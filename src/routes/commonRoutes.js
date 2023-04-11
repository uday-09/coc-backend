const express = require("express");
const authUser = require("../middleware/authUser");
const Post = require("../models/post");
const router = express.Router();
const User = require("../models/user");
const multer = require("multer");

router.get("/common/rejected", async (req, res) => {
  return res.send({ message: "success", success: true });
});

const upload = multer({
  dest: "posts",
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.endsWith(".mp4") &&
      !file.originalname.endsWith(".mkv")
    ) {
      return cb(new Error("Only MP4 files are allowed"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/post/video",
  upload.single("upload"),
  async (req, res) => {
    res.send();
  },
  (err, req, res, next) => {
    res.status(500).send({ error: err.message });
  }
);

module.exports = router;
