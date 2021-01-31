const router = require("express").Router();
const User = require("../models/user.model");

// dont really wanna send password information ever lol
const userAll = "-password -_id";
const userPublic = "-password -email -tasklists -_id";

router.get("/myinfo", (req, res) => {
  // using middle ware that ensures logged in
  // if (!req.session.user)
  //   return res.status(403).json("Access forbidden to logged out users");
  User.findById(
    req.session.user._id,
    userAll,
    { lean: true },
    (err, doc) => {
      if (err || !doc) return res.status(400).json("Error " + err);
      console.log(doc);
      res.json(doc);
    }
  );
});

router.get("/:username", (req, res) => {
  User.findOne(
    { username: req.params.username },
    userPublic,
    { lean: true },
    (err, doc) => {
      if (err) return res.status(400).json("Error " + err);
      res.json(doc);
    }
  );
});

router.get("/:id", (req, res) => {
  User.findOne(
    { _id: req.params.id },
    req.session.user._id === req.params.id ? userAll : userPublic,
    { lean: true },
    (err, doc) => {
      if (err) return res.status(400).json("Error " + err);
      res.json(doc);
    }
  );
});

router.get("/", (req, res) => {
  User.find(
    {},
    userPublic,
    {
      limit: req.body.limit || 10,
      skip: req.body.skip || 0,
      lean: true,
    },
    (err, doc) => {
      if (err) return res.status(400).json("Error " + err);
      res.json(doc);
    }
  );
});

module.exports = router;
