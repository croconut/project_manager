const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");

router.get("/read/:listid/:taskid", (req, res) => {
  User.findOne(
    { _id: req.session.user._id, "tasklists._id": req.params.listid },
    "-_id tasklists.$"
  ).exec((err, doc) => {
    if (err) return res.status(400).json({ error: err });
    if (!doc || doc.tasklists === undefined || doc.tasklists.length < 1)
      return res.status(404).json({
        reason:
          "user does not exist anymore or tasklist field was deleted somehow?",
      });
    var task = doc.tasklists.id(req.params.listid).tasks.id(req.params.taskid);
    if (task) return res.json(task);
    else
      return res
        .status(400)
        .json({ reason: "task not found in that tasklist" });
  });
});

module.exports = router;
