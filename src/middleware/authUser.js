const User = require("../models/user");
const jwt = require("jsonwebtoken");

const authUser = async (req, res, next) => {
  const bearerToken = req.headers?.authorization;
  if (!bearerToken) {
    return res.status(401).send({
      success: false,
      message: "Please authenticate or provide token",
    });
  }

  try {
    const token = bearerToken.replace("Bearer ", "");
    const verify = jwt.verify(token, "cocsecrete");

    const user = await User.findOne({ _id: verify._id, "tokens.token": token });

    if (!user) {
      return res
        .status(401)
        .send({ success: false, message: "Unauthorized User" });
    }

    req.user = user;
    req.token = token;
    next(); // to indicate the we are done with middleware
  } catch (err) {
    res.status(401).status({
      success: false,
      message: "Something went wrong with authentication",
    });
  }
};

module.exports = authUser;
