const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const exercisesRouter = require("./routes/tasklists");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");

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
const cookieKey = process.env.SESSION_KEY;
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
  // directly looking at session.id since thats set by
  // session buuuuut deleting the cookie by name
  if (req.cookies)
    if (req.cookies.connect.sid && !req.session.user) res.clearCookie("connect.sid");
  next();
});

// redirect to login when session not set
// and not trying to access the home page "/"
const nonHomeRedirect = (req, res, next) => {
  if (req.session.user && req.cookies.sessionID) {
    next();
  } else {
    res.redirect("/login");
  }
};

mongoose.connect(uri, mongooseConnectionOptions);

const connection = mongoose.connection;
connection.once("open", () => {
  console.log("mongo db database connection established successfully");
});

app.use("/api/tasklist", exercisesRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get(
  ["/join", "/tasklist/create", "/tasklist/edit/:id"], 
  nonHomeRedirect,
  (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
  }
);

app.get(["/", "/login"], (_req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build", "index.html"));
});

app.listen(port, () => {
  console.log("server is running on port " + port);
});
