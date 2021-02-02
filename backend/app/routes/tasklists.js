const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");

// adding tasklist with no tasks defined yet
router.post("/add", (req, res) => {
  // need user cookie information to add or whatever
  // so i need a router.use for all these that prechecks for correct
  // login credentials
  const { name, description, tasks } = req.body;
  console.log(req.body);
  let taskOption = tasks;
  if (!tasks) {
    taskOption = [{ name: "First task!" }];
  }

  if (!name || name === "") {
    return res.status(400).send("must include a name");
  }

  const tasklist = {
    name: name,
    description: description,
    tasks: taskOption,
  };

  // we should check that name and id will be unique
  User
    .updateOne(
      {
        _id: req.session.user._id,
        "tasklists.$.name": { $ne: tasklist.name },
      },
      { $set: { tasklists: tasklist } }
    )
    .then(
      () => res.json("Tasklist added!"),
      () => res.status(403).json("Tasklist rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.get("/", (req, res) => {
  console.log("help");
  User
    .findOne({ _id: req.session.user._id }, "-_id tasklists")
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json("Error " + err);
      res.json(doc);
    });
});

router.get("/read/:id", (req, res) => {
  User.findOne({ _id: req.session.user._id }, "-_id tasklists")
  .exec((err, doc) => {
    if (err) return res.status(400).json("Error " + err);
    console.log(doc);
    res.status(200).send("found");
  });
});

// this grabs the user doc and tasklist
// and updates the entire thing
// the tasklist must be fully specified
// only use when array changes are made e.g. LOTS of
// tasks have been modified
// or when tasklist name / description whatever changes
// can be used to add a new tasklist
// ex url is site.com/tasklists/update/asdgaps9in293
router.post("/update/:id", (req, res) => {
  const { name, description, tasks } = req.body;
  if (!name && !description && !tasks) {
    return res.status(400).json({missing: "Missing parameters for update"});
  }
  User
    .updateOne(
      {
        _id: req.session.user.id,
        "tasklists._id": req.params.id,
      },
      {
        $set: {
          ...(name && {
            "tasklists.$.name": name,
          }),
          ...(description && {
            "tasklists.$.description": description,
          }),
          ...(tasks && {
            "tasklists.$.tasks": tasks,
          }),
        },
      }
    )
    .then(
      // eslint-disable-next-line no-unused-vars
      () => res.status(200).json({ success: "Tasklist updated" })
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.delete("/delete/:id", (req, res) => {
  User
    .updateOne(
      {
        _id: req.session.user._id,
      },
      {
        $pull: { "tasklists._id": req.params.id },
      }
    )
    .then(() => res.json("Tasklist deleted!"))
    .catch((err) => res.status(400).json("Error " + err));
});

module.exports = router;
