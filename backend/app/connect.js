const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const path = require("path");

const { RateLimiterMemory } = require("rate-limiter-flexible");

require("dotenv").config();

const tasklistRouter = require("./routes/tasklists");
const usersRouter = require("./routes/users");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");
const logoutRouter = require("./routes/logout");
const passwordResetRouter = require("./routes/userPasswordReset");
const Routes = require("./staticData/Routes");
const log = require("./utils/logcolors");
let node_env = process.env.NODE_ENV;

const ConnectDBs = async (app, uri, mongooseConnectionOptions, store) => {
  // resource access per ip address
  // only blocks for an hour
  const rateLimitOptions = {
    keyPrefix: "resource_access_by_ip",
    points: node_env === "test" ? 2000 : 20,
    duration: 1,
    blockDuration: 60 * 60,
  };

  // 5 login attempts per hour
  const loginRateLimitOptions = {
    keyPrefix: "login_attempts_by_ip",
    points: node_env === "test" ? 500 : 5,
    duration: 60 * 60,
    blockDuration: 60 * 60 * 24,
  };

  const standardRateLimiter = new RateLimiterMemory(rateLimitOptions);
  const loginRateLimiter = new RateLimiterMemory(loginRateLimitOptions);
  
  const rateLimitMiddleware = (req, res, next) => {
    standardRateLimiter
      .consume(req.ip)
      .then(() => next())
      .catch(() =>
        res.status(429).json({ reason: "ip resource limit reached" })
      );
  };

  // ip rate limiting coming before the session middleware as the
  // session middleware makes calls to the db
  app.use(rateLimitMiddleware);

  app.use(
    session({
      key: process.env.SESSION_KEY,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      httpOnly: true,
      secure: true,
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
      return next();
    }
    // this gets caught by frontend
    else {
      res.redirect("/login");
    }
  };

  const loginRedirect = (req, res, next) => {
    if (!req.session.user || !req.session.user._id)
      return res.redirect("/welcome");
    next();
  };

  // you may not log in if you're already logged in
  // will actually let you try email if locked out of username
  // as long as ip wasn't locked out
  // since im not enforcing full info retrieval
  const loginMiddleware = (req, res, next) => {
    if (req.session && req.session.user) return res.redirect("/");
    const usernameOrEmail = req.body.username || req.body.email;
    if (typeof usernameOrEmail !== "string")
      return res.status(401).json({
        failed: "Login failed, missing username or email field",
      });
    // i guess ill allow attacks through rotating ip addresses so they
    // can't just screw over a user on a different ip address
    loginRateLimiter
      .consume(req.ip + usernameOrEmail, 1)
      .then(() => next())
      .catch(() => res.status(429).json({ reason: "login limit reached" }));
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

  

  app.use(Routes.tasklistRouter.route, nonHomeRedirect, tasklistRouter);
  app.use(Routes.usersRouter.route, nonHomeRedirect, usersRouter);
  app.use(Routes.registerRouter.route, registerRouter);
  app.use(Routes.loginRouter.route, loginMiddleware, loginRouter);
  app.use(Routes.usersPasswordReset.route, passwordResetRouter);
  // gotta be logged in to bother logging out
  app.use(Routes.logoutRouter.route, loginRedirect, logoutRouter);

  // must have all api routes registered before this route
  app.get("/api/*", (_req, res) => {
    return res.status(404).json({ reason: "unsupported api call" });
  });

  app.use(express.static(path.join(__dirname, "../../frontend/build")));

  app.get("/*", (_req, res) =>
    res.sendFile(path.resolve(__dirname, "../../frontend/build/index.html"))
  );

  await mongoose.connect(uri, mongooseConnectionOptions);

  // TODO ensure this gets awaited :x
  // const monConn = mongoose.connection;
  // const opts = {
  //   storeClient: monConn,
  //   keyPrefix: "normal_requests",
  //   points: 10, // Number of points
  //   duration: 1, // Per second(s)
  //   blockDuration: 2,
  // };

  // const fastLoginOpts = {
  //   points: 5,
  //   duration: 30,
  // }

  // const rateLimiterMongo = await new RateLimiterMongo(opts);
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

const Connect = async (app, isTest = false) => {
  let uri = "";
  // not covering production / development in tests
  if (node_env === "test" || isTest) {
    node_env = "test";
    console.log("testing mode...");
    uri = process.env.ATLAS_URI_TEST;
  } else if (node_env === "production") {
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
    useFindAndModify: false,
  };

  // this store connection is supposedly synchronous
  let store = new MongoDBStore(
    {
      uri: uri,
      collection: process.env.SESSION_COLLECTION,
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
