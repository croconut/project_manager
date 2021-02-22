const router = require("express").Router();
var ObjectID = require("mongodb").ObjectID;
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");
const Task = require("../models/task.schema").model;
const { TaskStage } = require("../staticData/ModelConstants");

// priority, stage, and name are required
const isTask = (task) => {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.name === "string" &&
    (task.stage === TaskStage[0] ||
      task.stage === TaskStage[1] ||
      task.stage === TaskStage[2] ||
      task.stage === TaskStage[3]) &&
    typeof task.priority === "number"
  );
};

const isCompleteTask = (task) => {
  return (
    isTask(task) &&
    ObjectID.isValid(task._id) &&
    typeof task.assignedUsername === "string" &&
    typeof task.assignedUserIcon === "string" &&
    typeof task.description === "string"
  );
};

router.get("/read/:listid/:taskid", async (req, res) => {
  const userid = req.session.user._id;
  const tasklistid = req.params.listid;
  const taskid = req.params.taskid;
  User.findOne(
    { _id: userid, "tasklists._id": tasklistid },
    "_id tasklists.$"
  ).exec(async (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    if (!doc || doc.tasklists === undefined || doc.tasklists.length < 1)
      return res.status(404).json({
        reason:
          "user does not exist anymore or tasklist field was deleted somehow?",
      });
    var task = doc.tasklists.id(tasklistid).tasks.id(taskid);
    if (task) return res.json(task);
    else
      return res
        .status(400)
        .json({ reason: "task not found in that tasklist" });
  });
});

// unlike the tasklist routes, can update many tasks at once
// onus of maintaining priority is on the client side
// idc if some idiot posts to the backend and messes this up for some reason tbh
router.post("/add/:id", async (req, res) => {
  var { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length < 1) {
    return res
      .status(400)
      .json({ reason: "must add an array of tasks with at least one task" });
  }
  for (let i = 0; i < tasks.length; i++) {
    if (!isTask(tasks[i]))
      return res
        .status(400)
        .json({ reason: "at least one task failed to parse as a task" });
  }
  const realTasks = tasks
    .map((element) => {
      return new Task(element);
    })
    .filter((element) => element !== undefined);
  User.updateOne(
    { _id: req.session.user._id, "tasklists._id": req.params.id },
    { $addToSet: { "tasklists.$.tasks": { $each: realTasks } } }
  )
    .lean()
    // eslint-disable-next-line no-unused-vars
    .exec((err, doc) => {
      if (err) return res.status(400).json({ error: err });
      return res.status(201).json({ add: true });
    });
});

// set a list of tasks to a new, full replacement
// normal crud wont work well when updating task priority since so much data
// will be changing
// UNLESS i create a new tasklist field which contains priority values
// and is same size as tasks ???
router.post("/set/:id", async (req, res) => {
  var { tasks } = req.body;
  if (!Array.isArray(tasks) || tasks.length < 1) {
    return res
      .status(400)
      .json({ reason: "must add an array of tasks with at least one task" });
  }
  for (let i = 0; i < tasks.length; i++) {
    if (!isCompleteTask(tasks[i]))
      return res.status(400).json({
        reason:
          "at least one task is not a perfect match to schema requirements",
      });
  }
  const realTasks = tasks
    .map((element) => {
      return new Task(element);
    })
    .filter((element) => element !== undefined);
  User.updateOne(
    { _id: req.session.user._id, "tasklists._id": req.params.id },
    {
      $set: { "tasklists.$.tasks": realTasks },
    }
  )
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json({ error: err });
      return res.status(204).json({ set: true });
    });
});

router.post("/update/:listid/:taskid", async (req, res) => {
  var { task } = req.body;
  if (!isCompleteTask(task)) {
    return res.status(400).json({
      reason: "task must be a perfect match to schema requirements",
    });
  }
  const realTask = new Task(task);
  User.updateOne(
    {
      _id: req.session.user._id,
      "tasklists._id": req.params.listid,
      "tasklists.$.tasks._id": req.params.taskid,
    },
    {
      $set: { "tasklists.$.tasks.$$": realTask },
    }
  )
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json({ error: err });
      return res.status(204).json({ set: true });
    });
});

module.exports = router;
