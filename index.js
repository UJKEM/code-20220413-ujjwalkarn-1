const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");

const home = require("./route/api/home");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", home);

const port = process.env.PORT || 3000;

app.listen(port, (err) => {
  if (err) {
    throw new Error(err);
  }
  console.log(`Started listening to the port ${port}`);
});

module.exports = app;
