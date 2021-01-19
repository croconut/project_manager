const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const exercisesRouter = require("./routes/exercises");
const usersRouter = require("./routes/users");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("mongo db database connection established successfully");
});

app.use("/api/exercises", exercisesRouter);
app.use("/api/users", usersRouter);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(["/", "/join", "/exercise/create", "/exercise/edit/:id"], (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log("server is running on port " + port);
});
