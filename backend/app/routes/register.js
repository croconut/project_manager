const router = require("express").Router();
const User = require("../models/user.model");

const missingParameters = (res) => {
  return res.status(400).json({
    failed:
      "Registration failed, missing required field " +
      "(password and either username or email).",
  });
};

router.get("/existence/:username?/:email?", (req, res) => {
  // accepts queries or parameters :x
  let { username, email } = req.params;
  username = username || req.query.username;
  email = email || req.query.email;
  if (!username && !email) {
    return res
      .status(400)
      .json({ missing: "Missing parameters: username or email" });
  }

  let orArr = [];
  if (username) orArr.push({ username: username });
  if (email) orArr.push({ email: email });

  User.find(
    { $or: orArr },
    "username email",
    { lean: true, limit: 2 },
    (err, docs) => {
      return ExistenceCheck(err, docs, req, res, username, email, false);
    }
  );
});

router.post("/", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return missingParameters(res);
  if (!User.passwordAcceptable(password))
    return res.status(400).json({
      weakPassword:
        "password must be 32 characters or 14 with capitals, lowercase and numbers",
    });
  const tasklist = { name: "To-Do", tasks: [{ name: "My first task!" }] };
  const newUser = new User({
    username,
    email,
    password,
    tasklists: [tasklist],
  });

  User.find(
    { $or: [{ username: username }, { email: email }] },
    "username email",
    { lean: true, limit: 2 },
    (err, docs) => {
      return ExistenceCheck(err, docs, req, res, username, email, newUser);
    }
  );
});

function ExistenceCheck(err, docs, req, res, username, email, newUser) {
  let failureObj = {};
  if (err || docs.length < 1)
    if (newUser) return ContinueRegistration(req, res, newUser);
    else
      return res
        .status(200)
        .json({ accepted: "username and/or email not found" });
  if (docs.length > 1)
    return res.status(409).json({ email: "match", username: "match" });
  if (docs[0].username === username) failureObj.username = "match";
  if (docs[0].email === email) failureObj.email = "match";
  return res.status(409).json(failureObj);
}

function ContinueRegistration(req, res, newUser) {
  newUser
    .save()
    // first cb is successful add, second is failure to add but well
    // formed request (didn't pass model's validation methods, may be
    // missing something)
    .then(() => {
      User.findOne(
        { username: newUser.username },
        "_id",
        {
          lean: true,
        },
        (err, doc) => {
          if (err) return res.status(400).json("Error " + err);
          else {
            req.session.user = doc;
            return res.status(201).json("User added!");
          }
        }
      );
    })
    .catch((err) => {
      return res.status(400).json("Error " + err);
    });
}

module.exports = router;
