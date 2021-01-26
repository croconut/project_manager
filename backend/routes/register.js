const router = require("express").Router();
const User = require("../models/user.model");

router.route("/").post((req, res) => {
  const { username, email, password } = req.body;
  const tasklist = { name: "To-Do", tasks: [{ name: "My first task!" }] };
  const newUser = new User({
    username,
    email,
    password,
    tasklists: [tasklist],
  });
  newUser
    .save()
    // first cb is successful add, second is failure to add but well
    // formed request (didn't pass model's validation methods, may be
    // missing something)
    .then(
      () => {
        User.findOne({ username: username },"_id", {
          lean: true,
        }, (err, doc) => {
          if (err) return res.status(400).json("Error " + err);
          else {
            console.log(doc);
            req.session.user = doc;
            return res.json("user added!");
          }});
      },
      (error) =>
        res
          .status(403)
          .json({ msg: "User rejected!", request: req.body, error: error })
    )
    .catch((err) => res.status(400).json("Error " + err));
});

module.exports = router;
