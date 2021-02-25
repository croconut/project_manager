const mongoose = require("mongoose");
const task = require("./task.schema");

// when adding tasks to tasklist or updating task inside a tasklist ->
// need to change its array based on its stage if changed
// there is no default list to add to
// do not allow initialization with tasks
// only accept tasks or description / name changes in updates
// on name change must still check uniqueness vs other tasklists in parent
// document
const tasklistSchema = new mongoose.Schema(
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
    tasks: [task.schema],
    // these are the priority arrays that point to the task indices
    // based on their priority at their stage
    stage1: [Number],
    stage2: [Number],
    stage3: [Number],
    stage4: [Number],
  },
  {
    timestamps: true,
  }
);

// for tasklist adding, run after instantiating as new if
// no stage priority lists were given
// will initialize all given tasks to have priority set to stage 1
tasklistSchema.methods.postCreate = function postCreate() {
  if (
    this.stage1.length +
      this.stage2.length +
      this.stage3.length +
      this.stage4.length ===
    this.tasks.length
  )
    return;
  this.stage1 = new Array(this.tasks.length);
  this.stage2 = [];
  this.stage3 = [];
  this.stage4 = [];
  for (let i = 0; i < this.tasks.length; i++) {
    this.stage1[i] = i;
  }
};

tasklistSchema.statics.isStages = (stages, taskslength) => {
  if (
    typeof stages !== "object" ||
    stages === null ||
    typeof taskslength !== "number" ||
    !Array.isArray(stages.stage1) ||
    !Array.isArray(stages.stage2) ||
    !Array.isArray(stages.stage3) ||
    !Array.isArray(stages.stage4)
  )
    return false;
  if (
    stages.stage1.length +
      stages.stage2.length +
      stages.stage3.length +
      stages.stage4.length !==
      taskslength
  ) {
    return false;
  }
  // initialize all the required task indices to 0 so we only 
  // have to iterate through the keys object and can check
  // that all the initial arguments get overwritten
  var dictionary = {};
  for (let i = 0; i < taskslength; i++) {
    dictionary[i] = 0;
  }
  // concatenate all the lists of task indices and ensure that every task
  // index is accounted for
  let list = stages.stage1.concat(stages.stage2, stages.stage3, stages.stage4);
  for (let i = 0; i < list.length; i++) {
    dictionary[list[i]] = 1;
  }
  let keys = Object.keys(dictionary);
  // if there's an extra key that's bad
  if (keys.length !== taskslength) return false;
  for (let i = 0; i < keys.length; i++) {
    // if there's a key that didn't get overwritten that's bad
    if (dictionary[keys[i]] !== 1)
      return false;
  }
  return true;
};

const Tasklist = mongoose.model("Tasklist", tasklistSchema);

module.exports = { schema: tasklistSchema, model: Tasklist };
