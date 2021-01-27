const router = require("express").Router();
require("dotenv").config();

router.post("/", (req, res) => {
  // doubly ensure session does not persist in store
  req.session.user = {};
  // for some reason cookie only clears on redirect :p
  res.clearCookie(process.env.SESSION_KEY)
    .redirect("/");
});

module.exports = router;
