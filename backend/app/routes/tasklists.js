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
  // name is string, description is string, tasks is array of tasks (only name is required)
  // stages is obj with keys stage1, stage2, stage3, stage4 all number arrays and contains
  // collectively all the indices of the tasks
  var { name, description, tasks, stages } = req.body;
  if (!Array.isArray(tasks) || tasks.length < 1) {
    tasks = [];
  }
  if (!Task.isMinimumTaskArray(tasks)) {
    tasks = [];
  } else {
    tasks = tasks
      .map((element) => {
        return new Task(element);
      })
      .filter((element) => element !== undefined);
  }
  if (!Array.isArray(tasks) || !Tasklist.isStages(stages, tasks.length)) {
    stages = { stage1: [], stage2: [], stage3: [], stage4: [] };
  }
  if (!name || name === "" || typeof name !== "string") {
    return res.status(400).json({ reason: "must include a name" });
  }
  if (description && typeof description !== "string") {
    description = "";
  }
  const tasklist = new Tasklist({
    name: name,
    description: description,
    tasks: tasks,
    stage1: stages.stage1,
    stage2: stages.stage2,
    stage3: stages.stage3,
    stage4: stages.stage4,
  });
  // must run in case tasks passed its check and stages didnt to ensure
  // the tasks are at least initialized to all be in stage1 by index order
  tasklist.postCreate();
  // this should be find and update one to return the newly created tasklist
  User.findOneAndUpdate(
    { _id: req.session.user._id },
    { $push: { tasklists: tasklist } },
    // -1 slice to return the newly pushed tasklist
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
  // if changes were made to any stage array, ALL ARRAYS MUST BE SENT
  // as validity is checked by checking all stages
  // can optionally send stages and taskslength if we're only making changes to the priority and stages
  // of the tasks
  // the taskAdds is an array where the first index is 
  var { name, description, tasks, stages, empty, taskslength } = req.body;
  var tlength =
    typeof taskslength === "number"
      ? taskslength
      : Array.isArray(tasks)
      ? tasks.length
      : -1;
  // can only pass an empty task array if empty is passed as true, aka this was on purpose
  if (tasks) {
    if (!Task.isMinimumTaskArray(tasks) || (tasks.length < 1 && !empty))
      return res.status(400).json({
        reason: "if tasks is sent, must be valid and completely typed tasks",
      });
    tasks = tasks
      .map((element) => {
        return new Task(element);
      })
      .filter((element) => element !== undefined);
  }
  if (stages && !Tasklist.isStages(stages, tlength)) {
    return res.status(400).json({
      reason:
        "if stages are sent, ALL stage arrays must be sent and completely filled in",
    });
  }
  if (typeof name !== "string" || name === "") name = undefined;
  if (typeof description !== "string") description = undefined;
  if (!name && !description && !stages && !tasks) {
    return res
      .status(400)
      .json({ missing: "Missing requested changes for update" });
  }
  var matchfield = {
    _id: req.session.user._id,
    tasklists: {
      $elemMatch: {
        _id: req.params.id,
        ...(typeof taskslength === "number" &&
          stages &&
          !tasks && { tasks: { $size: taskslength } }),
      },
    },
  };
  User.findOneAndUpdate(
    matchfield,
    {
      $set: {
        ...(name && { "tasklists.$.name": name }),
        ...(description && { "tasklists.$.description": description }),
        ...(tasks && { "tasklists.$.tasks": tasks }),
        ...(stages && { "tasklists.$.stage1": stages.stage1 }),
        ...(stages && { "tasklists.$.stage2": stages.stage2 }),
        ...(stages && { "tasklists.$.stage3": stages.stage3 }),
        ...(stages && { "tasklists.$.stage4": stages.stage4 }),
      },
    },
    {
      lean: true,
      new: true,
      projection: { tasklists: matchfield.tasklists },
    }
  ).exec((err, doc) => {
    if (err)
      return res.status(400).json({
        error: err,
        reason: "update failed",
      });
    var jsonObj = { update: true };
    if (doc && doc.tasklists && doc.tasklists.length > 0)
      jsonObj.tasklist = doc.tasklists[0];
    if (!doc)
      return res.status(400).json({
        update: false,
        reason: "failed, if taskslength, probably inaccurate",
      });
    return res.status(200).json(jsonObj);
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
