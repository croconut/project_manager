const mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;
const { TaskStage } = require("../staticData/ModelConstants");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  assignedUsername: {
    type: String,
    required: false,
    default: "",
  },
  // would be a font from the free font awesome icon set
  assignedUserIcon: {
    type: String,
    required: false,
    default: "",
  },
  description: {
    type: String,
    required: false,
    default: "",
    maxlength: 500,
  },
  due: {
    type: Date,
    required: false,
  },
});

taskSchema.statics.isTask = (task) => {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.name === "string" &&
    task.name !== ""
  );
};

taskSchema.statics.isCompleteTask = (task) => {
  return (
    taskSchema.statics.isTask(task) &&
    ObjectID.isValid(task._id) &&
    typeof task.assignedUsername === "string" &&
    typeof task.assignedUserIcon === "string" &&
    typeof task.description === "string"
  );
};

taskSchema.statics.isCompleteTaskArray = (tasks) => {
  if (!Array.isArray(tasks)) return false;
  for (let i = 0; i < tasks.length; i++) {
    if (!taskSchema.statics.isCompleteTask(tasks[i])) return false;
  }
  return true;
};

taskSchema.statics.isMinimumTaskArray = (tasks) => {
  if (!Array.isArray(tasks)) return false;
  for (let i = 0; i < tasks.length; i++) {
    if (!taskSchema.statics.isTask(tasks[i])) return false;
  }
  return true;
};

const Task = mongoose.model("Task", taskSchema);

module.exports = { schema: taskSchema, stage: TaskStage, model: Task };
