const router = require("express").Router();
let Exercise = require("../models/Exercise.model");

router.route("/").get((_req, res) => {
  Exercise.find()
    .then((Exercises) => res.json(Exercises))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/add").post((req, res) => {
  const { username, description } = req.body;
  const duration = Number(req.body.duration);
  const date = Date.parse(req.body.date);

  const newExercise = new Exercise({
    username: username,
    description: description,
    duration: duration,
    date: date,
  });

  newExercise
    .save()
    .then(
      () => res.json("Exercise added!"),
      () => res.status(403).json("Exercise rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.route("/:id").get((req, res) => {
  Exercise.findById(req.params.id)
    .then((exercise) => res.json(exercise))
    .catch((err) => res.status(400).json("Error " + err));
});

router.route("/update/:id").post((req, res) => {
  Exercise.findByIdAndUpdate(
    { _id: req.params.id },
    // all fields are optionally updated
    {
      ...(req.body.duration !== undefined && {
        duration: Number(req.body.duration),
      }),
      ...(req.body.description !== undefined && {
        description: req.body.description,
      }),
      ...(req.body.date !== undefined && {
        date: Date.parse(req.body.date),
      }),
    }
    // if we want to insert when the id fails?
    // would need to allow updating all fields, including username
    // so we don't want this
    // { upsert: true }
  )
    .then(
      (_result) => {
        Exercise.findById(req.params.id)
          .then((exercise) => res.json(exercise))
          .catch((err) => res.status(400).json("Error " + err));
      },
      () => res.status(403).json("Exercise update rejected!")
    )
    .catch((err) => res.status(400).json("Error " + err));
});

router.route("/:id").delete((req, res) => {
  Exercise.findByIdAndDelete(req.params.id)
    .then(() => res.json("Exercise deleted!"))
    .catch((err) => res.status(400).json("Error " + err));
});

module.exports = router;
