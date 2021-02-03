const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const emailVal = require("email-validator");
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
      minlength: 14,
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

const USER_REGEX = new RegExp("^[A-Za-z][a-zA-Z0-9-_]*$");

const PASSWORD_REGEX = new RegExp(
  `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9!@#$%^&*()_-]{14,128}$`
);

userSchema.statics.privateFields = () =>
  "-password -_id -passwordReset -passwordResetTime";
userSchema.statics.publicFields = () =>
  userSchema.statics.privateFields() + " -email -tasklists";

userSchema.statics.passwordAcceptable = (plaintext) =>
  plaintext.length >= 32 || PASSWORD_REGEX.test(plaintext);

userSchema.statics.validateUser = function(username) {
  return USER_REGEX.test(username);
};

userSchema.statics.validateEmail = function(email) {
  return emailVal.validate(email);
};

userSchema.methods.comparePassword = function (plaintext, callback) {
  return callback(null, bcrypt.compareSync(plaintext, this.password));
};

// this code is resilient to refactoring, don't bother
userSchema.path("username").validate(function (value) {
  return userSchema.statics.validateUser(value);
});

// this is a somewhat strict email validator, there will be valid
// emails that this won't like but oh well
userSchema.path("email").validate(function (value) {
  return userSchema.statics.validateEmail(value);
});

userSchema.path("password").validate(function (value) {
  return userSchema.statics.passwordAcceptable(value);
});

// if password gets updated :x
// IMPORTANT password updates are allowed on model level
// ROUTES must control when updates to password are allowed
// credit: https://codingshiksha.com/javascript/node-js-express-session-based-authentication-system-using-express-session-cookie-parser-in-mongodb/
// i know you want to... dont turn this into an arrow function
// it's reliant on the usage of this
function HashPassword(nextfn) {
  if (!this.isDirectModified("password")) return nextfn();
  this.password = bcrypt.hashSync(this.password, 10);
  nextfn();
}

// its tempting to try, but cannot use 'this' on updateOne
// basically do all password changes through save
userSchema.pre("save", HashPassword);

// TODO check whether this index should be $.name or just .name :o
userSchema.index({ _id: 1, "tasklists.$.name": 1 });

// all userschema changes must be before this line
const User = mongoose.model("User", userSchema);

module.exports = User;
