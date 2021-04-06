// normal setup and
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

const log = require("./utils/logcolors");

require("dotenv").config();

const app = express();

if (!process.env.SESSION_KEY || process.env.SESSION_KEY === "") {
  log.red("the session key was not set");
}

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(express.json());

module.exports = app;
