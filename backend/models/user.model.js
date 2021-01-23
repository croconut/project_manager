const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// by default: unique username and email required
// as users will be searchable by username / email
// and their profile url will be user/<username> ?
// probably dont need that tbh

const userSchema = new Schema(
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
    // obviously the hashed password, so creation constraints
    // will not be here
    password: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#fff",
    }
  },
  {
    timestamps: true,
  }
);

// if password gets updated :x
// credit: https://codingshiksha.com/javascript/node-js-express-session-based-authentication-system-using-express-session-cookie-parser-in-mongodb/
userSchema.pre("save", function (nextfn) {
  if (!this.isDirectModified("password")) return nextfn();
  this.password = bcrypt.hashSync(this.password, 10);
  nextfn();
});

userSchema.methods.comparePassword = function (plaintext, callback) {
  return callback(null, bcrypt.compareSync(plaintext, this.password));
};

const User = mongoose.model("User", userSchema);

module.exports = User;
