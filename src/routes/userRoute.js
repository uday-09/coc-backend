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
    const token = await resUser.genAuthKey();
    res.status(201).send({ resUser, token });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.genAuthKey();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

router.patch("/user/update/:id", async (req, res) => {
  try {
    const allowedUpdates = [
      "username",
      "password",
      "location",
      "age",
      "email",
      "name",
    ];
    const updates = Object.keys(req.body);
    const validUpdate = updates.every((update) => {
      return allowedUpdates.includes(update);
    });

    if (!validUpdate) {
      return res.status(400).send({
        success: false,
        message: "Attempting to update invalid fields",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "No user found with id",
      });
    }

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    if (req.body?.username) {
      //check if user is trying to update username with existing username
      const updateUsername = req.body.username;

      const existnigUser = await User.findOne({ username: updateUsername });
      if (existnigUser && user._id.toString() !== existnigUser._id.toString()) {
        return res
          .status(409)
          .send({ message: "Username already taken", success: false });
      }
    }

    const result = await user.save();
    res.send({
      success: false,
      message: "succesfully",
      user_details: result,
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ success: false, message: "Something went wrong", error: err });
  }
});

module.exports = router;
