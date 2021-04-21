const mongoose = require("mongoose");
const projectTask = require("./projecttask.schema");

// when adding tasks to tasklist or updating task inside a tasklist ->
// need to change its array based on its stage if changed
// there is no default list to add to
// do not allow initialization with tasks
// only accept tasks or description / name changes in updates
// on name change must still check uniqueness vs other tasklists in parent
// document
const projectBoardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      required: false,
      default: "",
      maxlength: 2000,
    },
    // should project board view default to being a calendar?
    calendar: {
      type: Boolean,
      required: false,
      default: false,
    },
    tasks: [projectTask.schema],
    // these are (index, completion percentage) tuples - each correlates
    // to a task
    toDo: [(Number, Number)],
    inProgress: [(Number, Number)],
    complete: [(Number, Number)],
  },
  {
    timestamps: true,
  }
);

// for tasklist adding, run after instantiating as new if
// no stage priority lists were given
// will initialize all given tasks to have priority set to stage 1
projectBoardSchema.methods.postCreate = function postCreate() {
  if (
    this.toDo.length + this.inProgress.length + this.complete.length ===
    this.tasks.length
  )
    return;
  this.toDo = new Array(this.tasks.length);
  this.inProgress = [];
  this.complete = [];
  for (let i = 0; i < this.tasks.length; i++) {
    this.toDo[i] = (i, 0);
  }
};

projectBoardSchema.statics.isStages = (stages, taskslength) => {
  if (
    typeof stages !== "object" ||
    stages === null ||
    typeof taskslength !== "number" ||
    !Array.isArray(stages.toDo) ||
    !Array.isArray(stages.inProgress) ||
    !Array.isArray(stages.complete)
  )
    return false;
  if (
    this.toDo.length + this.inProgress.length + this.complete.length !==
    this.tasks.length
  )
    return false;

  // initialize all the required task indices to 0 so we only
  // have to iterate through the keys object and can check
  // that all the initial arguments get overwritten
  var dictionary = {};
  for (let i = 0; i < taskslength; i++) {
    dictionary[i] = 0;
  }
  // concatenate all the lists of task indices and ensure that every task
  // index is accounted for
  let list = stages.toDo.concat(stages.inProgress, stages.complete);
  for (let i = 0; i < list.length; i++) {
    dictionary[list[i]] = 1;
  }
  let keys = Object.keys(dictionary);
  // if there's an extra key that's bad
  if (keys.length !== taskslength) return false;
  for (let i = 0; i < keys.length; i++) {
    // if there's a key that didn't get overwritten that's bad
    if (dictionary[keys[i]] !== 1) return false;
  }
  return true;
};

const ProjectBoard = mongoose.model("ProjectBoard", projectBoardSchema);

module.exports = { schema: projectBoardSchema, model: ProjectBoard };
