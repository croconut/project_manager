const router = require("express").Router();
const User = require("../models/user.model");

router.post("/", (req, res) => {
  res.send("made it");
});

module.exports = router;