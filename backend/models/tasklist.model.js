const mongoose = require("mongoose");
const task = require("./task.model");

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
      unique: true,
      index: true,
      trim: true,
      minlength: 1,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    todoTasks: [task.schema],
    ongoingTasks: [task.schema],
    completedTasks: [task.schema],
    cancelledTasks: [task.schema],
  },
  {
    timestamps: true,
  }
);

const Tasklist = mongoose.model("Tasklist", tasklistSchema);

module.exports = { model: Tasklist, schema: tasklistSchema };
