const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const user = require("../models/user.model");
const taskSchema = require("../models/tasklist.schema");

// => query the session table and join it to a query for
// the logged in user
// will return full task list or error out


// adding tasklist with no tasks defined yet
router.post("/add", (req, res) => {
  // need user cookie information to add or whatever
  // so i need a router.use for all these that prechecks for correct
  // login credentials
  const { name, description } = req.body;

  const tasklist = new taskSchema({
    name: name,
    description: description,
  });
  // we should check that name and id will be unique
  user
    .updateOne(
      {
        _id: req.sessionID.user.id,
        "tasklists.name": { $ne: tasklist.name },
        "tasklists.id": { $ne: tasklist.id },
      },
      { $push: { tasklists: tasklist } },
      { upsert: true }
    )
    .then(
      () => res.json("Tasklist added!"),
      () => res.status(403).json("Tasklist rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.get("/:id", (req, res) => {
  user.updateOne();
  user
    .findById(req.params.id)
    .then((exercise) => res.json(exercise))
    .catch((err) => res.status(400).json("Error " + err));
});

// this grabs the user doc and tasklist
// and updates the entire thing
// the tasklist must be fully specified
// only use when array changes are made e.g. LOTS of
// tasks have been modified
// or when tasklist name / description whatever changes
// can be used to add a new tasklist
router.post("/update/:id", (req, res) => {
  user
    .updateOne(
      {
        _id: req.sessionID.user.id,
        "tasklists._id": req.params.id,
      },
      {
        $set: {
          ...(req.body.name !== undefined && {
            "tasklists.$.name": req.body.name,
          }),
          ...(req.body.description !== undefined && {
            "tasklists.$.description": req.body.description,
          }),
          ...(req.body.tasks !== undefined && {
            "tasklists.$.tasks": req.body.tasks,
          }),
        },
      },
      {
        upsert: true,
      }
    )
    .then(
      (_result) => {
        tasklist
          .findById(req.params.id)
          .then((exercise) => res.json(exercise))
          .catch((err) => res.status(400).json("Error " + err));
      },
      () => res.status(403).json("Tasklist update rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.delete("/:id", (req, res) => {
  user
    .updateOne(
      {
        _id: req.sessionID.user.id,
      },
      {
        $pull: { "tasklists._id": req.params.id },
      }
    )
    .then(() => res.json("Tasklist deleted!"))
    .catch((err) => res.status(400).json("Error " + err));
});


router.get("/", (_req, res) => {
  // need to be able to find based on user information
  // so need to be passed matching user information, then
  // retrieves info based on matchability
  // tasklist.find()
  //   .then((tasklists) => res.json(tasklists))
  //   .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
