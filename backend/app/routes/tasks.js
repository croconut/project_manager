const router = require("express").Router();
var ObjectID = require("mongodb").ObjectID;
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");
const Task = require("../models/task.schema").model;
const { TaskStage } = require("../staticData/ModelConstants");

const defaultProjection = (id) => ({
  lean: true,
  new: true,
  projection: {
    tasklists: { $elemMatch: { _id: id } },
  },
});

const filteredProjection = (listid, taskid) => {
  var projection = defaultProjection(listid);
  projection.arrayFilters = [{ "outer._id": listid }, { "inner._id": taskid }];
  return projection;
};

// priority, stage, and name are required
const isTask = (task) => {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.name === "string" &&
    task.name !== "" &&
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
  const { listid, taskid } = req.params;
  User.findOne(
    { _id: userid, "tasklists._id": listid },
    "_id tasklists.$"
  ).exec(async (err, doc) => {
    if (err) return res.status(400).json({ error: err });
    if (
      !doc ||
      !Array.isArray(doc.tasklists) ||
      doc.tasklists.length < 1 ||
      !Array.isArray(doc.tasklists[0].tasks)
    )
      return res.status(404).json({
        reason:
          "user does not exist anymore or tasklist field was deleted somehow?",
      });
    var task = doc.tasklists.id(listid).tasks.id(taskid);
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
  const { tasks } = req.body;
  const { id } = req.params;
  const userid = req.session.user._id;
  if (!ObjectID.isValid(id)) {
    return res.status(400).json({ reason: "invalid id param" });
  }
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
  User.findOneAndUpdate(
    { _id: userid, "tasklists._id": id },
    { $addToSet: { "tasklists.$.tasks": { $each: realTasks } } },
    defaultProjection(id)
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err });
    var json = { update: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      json["tasklist"] = doc.tasklists[0];
    return res.status(200).json(json);
  });
});

// set a list of tasks to a new, full replacement
// normal crud wont work well when updating task priority since so much data
// will be changing
// UNLESS i create a new tasklist field which contains priority values
// and is same size as tasks ???
router.post("/set/:id", async (req, res) => {
  const { tasks, empty } = req.body;
  const { id } = req.params;
  const userid = req.session.user._id;
  if (!ObjectID.isValid(id)) {
    return res.status(400).json({ reason: "invalid id param" });
  }
  if (!Array.isArray(tasks) || (tasks.length < 1 && !empty)) {
    return res
      .status(400)
      .json({ reason: "must set tasks to an array" });
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
  User.findOneAndUpdate(
    { _id: userid, "tasklists._id": id },
    {
      $set: { "tasklists.$.tasks": realTasks },
    },
    defaultProjection(id)
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err });
    var json = { set: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      json["tasklist"] = doc.tasklists[0];
    return res.status(200).json(json);
  });
});

router.post("/update/:listid/:taskid", async (req, res) => {
  const { task } = req.body;
  const { listid, taskid } = req.params;
  const userid = req.session.user._id;
  if (!ObjectID.isValid(listid) || !ObjectID.isValid(taskid)) {
    return res.status(400).json({ reason: "invalid id params" });
  }
  if (taskid !== task._id) {
    return res
      .status(403)
      .json({ reason: "cannot change object id through update" });
  }
  if (!isCompleteTask(task)) {
    return res.status(400).json({
      reason: "task must be a perfect match to schema requirements",
    });
  }
  const realTask = new Task(task);
  User.findOneAndUpdate(
    {
      _id: userid,
    },
    {
      $set: { "tasklists.$[outer].tasks.$[inner]": realTask },
    },
    filteredProjection(listid, taskid)
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err });
    var json = { update: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      json["tasklist"] = doc.tasklists[0];
    return res.status(200).json(json);
  });
});

router.delete("/delete/:listid/:taskid", async (req, res) => {
  const userid = req.session.user._id;
  const { listid, taskid } = req.params;
  if (!ObjectID.isValid(listid) || !ObjectID.isValid(taskid)) {
    return res.status(400).json({ reason: "invalid id params" });
  }
  User.findOneAndUpdate(
    {
      _id: userid,
      "tasklists._id": listid,
    },
    {
      $pull: { "tasklists.$.tasks": { _id: taskid } },
    },
    defaultProjection(listid)
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err });
    var json = { delete: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      json["tasklist"] = doc.tasklists[0];
    return res.status(200).json(json);
  });
});

module.exports = router;
