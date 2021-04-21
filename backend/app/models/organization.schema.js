const mongoose = require("mongoose");

const orgSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 64,
    },
    owner: {
      type: String,
      required: true,
    },
    members: {
      type: [String],
      required: false,
      default: [],
    },
    icon: {
      type: String,
      default: "",
      maxlength: 100,
    },
    color: {
      type: String,
      default: "#fff",
      maxlength: 7,
    },
  },
  {
    timestamps: true,
  }
);

const NAME_REGEX = new RegExp("^[A-Za-z][a-zA-Z0-9_-]*$");

orgSchema.statics.validateName = function (name) {
  return NAME_REGEX.test(name);
};

// this code is resilient to refactoring, don't bother
orgSchema.path("name").validate(function (value) {
  return orgSchema.statics.validateName(value);
});

// all userschema changes must be before this line
const Organization = mongoose.model("Organization", orgSchema);

module.exports = Organization;
