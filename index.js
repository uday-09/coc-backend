const express = require("express");
require("./src/db/dbConn");
const userRouter = require("./src/routes/userRoute");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
