const mongoose = require("mongoose");

mongoose
  .connect("mongodb://127.0.0.1:27017/coc")
  .then(() => {
    console.log("Connected to db succesfully");
  })
  .catch((err) => {
    console.log("Something went wrong connecting to db", err);
  });
