const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");

const { RateLimiterMongo } = require("rate-limiter-flexible");

require("dotenv").config();

const tasklistRouter = require("./routes/tasklists");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const log = require("./utils/logcolors");

const ConnectDBs = async (app, uri, mongooseConnectionOptions, store) => {
  app.use(
    session({
      key: process.env.SESSION_KEY,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      // one week in ms
      cookie: { maxAge: 604800000 },
      store: store,
      unset: "destroy",
    })
  );

  // redirect to login when session not set
  // and not trying to access the home page "/"
  const nonHomeRedirect = (req, res, next) => {
    if (req.session.user && req.session.user._id) {
      next();
    } else {
      res.redirect("/login");
    }
  };

  const loginRedirect = (req, res, next) => {
    if (!req.session.user || !req.session.user._id) res.redirect("/");
    else next();
  };

  // you may not log in if you're already logged in
  const alreadyLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) res.redirect("/");
    else next();
  };

  app.use((req, res, next) => {
    // no user but have cookie id for some reason?
    if (
      req.session &&
      req.session.cookie &&
      (!req.session.user || !req.session.user._id)
    ) {
      res.clearCookie(process.env.SESSION_KEY);
    }
    next();
  });

  app.use("/api/tasklist", nonHomeRedirect, tasklistRouter);
  app.use("/api/users", nonHomeRedirect, usersRouter);
  app.use("/api/register", registerRouter);
  app.use("/api/login", alreadyLoggedIn, loginRouter);
  // gotta be logged in to bother logging out
  app.use("/api/logout", loginRedirect, logoutRouter);

  app.use(express.static(path.join(__dirname, "../build")));

  // react routes only for logged in users
  app.get(
    ["/tasklist/create", "/tasklist/edit/:id", "/logout"],
    nonHomeRedirect,
    (_req, res) => {
      res.sendFile(path.resolve(__dirname, "../build", "index.html"));
    }
  );

  // react routes always available
  // will eventually include static pages like about us and contact me
  app.get("/", (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../build", "index.html"));
  });

  // react routes only for people who aren't logged in
  app.get(["/login", "/join"], loginRedirect, (_req, res) => {
    res.sendFile(path.resolve(__dirname, "../build", "index.html"));
  });
  
  try {
    await mongoose.connect(uri, mongooseConnectionOptions);
  }
  catch(e) {
    log.red(e);
  }
  
  const monConn = mongoose.connection;
  const opts = {
    storeClient: monConn,
    keyPrefix: "normal_requests",
    points: 10, // Number of points
    duration: 1, // Per second(s)
    blockDuration: 2,
  };

  const fastLoginOpts = {
    points: 5,
    duration: 30,
  }

  const rateLimiterMongo = new RateLimiterMongo(opts);
  // rateLimiterMongo
  //   .consume(remoteAddress, 2) // consume 2 points
  //   .then((rateLimiterRes) => {
  //     // 2 points consumed
  //   })
  //   .catch((rateLimiterRes) => {
  //     // Not enough points to consume

  //   });
  return { app, store };
};

const Connect = async (app) => {
  let uri = "";
  // default assumed to be development
  if (process.env.NODE_ENV === "test") {
    console.log("testing mode...");
    uri = process.env.ATLAS_URI_TEST;
  } else if (process.env.NODE_ENV === "production") {
    console.log("production mode...");
    uri = process.env.ATLAS_URI;
  } else {
    console.log("development mode...");
    uri = process.env.ATLAS_URI_DEV;
  }

  const sessionStoreOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  const mongooseConnectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  };

  let store = new MongoDBStore(
    {
      uri: uri,
      collection: "sessions",
      expires: 604800000,
      connectionOptions: sessionStoreOptions,
    },
    (err) => {
      if (err) log.red("store connection error " + err);
    }
  );
  store.on("error", (err) => log.red("store error: " + err));
  return await ConnectDBs(app, uri, mongooseConnectionOptions, store);
};

module.exports = Connect;
