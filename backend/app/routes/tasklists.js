const router = require("express").Router();
// there isn't a tasklist model, it is a subdoc of the user
const User = require("../models/user.model");

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
  if (typeof req.params.id !== "string")
    return res.status(400).json({ missingParams: "id required" });
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

const ModifyDoc = async (res, id, tasklistID, method, updates, func) => {
  User.findOne({
    _id: id,
  })
    .then((doc) => {
      if (doc === undefined) {
        return res
          .status(404)
          .json({ reason: "doc not found, was it deleted?" });
      }
      func(doc, tasklistID, updates);
      doc
        .save()
        .then(() => {
          return res.status(204).json({ [method]: true });
        })
        .catch((error) => {
          return res
            .status(400)
            .json({ error: error, reason: method + " failed" });
        });
    })
    .catch((error) => {
      return res
        .status(400)
        .json({ error: error, reason: "user lookup failed" });
    });
};

// eslint-disable-next-line no-unused-vars
const DeleteSpecific = (doc, id, _updates) => {
  doc.tasklists.id(id).remove();
  return doc;
};

const UpdateSpecific = (doc, id, updates) => {
  doc.tasklists.id(id).set({
    ...(updates.name && { name: updates.name }),
    ...(updates.description && { description: updates.description }),
    ...(updates.tasks && { tasks: updates.tasks }),
  });
  return doc;
};

const AddSpecific = (doc, _id, updates) => {
  doc.tasklists.push(updates);
  return doc;
};

router.post("/add", async (req, res) => {
  // need user cookie information to add or whatever
  // so i need a router.use for all these that prechecks for correct
  // login credentials
  var { name, description, tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    tasks = [{ name: "First task!" }];
  }
  if (!name || name === "" || typeof name !== "string") {
    return res.status(400).json({ reason: "must include a name" });
  }
  if (description && typeof description !== "string") {
    description = "";
  }
  const tasklist = {
    name: name,
    description: description,
    tasks: tasks,
  };
  return await ModifyDoc(
    res,
    req.session.user._id,
    "",
    "add",
    tasklist,
    AddSpecific
  );
});

router.post("/update/:id", async (req, res) => {
  var { name, description, tasks } = req.body;
  if (!Array.isArray(tasks)) tasks = undefined;
  if (name === "") name = undefined;

  if (!name && !description && !tasks) {
    return res
      .status(400)
      .json({ missing: "Missing requested changes for update" });
  }
  if (typeof req.params.id !== "string")
    return res.status(400).json({ missingParams: "id required" });
  return await ModifyDoc(
    res,
    req.session.user._id,
    req.params.id,
    "update",
    { name, description, tasks },
    UpdateSpecific
  );
});

router.delete("/delete/:id", async (req, res) => {
  if (typeof req.params.id !== "string")
    return res.status(400).json({ missingParams: "id required" });
  return await ModifyDoc(
    res,
    req.session.user._id,
    req.params.id,
    "delete",
    {},
    DeleteSpecific
  );
});

module.exports = router;
