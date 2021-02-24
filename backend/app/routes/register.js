const router = require("express").Router();
const User = require("../models/user.model");
const Tasklist = require("../models/tasklist.schema").model;

const userPrivate = User.loginFields();

const missingParameters = (res) => {
  return res.status(400).json({
    failed:
      "Registration failed, missing required field " +
      "(password and either username or email).",
  });
};

router.post("/", (req, res) => {
  const { username, email, password } = req.body;
  var tasklists = req.body.tasklists;
  if (!Array.isArray(tasklists)) tasklists = [];
  else {
    tasklists = tasklists.map((element) => {
      var list = Tasklist(element);
      list.postCreate();
      return list;
    });
  }

  if (
    !username ||
    !email ||
    !password ||
    username === "" ||
    email === "" ||
    password === ""
  )
    return missingParameters(res);
  if (!User.passwordAcceptable(password))
    return res.status(400).json({
      weakPassword:
        "password must be 32 characters or 14 with capitals, lowercase and numbers",
    });
  const newUser = new User({
    username,
    email,
    password,
    tasklists,
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
  if (err || docs.length < 1) return ContinueRegistration(req, res, newUser);
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
        userPrivate,
        {
          lean: true,
        },
        (err, doc) => {
          if (err) return res.status(400).json("Error " + err);
          else {
            req.session.user = { _id: doc._id };
            delete doc._id;
            delete doc.password;
            return res.status(201).json({ success: true, user: doc });
          }
        }
      );
    })
    .catch((err) => {
      return res.status(400).json("Error " + err);
    });
}

module.exports = router;
