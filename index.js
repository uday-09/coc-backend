const express = require("express");
require("./src/db/dbConn");
const userRouter = require("./src/routes/userRoute");
const cors = require("cors");

const PORT = process.env.PORT || 3500;

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
