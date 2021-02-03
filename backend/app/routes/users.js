const router = require("express").Router();
const User = require("../models/user.model");

// dont really wanna send password information ever lol
const userPrivate = User.privateFields();
// public info just has more restrictions
const userPublic = User.publicFields();

router.get("/myinfo", (req, res) => {
  // using middle ware that ensures logged in
  // if (!req.session.user)
  //   return res.status(403).json("Access forbidden to logged out users");
  User.findById(
    req.session.user._id,
    userPrivate,
    { lean: true },
    (err, doc) => {
      if (err)
        return res.status(400).json("Error " + err + " or user not found");
      if (!doc) return res.status(404).json("Your data was not found");
      res.json(doc);
    }
  );
});

router.get("/search/:username", (req, res) => {
  // TODO allow search by username / index using query / params (like the existence check)
  const username = req.params.username;
  User.findOne(
    { username: username },
    userPublic,
    { lean: true },
    (err, doc) => {
      if (err)
        return res
          .status(404)
          .json({ failed: "error or username not found", error: err });
      if (!doc) return res.status(404).json("user " + username + " not found");
      res.status(200).json(doc);
    }
  );
});

router.post("/update", (req, res) => {
  // updates the logged in user
  const userUpdates = req.body.user;
  // removing password, cannot change that
  if (
    userUpdates["password"] ||
    userUpdates["passwordReset"] ||
    userUpdates["passwordResetTime"]
  )
    return res.status(403).json({
      forbidden: "changing the password or is forbidden",
    });
  if (!userUpdates || typeof userUpdates !== "object")
    return res.status(400).json({ missing: "missing user object in body" });
  User.findByIdAndUpdate(
    req.session.user._id,
    userUpdates,
    { new: true, lean: true, fields: "username" },
    (err, doc) => {
      if (err) return res.status(400).json({ error: "error " + err });
      return res
        .status(204)
        .json({ success: "User " + doc.username + " updated" });
    }
  );
});

module.exports = router;
