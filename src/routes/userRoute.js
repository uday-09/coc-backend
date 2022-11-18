const mongoose = require("mongoose");

const User = require("../models/user");
const express = require("express");

const router = express.Router();

router.post("/user", async (req, res) => {
  try {
    const user = new User(req.body);
    const duplicateUserName = await User.findOne({
      username: req.body.username,
    });
    if (duplicateUserName) {
      return res.status(400).send({ message: "Username has already taken" });
    }
    const resUser = await user.save();
    res.status(201).send(resUser);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = router;
