const router = require("express").Router();
const User = require("../models/user.model");

const passwordFailed = (res) => {
  return res.status(403).json({ failed: "Login failed" });
};

const missingCredentials = (res) => {
  return res.status(401).json({
    failed:
      "Login failed, missing required field " +
      "(password and either username or email).",
  });
};

router.post("/", (req, res) => {
  // on login, users use their username or email and password
  // for other routes they'll use their objectid and the
  // hashed password, saved in their cookie
  const { username, email, password } = req.body;
  let filter;
  if (
    !password ||
    (!email && !username)
  )
    return missingCredentials(res);
  if (email) filter = { email: email };
  else filter = { username: username };
  //attempt login by username
  //on success
  //return their hash and objectid
  //on fail return error status + msg
  //status determines if username not found or
  //if
  User.findOne(filter, "_id password").exec((err, doc) => {
    // dont send this doc
    // DONT SEND THIS DOC
    if (err) return passwordFailed(res);
    if (!doc) return passwordFailed(res);
    doc.comparePassword(password, (err, match) => {
      if (err || !match) {
        return passwordFailed(res);
      }
      req.session.user = { _id: doc._id };
      return res.status(200).json({ success: "Login success" }).send();
    });
  });
});

module.exports = router;
