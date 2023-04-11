const mongoose = require("mongoose");

const User = require("../models/user");
const express = require("express");

const router = express.Router();
const authUser = require("../middleware/authUser");
const bcrypt = require("bcryptjs");

// >>>>>>>>>>>>>>>>>>>>>>>>>> MY PROFILE <<<<<<<<<<<<<<<<<<<<<<<<

router.get("/user/me", authUser, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>>>>> USER REGISTRATION <<<<<<<<<<<<<<<<<<<<<<<<<<<<

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
    res.status(400).send({ message: err.message, success: false });
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>> UPDATE USER <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.patch("/user/update/me", authUser, async (req, res) => {
  try {
    const allowedUpdates = [
      "username",
      "password",
      "location",
      "age",
      "email",
      "name",
      "profilePic",
      "bio",
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

    const user = req.user;

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
      success: true,
      message: "succesfully updated",
      user_details: result,
    });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>>> USER LOGIN <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await user.genAuthKey();
    res.send({ user, token });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>>>>>>>  USER LOGOUT <<<<<<<<<<<<<<<<<<<<<<<<<<<<

router.get("/user/logout", authUser, async (req, res) => {
  try {
    const user = req.user;
    const token = req.token;
    const tokens = user.tokens;

    //Remove the token that we authenticated the user with
    const filteredTokens = tokens.filter((iToken) => {
      return iToken.token != token; // iToken indicates the individual token;
    });

    user.tokens = filteredTokens;
    await user.save();
    res.status(200).send({ success: true, message: "logged out" });
  } catch (err) {
    res.status(400).send({ success: false, message: err.message });
  }
});

// >>>>>>>>>>>>>>>>>> Change My password <<<<<<<<<<<<<<<

router.patch("/change/my-password", authUser, async (req, res) => {
  try {
    const user = req.user;
    const { password, newPassword } = req.body;
    if (!password || !newPassword) {
      return res.status(400).send({
        message: "Please provide old and new passwords",
        success: false,
      });
    }
    const verifyOldPassword = await bcrypt.compare(password, user.password);
    if (!verifyOldPassword) {
      return res.status(400).send({
        message: "Please enter correct password!",
        success: false,
      });
    }
    user.password = newPassword;
    await user.save();
    res.send({ message: "Succesfully updated password!", success: true });
  } catch (err) {
    res.status(400).send({ message: "Failed to update password! Try again!" });
  }
});

//>>>>>>>>>>>>>>>>>>>>>> Get user info based on id <<<<<<<<<<<<<<<<<<<<

router.get("/user/:userId", authUser, async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    res.send({ user, message: "User information fetched", success: false });
  } catch (err) {
    return res.status(500).send({ message: err.message, success: false });
  }
});

module.exports = router;
