const express = require("express");
require("./src/db/dbConn");
const userRouter = require("./src/routes/userRoute");
const postsRouter = require("./src/routes/postsRouter");
const cors = require("cors");
const User = require("./src/models/user");

const PORT = process.env.PORT || 3500;

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(userRouter);
app.use(postsRouter);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

// const getMyPosts = async () => {
//   const user = await User.findById("6379f94c0e77fae28e5d54bc");
//   console.log(user);
//   await user.populate("posts");
//   console.log(user.posts);
// };

// getMyPosts();
