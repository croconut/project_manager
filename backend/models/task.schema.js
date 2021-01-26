const mongoose = require("mongoose");

const TaskStage = ["To-Do", "Ongoing", "Complete", "Cancelled"];

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 1,
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
    defaut: "",
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
  stage: {
    type: String,
    enum: TaskStage,
    required: false,
    default: TaskStage[0],
  },
});

module.exports = { schema: taskSchema, stage: TaskStage };
