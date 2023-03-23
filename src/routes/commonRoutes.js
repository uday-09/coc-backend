const {
  SourceSelectionCriteriaFilterSensitiveLog,
} = require("@aws-sdk/client-s3");
const express = require("express");
const authUser = require("../middleware/authUser");
const Post = require("../models/post");
const router = express.Router();
const User = require("../models/user");

router.get("/common/rejected", async (req, res) => {
  return res.send({ message: "success", success: true });
});

module.exports = router;
