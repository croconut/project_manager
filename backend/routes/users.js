const router = require("express").Router();
let User = require("../models/user.model");

router.route("/").get((req, res) => {
  User.find()
    .then((users) => res.json(users))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser
    .save()
    // first cb is successful add, second is failure to add but well
    // formed request (didn't pass model's validation methods)
    .then(
      () => res.json("User added!"),
      () => res.status(403).json("User rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

module.exports = router;
