const bcrypt = require("bcrypt");
const router = require("express").Router();

router.route("/", (req, res) => {
  // on login, users use their username or email and password
  // for other routes they'll use their objectid and the
  // hashed password, saved in their cookie
  const { username, email, password } = req.body;
  if (!req.body.hasOwnProperty('email')) {
    //attempt login by username
    //on success
    //return their hash and objectid
    //on fail return error status + msg
    //status determines if username not found or 
    //if 
  }
  else {
    //attempt login by email
  }
});

module.exports = router;
