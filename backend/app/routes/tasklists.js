const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");

// adding tasklist with no tasks defined yet
router.post("/add", (req, res) => {
  // need user cookie information to add or whatever
  // so i need a router.use for all these that prechecks for correct
  // login credentials
  const { name, description, tasks } = req.body;
  let taskOption = tasks;
  if (!tasks) {
    taskOption = [{ name: "First task!" }];
  }
  if (!name || name === "") {
    return res.status(400).json({ reason: "must include a name" });
  }

  const tasklist = {
    name: name,
    description: description,
    tasks: taskOption,
  };

  User.findOne({ _id: req.session.user._id })
    .then((doc) => {
      if (doc === undefined) {
        return res
          .status(404)
          .json({ notFound: "user not found, were they deleted?" });
      }
      doc.tasklists.push(tasklist);
      doc
        .save()
        .then(() => {
          return res.status(204).json({ success: true });
        })
        .catch((error) => {
          return res.status(400).json({ error: error, reason: "add failed" });
        });
    })
    .catch((error) => {
      return res
        .status(400)
        .json({ error: error, reason: "user lookup failed" });
    });
});

router.get("/", (req, res) => {
  User.findOne({ _id: req.session.user._id }, "-_id tasklists")
    .lean()
    .exec((err, doc) => {
      if (err) return res.status(400).json({ error: err });
      if (!doc || doc.tasklists === undefined)
        return res
          .status(404)
          .json({ reason: "tasklists empty or user does not exist anymore" });
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
    return res.status(400).json({ missing: "Missing parameters for update" });
  }
  console.log(req.body);
  console.log(req.params.id);
  User.findOne({
    _id: req.session.user._id,
    "tasklists._id": req.params.id,
  })
    .then((doc) => {
      if (doc === undefined) {
        return res
          .status(404)
          .json({ notFound: "tasklist not found, was it deleted?" });
      }
      var tasklist = doc.tasklists.id(req.params.id);
      console.log(tasklist);
      tasklist.set({
        ...(name && { name: name }),
        ...(description && { description: description }),
        ...(tasks && { tasks: tasks }),
      });

      doc
        .save()
        .then(() => {
          return res.status(204).json({ success: true });
        })
        .catch((error) => {
          return res.status(400).json({ error: error, reason: "update failed" });
        });
    })
    .catch((error) => {
      return res
        .status(400)
        .json({ error: error, reason: "user lookup failed" });
    });
  // .then(() => res.status(200).json({ success: "Tasklist updated" }))
  // .catch((err) => res.status(400).json("Error " + err));
});

router.delete("/delete/:id", (req, res) => {
  User.updateOne(
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
