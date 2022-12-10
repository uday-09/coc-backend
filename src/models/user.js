const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
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

  bio: {
    type: String,
    required: true,
    trim: true,
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
  profilePic: {
    type: String,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.virtual("posts", {
  ref: "Post",
  foreignField: "postedBy",
  localField: "_id",
});

//This function will be called by mongoose before sending data which is intended to change the document to json
//We are using that function to customize our data to not to send password and token info.

userSchema.methods.toJSON = function () {
  const user = this;
  const public = user.toObject();
  delete public.password;
  delete public.tokens;
  return public;
};

userSchema.methods.genAuthKey = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "cocsecrete");
  user.tokens = [...user.tokens, { token }];
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid username or password");
  }
  const verify = await bcrypt.compare(password, user.password);
  if (!verify) {
    throw new Error("Invalid username or password");
  }
  return user;
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    console.log("comes here to check");
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
