const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate(name) {
      if (!name) {
        throw new Error("Name cannot be empty");
      }
    },
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate(username) {
      if (username.length < 6) {
        throw new Error("Username should be atleast 6 characters");
      }
    },
  },

  password: {
    type: String,
    required: true,
    trim: true,
    validate(password) {
      if (password.length < 6) {
        throw new Error("Password should be atleast 6 characters");
      }
    },
  },

  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
    validate(mail) {
      if (!validator.default.isEmail(mail)) {
        throw new Error("Invalid email address");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(age) {
      if (age < 0) {
        throw new Error("Age cannot be negetive");
      }
    },
  },
  location: {
    type: String,
    required: true,
    trim: true,
    validate(loc) {
      if (!loc) {
        throw new Error("location cannot be empty");
      }
    },
  },
});

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified()) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
