const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const tasklist = require("./tasklist.schema");

// by default: unique username and email required
// as users will be searchable by username / email
// and their profile url will be user/<username> ?
// probably dont need that tbh

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      minlength: 3,
    },
    // front end hashes it too, so creation constraints
    // will not be here
    password: {
      type: String,
      required: true,
    },
    passwordReset: {
      type: String,
      required: false,
      default: "",
    },
    passwordResetTime: {
      type: Date,
      required: false,
      default: new Date(1970, 1, 1),
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#fff",
    },
    tasklists: [tasklist.schema],
  },
  {
    timestamps: true,
  }
);

// if password gets updated :x
// IMPORTANT password updates are allowed on model level
// ROUTES must control when updates to password are allowed
// credit: https://codingshiksha.com/javascript/node-js-express-session-based-authentication-system-using-express-session-cookie-parser-in-mongodb/
userSchema.pre("save", function (nextfn) {
  if (!this.isDirectModified("password")) return nextfn();
  this.password = bcrypt.hashSync(this.password, 10);
  nextfn();
});

userSchema.methods.comparePassword = function (plaintext, callback) {
  return callback(null, bcrypt.compareSync(plaintext, this.password));
};

userSchema.statics.privateFields = () =>
  "-password -_id -passwordReset -passwordResetTime";
userSchema.statics.publicFields = () =>
  userSchema.statics.privateFields() + " -email -tasklists";

// TODO check whether this index should be $.name or just .name :o
userSchema.index({ _id: 1, "tasklists.$.name": 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
