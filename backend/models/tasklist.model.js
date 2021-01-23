const mongoose = require("mongoose");
import task from "./task.model";

const tasklistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      minlength: 2,
    },
    todoTasks: [task],
    ongoingTasks: [task],
    completedTasks: [task],
    cancelledTasks: [task],
  },
  {
    timestamps: true,
  }
);

const Tasklist = mongoose.model("Tasklist", tasklistSchema);

module.exports = Tasklist;