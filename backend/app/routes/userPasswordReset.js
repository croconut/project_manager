const router = require("express").Router();
const User = require("../models/user.model");

router.post("/", async (req, res) => {
  // id and token params
  // body should only have a password field
  const { username, token, password } = req.body;
  if (!username || !token || !password) {
    return res.status(400).json({
      missing: "need username, token and password in body",
    });
  }
  User.findOne(
    { username: username },
    "_id passwordReset passwordResetTime",
    { lean: true },
    (err, doc) => {
      if (err || !doc)
        return res
          .status(400)
          .json({ notFound: "user not found, or application error" });
      if (doc.passwordReset === "") {
        return res
          .status(403)
          .json({ badRequest: "no token was found, new password denied" });
      }
      if (doc.passwordReset !== token)
        return res.status(403).json({ noMatch: "token did not match" });

      let maxDate = doc.passwordResetTime;
      maxDate.setHours(maxDate.getHours() + 1);
      if (maxDate < Date.now())
        // need to also update the user by resetting the resetTime and
        // the token
        return res
          .status(403)
          .json({ overdue: "ran out of time to complete reset" });
      User.updateOne(
        { username: username },
        {
          password: password,
          passwordReset: "",
          passwordResetTime: new Date(1970, 1, 1),
        },
        {},
        (err, doc) => {
          if (err || !doc) return res.status(500).json({ error: err });
          return res.status(204).json({ success: "password changed!" });
        }
      );
    }
  );
});

module.exports = router;
