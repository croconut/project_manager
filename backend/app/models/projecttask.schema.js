const mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;

const projectTaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 100,
  },
  // organization members assigned to this task
  // if an entry is $ALL, then it's all members
  // and other entries should be removed
  assignedUsers: {
    type: [String],
    required: false,
    default: [],
  },
  assignedIcons: {
    type: [String],
    required: false,
    default: [],
  },
  description: {
    type: String,
    required: false,
    default: "",
    maxlength: 500,
  },
  estimatedHours: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },
  actualHours: {
    type: Number,
    required: false,
    default: 0,
    min: 0,
  },
  due: {
    type: Date,
    required: false,
    default: new Date("1970"),
  },
  // (username, comment)
  comments: {
    type: [(String, String)],
    required: false,
    default: [],
  },
});

projectTaskSchema.statics.isTask = (task) => {
  return (
    typeof task === "object" &&
    task !== null &&
    typeof task.name === "string" &&
    task.name !== ""
  );
};

projectTaskSchema.statics.isCompleteTask = (task) => {
  return (
    projectTaskSchema.statics.isTask(task) &&
    ObjectID.isValid(task._id) &&
    Array.isArray(task.assignedUsers) &&
    Array.isArray(task.assignedIcons) &&
    Array.isArray(task.comments) &&
    typeof task.description === "string" &&
    typeof task.estimatedHours === "number" &&
    typeof task.actualHours === "number" &&
    (typeof task.due === "string" || typeof task.due === "object")
  );
};

projectTaskSchema.statics.isCompleteTaskArray = (tasks) => {
  if (!Array.isArray(tasks)) return false;
  for (let i = 0; i < tasks.length; i++) {
    if (!projectTaskSchema.statics.isCompleteTask(tasks[i])) return false;
  }
  return true;
};

projectTaskSchema.statics.isMinimumTaskArray = (tasks) => {
  if (!Array.isArray(tasks)) return false;
  for (let i = 0; i < tasks.length; i++) {
    if (!projectTaskSchema.statics.isTask(tasks[i])) return false;
  }
  return true;
};

const ProjectTask = mongoose.model("ProjectTask", projectTaskSchema);

module.exports = { schema: projectTaskSchema, model: ProjectTask };
