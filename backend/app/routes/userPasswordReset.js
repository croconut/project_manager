const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");

const session_coll = process.env.SESSION_COLLECTION;

router.post("/", async (req, res) => {
  // id and token params
  // body should only have a password field
  const { username, token, password } = req.body;
  if (!username || !token || !password) {
    return res.status(400).json({
      missing: "need username, token and password in body",
    });
  }

  if (!User.passwordAcceptable(password))
    return res.status(400).json({
      weakPassword:
        "password must be 32 characters or 14 with capitals, lowercase and numbers",
    });
  let userid;
  await User.findOne(
    { username: username },
    "_id passwordReset passwordResetTime",
    { lean: true },
    async (err, doc) => {
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
      userid = doc._id;
      await User.updateOne(
        { username: username },
        {
          password: password,
          passwordReset: "",
          passwordResetTime: new Date(1970, 1, 1),
        },
        { lean: true },
        async (err, doc2) => {
          if (err || !doc2) return res.status(500).json({ error: err });
          const sessionCollection = await mongoose.connection.db.collection(
            session_coll
          );
          const returnvalue = await sessionCollection.deleteMany({
            "session.user._id": userid,
          });
          if (returnvalue.deletedCount)
            return res.status(204).json({ success: "password changed!" });
          return res.status(204).json({ noDeletes: "password changed but no sessions were deleted"});
        }
      );
    }
  );
});

module.exports = router;
