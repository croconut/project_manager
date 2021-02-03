const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/user.model");

const session_coll = process.env.SESSION_COLLECTION;

router.post("/", async (req, res) => {
  const { username, token, password } = req.body;
  // like usual, early exit for missing fields
  // but also if the password wouldn't pass the regex
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
    {},
    // this doc shouldn't be sent in any responses
    async (err, doc) => {
      // possible fails: user not found, error, mismatched token
      // request too old, no token on user doc
      if (err)
        return res
          .status(503)
          .json({ failed: "likely server error", error: err });
      if (!doc) return res.status(400).json({ notFound: "user not found" });
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
        return res
          .status(403)
          .json({ overdue: "ran out of time to complete reset" });
      // need to gather doc id
      // and set the new pasword / reset the password reset fields
      userid = doc._id;
      // explicitly setting these fields only
      doc.password = password;
      doc.passwordReset = "";
      doc.passwordResetTime = new Date(1970, 1, 1);
      // MUST use save to use the pre save hook that changes the password
      // from whatever we got to the bcrypt version
      let error = null;
      const save = doc
        .save()
        .then()
        .catch((err) => {
          error = err;
        });
      // slightly tricky, need to do a mongodb level collection grab
      // to get the session store collection and delete any sessions
      // that have this user id stored AKA the session allows access
      // to this user
      // those sessions get deleted making all browser cookies for that user
      // invalid (important in case of compromise)
      const sessionCollection = mongoose.connection.db.collection(session_coll);
      const returnvalue = sessionCollection.deleteMany({
        "session.user._id": userid,
      });
      // the delete and the save can happen at the same time, should be fine
      // if it fails just resend
      await save;
      await returnvalue;
      // this is a promise... for some reason
      const deletedCount = (await returnvalue).deletedCount;
      if (error) {
        if (!deletedCount)
          return res.status(503).json({
            failed: "password change not saved",
            noDeletes: "no sessions were logged out",
          });
        return res.status(503).json({
          failed: "password change not saved",
          deletes: "other sessions were logged out",
        });
      }
      if (deletedCount) {
        return res.status(204).json({ success: "password changed!" });
      }
      // this is worst case scenario, unless of course
      // there just were no sessions for the user. which is very possible
      return res
        .status(202)
        .json({ noDeletes: "password changed but no sessions were deleted" });
    }
  );
});

module.exports = router;
