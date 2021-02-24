const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");
const Tasklist = require("../models/tasklist.schema").model;
const Task = require("../models/task.schema").model;

router.get("/", (req, res) => {
  User.findOne({ _id: req.session.user._id }, "-_id tasklists")
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json({ error: err });
      if (!doc || doc.tasklists === undefined)
        return res.status(404).json({
          reason:
            "user does not exist anymore or tasklist field was deleted somehow?",
        });
      return res.json(doc);
    });
});

router.get("/read/:id", (req, res) => {
  User.findOne(
    { _id: req.session.user._id, "tasklists._id": req.params.id },
    "-_id tasklists.$"
  )
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json("Error " + err);
      if (!doc || doc.tasklists === undefined || doc.tasklists.length < 1)
        return res.status(404).json({ reason: "tasklist or user not found" });
      res.status(200).json({ tasklist: doc.tasklists[0] });
    });
});

router.post("/add", async (req, res) => {
  // need user cookie information to add or whatever
  // so i need a router.use for all these that prechecks for correct
  // login credentials
  var { name, description, tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length < 1) {
    tasks = [];
  }
  if (!Task.isMinimumTaskArray(tasks)) tasks = [];
  const realTasks = tasks
    .map((element) => {
      return new Task(element);
    })
    .filter((element) => element !== undefined);
  if (!name || name === "" || typeof name !== "string") {
    return res.status(400).json({ reason: "must include a name" });
  }
  if (description && typeof description !== "string") {
    description = "";
  }
  const tasklist = new Tasklist({
    name: name,
    description: description,
    tasks: realTasks,
  });
  // this should be find and update one to return the newly created tasklist
  User.findOneAndUpdate(
    { _id: req.session.user._id },
    { $push: { tasklists: tasklist } },
    { lean: true, new: true, projection: { tasklists: { $slice: -1 } } }
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err, reason: "add failed" });
    var jsonObj = { add: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      jsonObj.tasklist = doc.tasklists[0];
    return res.status(201).json(jsonObj);
  });
});

// shouldnt need to pass back new version as its setting all the important stuff in the update normally
router.post("/update/:id", async (req, res) => {
  var { name, description, tasks, empty } = req.body;
  // can only pass an empty task array if empty is passed as true, aka this was on purpose
  if (tasks) {
    if (!Task.isCompleteTaskArray(tasks) || (tasks.length < 1 && !empty))
      return res.status(400).json({
        reason: "if tasks is sent, must be valid and completely typed tasks",
      });
    tasks = tasks
      .map((element) => {
        return new Task(element);
      })
      .filter((element) => element !== undefined);
  }

  if (typeof name !== "string" || name === "") name = undefined;
  if (typeof description !== "string" || description === "")
    description = undefined;
  if (!name && !description) {
    return res
      .status(400)
      .json({ missing: "Missing requested changes for update" });
  }
  User.updateOne(
    { _id: req.session.user._id, "tasklists._id": req.params.id },
    {
      $set: {
        ...(name && { "tasklists.$.name": name }),
        ...(description && { "tasklists.$.description": description }),
        ...(tasks && { "tasklists.$.tasks": tasks }),
      },
    },
    { lean: true }
  ).exec((err) => {
    if (err)
      return res.status(400).json({ error: err, reason: "update failed" });
    return res.status(204).json({ update: true });
  });
});

router.delete("/delete/:id", async (req, res) => {
  User.updateOne(
    { _id: req.session.user._id },
    {
      $pull: { tasklists: { _id: req.params.id } },
    },
    { lean: true }
  ).exec((err) => {
    if (err)
      return res.status(400).json({ error: err, reason: "delete failed" });
    return res.status(204).json({ delete: true });
  });
});

module.exports = router;
