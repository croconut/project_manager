const router = require("express").Router();
require("dotenv").config();

router.post("/", (req, res) => {
  // doubly ensure session does not persist in store
  req.session = null;
  res.clearCookie(process.env.SESSION_KEY).redirect("/")
  // for some reason cookie only clears on redirect :p
});

module.exports = router;
