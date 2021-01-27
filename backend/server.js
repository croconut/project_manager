const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const tasklistRouter = require("./routes/tasklists");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
let uri = "";
if (process.env.NODE_ENV === "development") {
  console.log("in development mode...");
  uri = process.env.ATLAS_URI_DEV;
} else if (process.env.NODE_ENV === "production") {
  console.log("in production mode...");
  uri = process.env.ATLAS_URI;
} else {
  console.log("testing mode");
  uri = process.env.ATLAS_URI_TEST;
}
const cookieSecret = process.env.SESSION_SECRET;

const sessionStoreOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const mongooseConnectionOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

app.use(cors());
app.use(helmet());
app.use(express.json());

let store = new MongoDBStore(
  {
    uri: uri,
    collection: "sessions",
    connectionOptions: sessionStoreOptions,
  },
  (err) => {
    if (err) console.error("store connection error: " + err);
  }
);

store.on("error", (err) => console.error("store error: " + err));

app.use(
  session({
    //using default name connect.sid rn
    key: "project-manager-c",
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false,
    // one week in ms
    cookie: { maxAge: 604800000 },
    store: store,
  })
);

app.use((req, res, next) => {
  // no user but have cookie id for some reason?
  if (req.session)
    if (req.session.cookie && (!req.session.user || !req.session.user._id))
      res.clearCookie("project-manager-c");
  next();
});

// redirect to login when session not set
// and not trying to access the home page "/"
const nonHomeRedirect = (req, res, next) => {
  if (req.session.user && req.session.user._id) {
    console.log("allowed");
    next();
  } else {
    res.redirect("/login");
  }
};

const loginRedirect = (req, res, next) => {
  if (!req.session.user || !req.session.user._id) res.redirect("/");
  else next();
};

mongoose.connect(uri, mongooseConnectionOptions);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("mongo db database connection established successfully");
});

app.use("/api/tasklist", nonHomeRedirect, tasklistRouter);
app.use("/api/users", nonHomeRedirect, usersRouter);
app.use("/api/register", registerRouter);
app.use("/api/login", loginRouter);
// gotta be logged in to bother logging out
app.use("/api/logout", loginRedirect, logoutRouter);

app.use(express.static(path.join(__dirname, "../frontend/build")));

// react routes only for logged in users
app.get(
  ["/tasklist/create", "/tasklist/edit/:id", "/logout"],
  nonHomeRedirect,
  (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  }
);

// react routes always available
// will eventually include static pages like about us and contact me
app.get("/", (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

// react routes only for people who aren't logged in
app.get(["/login", "/join"], loginRedirect, (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log("server is running on port " + port);
});
