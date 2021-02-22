const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");

const getTaskOnly = async (res, userid, tasklistid, taskid) => {
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
};

// const readATask = (res, tasklistid, taskid, doc, _updates) => {
//   var task = doc.tasklists.id(tasklistid).tasks.id(taskid);
//   if (task) return res.json(task);
//   else
//     return res.status(400).json({ reason: "task not found in that tasklist" });
// };

// const addTasks = async (res, tasklistid, _taskid, doc, updates) => {
//   var tasks = doc.tasklists.id(tasklistid).tasks;
//   updates.forEach((task) => {
//     tasks.push(task);
//   });
//   console.log(tasks);
//   await doc
//     .save()
//     .then(() => res.status(201).json({ add: "tasks added successfully" }))
//     .catch((err) => {
//       console.log(err);
//       res.status(400).json({
//         error: err,
//         reason: "likely malformed tasks or missing information",
//       });
//     });
//   return res;
// };

// mongoose takes care of the rest of this validation
const isTask = (task) => {
  return typeof task === "object" && task !== null;
};

router.get("/read/:listid/:taskid", async (req, res) => {
  return await getTaskOnly(
    res,
    req.session.user._id,
    req.params.listid,
    req.params.taskid
  );
});

// unlike the tasklist routes, can update many tasks at once
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

  return res.status(500).send("not implemented yet");
});

module.exports = router;
