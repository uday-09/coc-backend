const express = require("express");
require("./src/db/dbConn");
const cors = require("cors");
const env = require("dotenv").config();
const userRouter = require("./src/routes/userRoute");
const postsRouter = require("./src/routes/postsRouter");
const commentsRouter = require("./src/routes/commentsRoutes");
const adminRouter = require("./src/routes/adminRouters");
const commonRouter = require("./src/routes/commonRoutes");
const User = require("./src/models/user");
const router = express.Router();
// const multer = require("multer");
// const upload = multer();
const PORT = process.env.PORT || 3500;

const app = express();

// app.use(upload.array());
app.use(cors({ origin: true }));
app.use(express.json());
app.use(userRouter);
router.get("/",(req,res)=>{
  res.send("Hellooooooo");
})
app.use(router);
app.use(postsRouter);
app.use(commentsRouter);
app.use(adminRouter);
app.use(commonRouter);
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
